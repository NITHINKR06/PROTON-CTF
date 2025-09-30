import React from 'react';

export const Instructions: React.FC = () => {
  return (
    <div className="card-terminal">
      <h2 className="text-xl font-bold text-green-400 mb-4 glow-text flex items-center gap-2">
        <span className="text-green-500">▶</span> MISSION BRIEFING
      </h2>
      
      <div className="space-y-4 text-green-300 text-sm">
        <section>
          <h3 className="text-green-400 font-bold mb-2">🎯 OBJECTIVE</h3>
          <p className="text-green-500">
            You've gained access to an e-commerce database. Intelligence suggests 
            a FLAG is hidden deep within the system. Use advanced SQL injection 
            techniques to find and extract it.
          </p>
        </section>

        <section>
          <h3 className="text-green-400 font-bold mb-2">📊 INITIAL RECONNAISSANCE</h3>
          <div className="bg-black border border-green-900 rounded p-3 font-mono text-xs text-green-500">
            <p>Known tables:</p>
            <p className="ml-4">• products (product catalog)</p>
            <p className="ml-4">• categories (product categories)</p>
            <p className="ml-4">• reviews (customer reviews)</p>
            <p className="text-green-700 mt-2">• [CLASSIFIED] - More tables exist...</p>
          </div>
        </section>

        <section>
          <h3 className="text-green-400 font-bold mb-2">⚠️ SECURITY MEASURES</h3>
          <ul className="list-disc list-inside space-y-1 ml-2 text-green-600 text-xs">
            <li>System tables are protected</li>
            <li>Multiple decoy flags present</li>
            <li>Flag is encrypted and fragmented</li>
            <li>Comments are blocked</li>
            <li>Limited to SELECT statements</li>
          </ul>
        </section>

        <section>
          <h3 className="text-green-400 font-bold mb-2">🔍 MISSION PARAMETERS</h3>
          <ol className="list-decimal list-inside space-y-1 ml-2 text-green-500">
            <li>Enumerate ALL database tables</li>
            <li>Identify tables containing sensitive data</li>
            <li>Locate flag segments (they're encrypted)</li>
            <li>Decrypt and assemble the complete flag</li>
          </ol>
        </section>

        <section className="bg-yellow-900/20 border border-yellow-700 rounded p-3">
          <h3 className="text-yellow-400 font-bold mb-1 flex items-center gap-2">
            <span>⚡</span> INTELLIGENCE REPORT
          </h3>
          <p className="text-green-400 text-xs">
            The flag follows the format FLAG{`...`} but is stored in an 
            encrypted form. Look for configuration tables and audit logs. 
            The encryption might be simple but the location is not.
          </p>
        </section>

        <section className="bg-red-900/20 border border-red-700 rounded p-3">
          <h3 className="text-red-400 font-bold mb-1 flex items-center gap-2">
            <span>🚨</span> WARNING
          </h3>
          <p className="text-red-300 text-xs">
            This system contains multiple false flags. Verify your findings 
            carefully. The real flag is never stored in plain text.
          </p>
        </section>
      </div>
    </div>
  );
};