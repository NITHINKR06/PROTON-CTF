import React, { useState, useEffect } from 'react';
import { getAdminUsers, getAdminUserDetails } from '../../services/api';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (userId: number) => {
    setDetailsLoading(true);
    try {
      const data = await getAdminUserDetails(userId);
      setUserDetails(data);
    } catch (err: any) {
      console.error('Failed to load user details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    loadUserDetails(user.id);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatTime = (ms: number): string => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-400 glow-text">
          User Management
        </h1>
        <button
          onClick={loadUsers}
          className="btn-terminal-secondary text-sm"
        >
          Refresh Users
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="text-green-500 font-bold">
            LOADING USERS<span className="blink">█</span>
          </span>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border-2 border-red-700 rounded-lg p-6 text-center">
          <h3 className="text-red-500 font-bold text-xl mb-2">ERROR</h3>
          <p className="text-red-400">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List */}
          <div className="lg:col-span-1 card-terminal p-4 max-h-[80vh] overflow-auto">
            <h3 className="text-green-500 font-bold mb-4 sticky top-0 bg-gray-900 py-2">
              Users ({users.length})
            </h3>
            
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    selectedUser?.id === user.id
                      ? 'bg-green-800 border-2 border-green-600'
                      : 'bg-black/50 border border-green-900 hover:bg-green-900/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-green-300">
                      {user.username}
                      {user.is_admin ? (
                        <span className="ml-2 text-xs bg-red-900 text-white px-2 py-0.5 rounded">
                          ADMIN
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-green-600">
                      ID: {user.id}
                    </div>
                  </div>
                  
                  <div className="text-sm text-green-600 mt-1">
                    {user.email}
                  </div>
                  
                  <div className="flex gap-4 mt-2 text-xs">
                    <div className="text-green-400">
                      {user.query_count} queries
                    </div>
                    {user.completed ? (
                      <div className="text-yellow-400">
                        Completed
                      </div>
                    ) : user.started ? (
                      <div className="text-blue-400">
                        In Progress
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        Not Started
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* User Details */}
          <div className="lg:col-span-2 card-terminal p-4 max-h-[80vh] overflow-auto">
            {selectedUser ? (
              detailsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <span className="text-green-500 font-bold">
                    LOADING DETAILS<span className="blink">█</span>
                  </span>
                </div>
              ) : userDetails ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-green-400 font-bold text-xl">
                      {userDetails.user.username}
                    </h3>
                    <div className="text-sm text-green-600">
                      Created: {formatDate(userDetails.user.created_at)}
                    </div>
                  </div>
                  
                  {/* Challenge Status */}
                  <div className="bg-black/50 border border-green-700 rounded-lg p-4">
                    <h4 className="text-green-500 font-bold mb-2">Challenge Status</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-green-600">Status</div>
                        <div className="font-bold">
                          {userDetails.user.completed ? (
                            <span className="text-yellow-400">Completed</span>
                          ) : userDetails.user.started ? (
                            <span className="text-blue-400">In Progress</span>
                          ) : (
                            <span className="text-gray-500">Not Started</span>
                          )}
                        </div>
                      </div>
                      
                      {userDetails.user.started && (
                        <>
                          <div>
                            <div className="text-xs text-green-600">Started At</div>
                            <div className="font-bold text-white">
                              {formatDate(new Date(userDetails.user.start_time).toISOString())}
                            </div>
                          </div>
                          
                          {userDetails.user.completed && (
                            <>
                              <div>
                                <div className="text-xs text-green-600">Completed At</div>
                                <div className="font-bold text-white">
                                  {formatDate(new Date(userDetails.user.completion_time).toISOString())}
                                </div>
                              </div>
                              
                              <div>
                                <div className="text-xs text-green-600">Time Taken</div>
                                <div className="font-bold text-yellow-400">
                                  {formatTime(userDetails.user.completion_time - userDetails.user.start_time)}
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Hint Usage */}
                  <div className="bg-black/50 border border-green-700 rounded-lg p-4">
                    <h4 className="text-green-500 font-bold mb-2">Hint Usage</h4>
                    <div className="space-y-2">
                      {userDetails.hintState.hintsOpened.length === 0 ? (
                        <p className="text-green-600">No hints used</p>
                      ) : (
                        userDetails.hintState.hintsOpened.map((hintId: number) => (
                          <div key={hintId} className="flex gap-2 items-center">
                            <div className="w-6 h-6 rounded-full bg-green-800 flex items-center justify-center text-xs font-bold">
                              {hintId}
                            </div>
                            <div className="text-green-300">
                              Hint {hintId} unlocked
                            </div>
                            {hintId === 1 && userDetails.hintState.firstHintOpenedAt && (
                              <div className="text-xs text-green-600">
                                at {formatDate(userDetails.hintState.firstHintOpenedAt)}
                              </div>
                            )}
                            {hintId === 2 && userDetails.hintState.secondHintOpenedAt && (
                              <div className="text-xs text-green-600">
                                at {formatDate(userDetails.hintState.secondHintOpenedAt)}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  {/* Recent Queries */}
                  <div>
                    <h4 className="text-green-500 font-bold mb-2">Recent Queries ({userDetails.queries.length})</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {userDetails.queries.length === 0 ? (
                        <p className="text-green-600">No queries executed</p>
                      ) : (
                        userDetails.queries.map((query: any) => (
                          <div 
                            key={query.id} 
                            className={`p-3 rounded border ${
                              query.flag_found 
                                ? 'border-yellow-500 bg-yellow-900/20' 
                                : 'border-green-900 bg-black/50'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <pre className="text-xs text-green-300 font-mono overflow-x-auto whitespace-pre-wrap max-w-2xl">
                                {query.query}
                              </pre>
                              <div className="flex flex-col items-end">
                                {query.flag_found && (
                                  <span className="text-xs bg-yellow-600 text-black px-2 py-0.5 rounded font-bold">
                                    FLAG FOUND
                                  </span>
                                )}
                                <span className="text-xs text-green-600 mt-1">
                                  {formatDate(query.created_at)}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 flex gap-4 text-xs text-green-600">
                              <div>{query.execution_time}ms</div>
                              <div>{query.row_count} rows</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-green-600">
                  Failed to load user details. Please try again.
                </div>
              )
            ) : (
              <div className="text-center py-12 text-green-600">
                Select a user to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};