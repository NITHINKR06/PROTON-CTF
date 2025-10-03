import React from 'react';

export const Instructions: React.FC = () => {
  return (
    <div className="card-terminal">
      <h2 className="text-xl font-bold gradient-text mb-4 flex items-center gap-2">
        <span className="text-cyan-500">▶</span> MISSION BRIEFING
      </h2>
      
      <div className="space-y-4 text-slate-700 text-sm">
        <section>
          <h3 className="text-cyan-700 font-bold mb-2">🎯 OBJECTIVE</h3>
          <p className="text-slate-600">
            You've gained access to an e-commerce database. Intelligence suggests 
            a FLAG is hidden deep within the system. Use advanced SQL injection 
            techniques to find and extract it.
          </p>
        </section>

        <section>
          <h3 className="text-cyan-700 font-bold mb-2">📊 INITIAL RECONNAISSANCE</h3>
          <div className="bg-white/80 border border-cyan-200 rounded-lg p-3 font-mono text-xs text-slate-600">
            <p className="font-semibold">Known tables:</p>
            <p className="ml-4">• products (product catalog)</p>
            <p className="ml-4">• categories (product categories)</p>
            <p className="ml-4">• reviews (customer reviews)</p>
            <p className="text-cyan-600 mt-2 italic">• [CLASSIFIED] - More tables exist...</p>
          </div>
        </section>

        <section>
          <h3 className="text-cyan-700 font-bold mb-2">⚠️ SECURITY MEASURES</h3>
          <ul className="list-disc list-inside space-y-1 ml-2 text-slate-600 text-xs">
            <li>System tables are protected</li>
            <li>Multiple decoy flags present</li>
            <li>Flag is encrypted and fragmented</li>
            <li>Comments are blocked</li>
            <li>Limited to SELECT statements</li>
          </ul>
        </section>

        <section>
          <h3 className="text-cyan-700 font-bold mb-2">🔍 MISSION PARAMETERS</h3>
          <ol className="list-decimal list-inside space-y-1 ml-2 text-slate-600">
            <li>Enumerate ALL database tables</li>
            <li>Identify tables containing sensitive data</li>
            <li>Locate flag segments (they're encrypted)</li>
            <li>Decrypt and assemble the complete flag</li>
          </ol>
        </section>

        <section className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3">
          <h3 className="text-amber-700 font-bold mb-1 flex items-center gap-2">
            <span>⚡</span> INTELLIGENCE REPORT
          </h3>
          <p className="text-slate-600 text-xs">
            The flag follows the format FLAG{`...`} but is stored in an 
            encrypted form. Look for configuration tables and audit logs. 
            The encryption might be simple but the location is not.
          </p>
        </section>

        <section className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-lg p-3">
          <h3 className="text-rose-600 font-bold mb-1 flex items-center gap-2">
            <span>🚨</span> WARNING
          </h3>
          <p className="text-rose-600 text-xs">
            This system contains multiple false flags. Verify your findings 
            carefully. The real flag is never stored in plain text.
          </p>
        </section>
      </div>
    </div>
  );
};
