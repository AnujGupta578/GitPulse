const fs = require('fs');

const dirs = ['connections', 'architecture', 'commits', 'infrastructure', 'agents', 'sync', 'knowledge', 'settings', 'audit'];

dirs.forEach(d => {
  const dirPath = 'dashboard/src/app/' + d;
  fs.mkdirSync(dirPath, { recursive: true });

  fs.writeFileSync(dirPath + '/page.tsx', 
`export default function Page() {
  return (
    <div className="glass-card" style={{padding: '2rem'}}>
      <h2 style={{fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'capitalize'}}>${d}</h2>
      <p style={{color: 'var(--text-secondary)'}}>This module is currently being provisioned by the Orchestrator.</p>
    </div>
  );
}`);

  fs.writeFileSync(dirPath + '/loading.tsx', 
`export default function Loading() {
  return (
    <div className="glass-card" style={{padding: '2rem', animation: 'pulse 2s infinite', opacity: 0.7}}>
      <h2 style={{color: 'var(--accent-cyan)'}}>Synthesizing Environment...</h2>
    </div>
  );
}`);

  fs.writeFileSync(dirPath + '/error.tsx', 
`"use client";
export default function Error() {
  return (
    <div className="glass-card" style={{padding: '2rem', borderLeft: '4px solid var(--danger)'}}>
      <h2 style={{color: 'var(--danger)'}}>System Fault Detected</h2>
      <p style={{color: 'var(--text-secondary)'}}>The Orchestrator encountered an exception while parsing this domain.</p>
    </div>
  );
}`);
});

console.log('Successfully generated all route structures.');
