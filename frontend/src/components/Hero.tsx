import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-dark-900 to-dark-900 border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600">
              SQL Injection
            </span>
            <br />
            <span className="text-white">CTF Challenge</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-dark-300 max-w-3xl mx-auto">
            Test your SQL skills by exploiting vulnerabilities to extract the hidden flag.
            Master the art of injection attacks in a safe, controlled environment.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <div className="card inline-flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-primary-400">500</div>
                <div className="text-sm text-dark-400">Points</div>
              </div>
            </div>
            <div className="card inline-flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-primary-400">Medium</div>
                <div className="text-sm text-dark-400">Difficulty</div>
              </div>
            </div>
            <div className="card inline-flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-primary-400">3</div>
                <div className="text-sm text-dark-400">Hints Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary-600 rounded-full opacity-5 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-primary-600 rounded-full opacity-5 blur-3xl"></div>
    </div>
  );
};