"use client";
export default function Error() {
  return (
    <div className="glass-card" style={{padding: '2rem', borderLeft: '4px solid var(--danger)'}}>
      <h2 style={{color: 'var(--danger)'}}>System Fault Detected</h2>
      <p style={{color: 'var(--text-secondary)'}}>The Orchestrator encountered an exception while parsing this domain.</p>
    </div>
  );
}