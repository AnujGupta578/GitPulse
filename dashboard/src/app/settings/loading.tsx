export default function Loading() {
  return (
    <div className="glass-card" style={{padding: '2rem', animation: 'pulse 2s infinite', opacity: 0.7}}>
      <h2 style={{color: 'var(--accent-cyan)'}}>Synthesizing Environment...</h2>
    </div>
  );
}