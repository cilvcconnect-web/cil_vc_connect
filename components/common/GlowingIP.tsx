import React from 'react';

interface GlowingIPProps {
  ip?: string;
  className?: string;
}

const GlowingIP: React.FC<GlowingIPProps> = ({ ip, className = '' }) => {
  if (!ip) return null;

  const normalizedIp = ip.trim();
  
  if (normalizedIp.includes('112.133.201.')) {
    const parts = normalizedIp.split('.');
    const lastPart = parts[parts.length - 1] || '';
    const lastTwoSec = lastPart.slice(-2);
    
    return (
      <span 
        className={`inline-flex items-center font-mono font-black text-sm tracking-wider px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 [text-shadow:_0_0_10px_rgba(34,211,238,0.9)] dark:bg-cyan-950/40 animate-pulse ${className}`}
        style={{ boxShadow: '0 0 10px rgba(34, 211, 238, 0.2)' }}
        title={`IP: ${normalizedIp}`}
      >
        {lastTwoSec}
      </span>
    );
  }

  // Fallback if IP does not match the 112.133.201 subnet
  return <span className={`font-mono text-xs ${className}`}>{normalizedIp}</span>;
};

export default GlowingIP;
