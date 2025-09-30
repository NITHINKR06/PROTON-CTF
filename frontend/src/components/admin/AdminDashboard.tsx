import React from 'react';

interface AdminDashboardProps {
  stats: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats }) => {
  const formatTime = (seconds: number): string => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-400 glow-text">
        Admin Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* User Stats */}
        <div className="card-terminal p-4">
          <h3 className="text-green-500 font-bold mb-2">Users</h3>
          <div className="text-3xl text-white font-bold">{stats.users.total}</div>
          <div className="text-sm text-green-600 mt-1">
            {stats.users.admins} Admin{stats.users.admins !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Challenge Stats */}
        <div className="card-terminal p-4">
          <h3 className="text-green-500 font-bold mb-2">Challenges</h3>
          <div className="text-3xl text-white font-bold">
            {stats.challenges.completed}/{stats.challenges.started}
          </div>
          <div className="text-sm text-green-600 mt-1">
            {stats.challenges.completion_rate.toFixed(0)}% Completion Rate
          </div>
        </div>

        {/* Query Stats */}
        <div className="card-terminal p-4">
          <h3 className="text-green-500 font-bold mb-2">Queries</h3>
          <div className="text-3xl text-white font-bold">{stats.queries.totalQueries}</div>
          <div className="text-sm text-green-600 mt-1">
            From {stats.queries.uniqueUsers} Users
          </div>
        </div>

        {/* Flag Stats */}
        <div className="card-terminal p-4">
          <h3 className="text-green-500 font-bold mb-2">Flag Queries</h3>
          <div className="text-3xl text-white font-bold">{stats.queries.flagFoundQueries}</div>
          <div className="text-sm text-green-600 mt-1">
            {stats.queries.flagFoundQueries > 0 
              ? `${((stats.queries.flagFoundQueries / stats.queries.totalQueries) * 100).toFixed(2)}% of Queries`
              : 'No Flags Found Yet'}
          </div>
        </div>
      </div>

      {/* Completion Times */}
      <div className="card-terminal p-6">
        <h3 className="text-green-500 font-bold mb-4">Challenge Completion Times</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/50 border border-green-700 rounded-lg p-4 text-center">
            <div className="text-sm text-green-600">Average Time</div>
            <div className="text-2xl text-white font-bold mt-1">
              {formatTime(stats.completionTime.average)}
            </div>
          </div>
          
          <div className="bg-black/50 border border-green-700 rounded-lg p-4 text-center">
            <div className="text-sm text-green-600">Fastest Time</div>
            <div className="text-2xl text-white font-bold mt-1">
              {formatTime(stats.completionTime.fastest)}
            </div>
          </div>
          
          <div className="bg-black/50 border border-green-700 rounded-lg p-4 text-center">
            <div className="text-sm text-green-600">Slowest Time</div>
            <div className="text-2xl text-white font-bold mt-1">
              {formatTime(stats.completionTime.slowest)}
            </div>
          </div>
        </div>
      </div>

      {/* Query Performance */}
      <div className="card-terminal p-6">
        <h3 className="text-green-500 font-bold mb-4">Query Performance</h3>
        
        <div className="flex items-center mb-4">
          <div className="text-xl text-white font-bold">
            {stats.queries.averageExecutionTime.toFixed(2)}ms
          </div>
          <div className="ml-2 text-sm text-green-600">
            Average Query Execution Time
          </div>
        </div>
        
        <div className="w-full bg-black/50 h-8 rounded-full overflow-hidden border border-green-900">
          <div 
            className="bg-gradient-to-r from-green-700 to-green-500 h-full"
            style={{ width: `${Math.min(100, (stats.queries.flagFoundQueries / stats.challenges.started) * 100)}%` }}
          ></div>
        </div>
        <div className="mt-2 text-xs text-green-600">
          Flag discovery ratio: {stats.queries.flagFoundQueries} flags found from {stats.challenges.started} challenge attempts
        </div>
      </div>
    </div>
  );
};