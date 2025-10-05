import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { startChallenge, submitFlag, getChallengeStatus } from '../services/api';

interface ChallengeState {
  isStarted: boolean;
  startTime: number | null;
  completed: boolean;
  completionTime: number | null;
  score: number | null;
  loading: boolean;
}

interface FlagSubmitResult {
  success: boolean;
  message: string;
  isDummy?: boolean;
  hint?: string;
}

interface ChallengeContextType {
  challengeState: ChallengeState;
  startChallengeTimer: () => Promise<void>;
  submitFlagAnswer: (flag: string) => Promise<FlagSubmitResult>;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export const ChallengeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [challengeState, setChallengeState] = useState<ChallengeState>({
    isStarted: false,
    startTime: null,
    completed: false,
    completionTime: null,
    score: null,
    loading: true
  });

  // Load challenge status when user logs in
  useEffect(() => {
    if (user) {
      loadChallengeStatus();
    } else {
      setChallengeState({
        isStarted: false,
        startTime: null,
        completed: false,
        completionTime: null,
        score: null,
        loading: false
      });
    }
  }, [user]);

  const loadChallengeStatus = async () => {
    try {
      const status = await getChallengeStatus();
      setChallengeState({
        isStarted: status.isStarted,
        startTime: status.startTime,
        completed: status.completed,
        completionTime: status.completionTime,
        score: status.score,
        loading: false
      });
    } catch (error) {
      console.error('Failed to load challenge status:', error);
      setChallengeState(prev => ({ ...prev, loading: false }));
    }
  };

  const startChallengeTimer = async () => {
    try {
      const result = await startChallenge();
      setChallengeState(prev => ({
        ...prev,
        isStarted: true,
        startTime: result.startTime,
      }));
      return;
    } catch (error: any) {
      console.error('Failed to start challenge:', error);
      throw error;
    }
  };

  const submitFlagAnswer = async (flag: string): Promise<FlagSubmitResult> => {
    try {
      const result = await submitFlag(flag);
      
      if (result.success) {
        setChallengeState(prev => ({
          ...prev,
          completed: true,
          completionTime: result.completionTime,
          score: result.score
        }));
      }
      
      return {
        success: result.success,
        message: result.message,
        isDummy: result.isDummy,
        hint: result.hint
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to submit flag'
      };
    }
  };

  return (
    <ChallengeContext.Provider value={{ 
      challengeState, 
      startChallengeTimer,
      submitFlagAnswer
    }}>
      {children}
    </ChallengeContext.Provider>
  );
};

export const useChallengeState = () => {
  const context = useContext(ChallengeContext);
  if (!context) {
    throw new Error('useChallengeState must be used within ChallengeProvider');
  }
  return context;
};