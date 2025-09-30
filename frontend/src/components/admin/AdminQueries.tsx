import React, { useState, useEffect } from 'react';
import { getAdminQueries } from '../../services/api';

export const AdminQueries: React.FC = () => {
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filterFlagFound, setFilterFlagFound] = useState<boolean | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuery, setSelectedQuery] = useState<any | null>(null);

  useEffect(() => {
    loadQueries();
  }, [page, filterFlagFound]);

  const loadQueries = async () => {
    setLoading(true);
    try {
      const data = await getAdminQueries(page, 100, filterFlagFound);
      setQueries(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load queries');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const filteredQueries = queries.filter(query => 
    query.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-400 glow-text">
          SQL Query Logs
        </h1>
        <button
          onClick={loadQueries}
          className="btn-terminal-secondary text-sm"
        >
          Refresh Queries
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search queries..."
            className="w-full bg-black border-2 border-green-700 rounded px-3 py-2 text-green-300 focus:outline-none focus:border-green-500"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilterFlagFound(undefined)}
            className={`px-3 py-1 rounded text-sm ${
              filterFlagFound === undefined
                ? 'bg-green-700 text-white'
                : 'bg-black border border-green-700 text-green-500'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterFlagFound(true)}
            className={`px-3 py-1 rounded text-sm ${
              filterFlagFound === true
                ? 'bg-yellow-600 text-white'
                : 'bg-black border border-yellow-600 text-yellow-500'
            }`}
          >
            Flag Found
          </button>
          <button
            onClick={() => setFilterFlagFound(false)}
            className={`px-3 py-1 rounded text-sm ${
              filterFlagFound === false
                ? 'bg-red-700 text-white'
                : 'bg-black border border-red-700 text-red-500'
            }`}
          >
            No Flag
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="text-green-500 font-bold">
            LOADING QUERIES<span className="blink">█</span>
          </span>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border-2 border-red-700 rounded-lg p-6 text-center">
          <h3 className="text-red-500 font-bold text-xl mb-2">ERROR</h3>
          <p className="text-red-400">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Query List */}
          <div className="card-terminal p-4">
            <h3 className="text-green-500 font-bold mb-4">
              Queries ({filteredQueries.length})
            </h3>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {filteredQueries.length === 0 ? (
                <p className="text-green-600 text-center py-6">No queries found</p>
              ) : (
                filteredQueries.map((query) => (
                  <div
                    key={query.id}
                    onClick={() => setSelectedQuery(query)}
                    className={`p-3 rounded cursor-pointer transition-colors ${
                      selectedQuery?.id === query.id
                        ? query.flag_found
                          ? 'bg-yellow-900 border-2 border-yellow-600'
                          : 'bg-green-800 border-2 border-green-600'
                        : query.flag_found
                          ? 'bg-yellow-900/20 border border-yellow-600 hover:bg-yellow-900/30'
                          : 'bg-black/50 border border-green-900 hover:bg-green-900/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-mono text-sm text-green-300 overflow-hidden text-ellipsis whitespace-nowrap max-w-lg">
                        {query.query}
                      </div>
                      <div className="flex flex-col items-end ml-4">
                        {query.flag_found && (
                          <span className="text-xs bg-yellow-600 text-black px-2 py-0.5 rounded font-bold">
                            FLAG FOUND
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                      <span className="text-green-600">
                        User: <span className="text-green-400">{query.username}</span>
                      </span>
                      <span className="text-green-600">
                        Time: <span className="text-green-400">{query.execution_time}ms</span>
                      </span>
                      <span className="text-green-600">
                        Rows: <span className="text-green-400">{query.row_count}</span>
                      </span>
                      <span className="text-green-600">
                        {formatDate(query.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-terminal-secondary text-sm disabled:opacity-50"
              >
                Previous
              </button>
              
              <span className="text-green-500">
                Page {page}
              </span>
              
              <button
                onClick={() => setPage(page + 1)}
                disabled={queries.length < 100}
                className="btn-terminal-secondary text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
          
          {/* Query Details */}
          {selectedQuery && (
            <div className="card-terminal p-4">
              <h3 className="text-green-500 font-bold mb-4">Query Details</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs text-green-600 mb-1">Query</h4>
                  <pre className="bg-black p-3 rounded border border-green-900 text-green-300 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                    {selectedQuery.query}
                  </pre>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="text-xs text-green-600 mb-1">User</h4>
                    <div className="text-green-300">{selectedQuery.username}</div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs text-green-600 mb-1">Execution Time</h4>
                    <div className="text-green-300">{selectedQuery.execution_time}ms</div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs text-green-600 mb-1">Rows Returned</h4>
                    <div className="text-green-300">{selectedQuery.row_count}</div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs text-green-600 mb-1">Timestamp</h4>
                    <div className="text-green-300">{formatDate(selectedQuery.created_at)}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs text-green-600 mb-1">Status</h4>
                  <div className={`inline-block px-3 py-1 rounded text-sm font-bold ${
                    selectedQuery.flag_found
                      ? 'bg-yellow-600 text-black'
                      : 'bg-green-800 text-white'
                  }`}>
                    {selectedQuery.flag_found ? 'FLAG FOUND' : 'No Flag Found'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};