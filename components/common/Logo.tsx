import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`${className} relative flex-shrink-0`}>
        <svg 
            viewBox="0 0 200 200" 
            className="w-full h-full drop-shadow-sm"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="CIL VC Connect Logo"
        >
            {/* White Background Circle for consistency across light/dark modes */}
            <circle cx="100" cy="100" r="98" fill="white" />

            {/* Icon Group - Centered */}
            <g transform="translate(100, 80) scale(0.9)">
                 {/* Left Blue Arc */}
                <path d="M 0 -42 A 42 42 0 0 0 0 42" fill="none" stroke="#1e3a8a" strokeWidth="9" strokeLinecap="butt" />
                 {/* Right Green Arc */}
                <path d="M 0 -42 A 42 42 0 0 1 0 42" fill="none" stroke="#65a30d" strokeWidth="9" strokeLinecap="butt" />
                
                {/* Center Text VC */}
                <text x="0" y="12" textAnchor="middle" fill="#1e3a8a" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="32">VC</text>

                 {/* Blue Spokes (Left) */}
                 {[150, 170, 190, 210, 230, 250, 270, 290, 310, 330].map(a => (
                     <g key={`b-${a}`} transform={`rotate(${a})`}>
                         <line x1="50" y1="0" x2="62" y2="0" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />
                         <circle cx="68" cy="0" r="2.5" fill="#1e3a8a" />
                     </g>
                 ))}
                 
                 {/* Green Spokes (Right) */}
                 {[30, 50, 70, 90, 110, 130].map(a => (
                     <g key={`g-${a}`} transform={`rotate(${a})`}>
                         <line x1="50" y1="0" x2="62" y2="0" stroke="#65a30d" strokeWidth="3" strokeLinecap="round" />
                         <circle cx="68" cy="0" r="2.5" fill="#65a30d" />
                     </g>
                 ))}
            </g>

            {/* Text Group */}
            <g transform="translate(100, 155)">
                 {/* CIL VC Main Text */}
                 <text x="0" y="0" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="28" letterSpacing="1">
                     <tspan fill="#1e3a8a">CIL</tspan> <tspan fill="#65a30d">VC</tspan>
                 </text>
                 
                 {/* CONNECT Text with Wifi Symbol acting as E */}
                 <g transform="translate(0, 22) scale(1)">
                     {/* Split text to make room for icon */}
                     <text x="-12" y="0" textAnchor="end" fill="#4b5563" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="14" letterSpacing="1">CONN</text>
                     <text x="12" y="0" textAnchor="start" fill="#4b5563" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="14" letterSpacing="1">CT</text>
                     
                     {/* Wifi Icon (E) */}
                     <g transform="translate(0, -4) rotate(90) scale(0.6)">
                        <circle cx="0" cy="0" r="3" fill="#1e3a8a" />
                        <path d="M -7 -7 A 10 10 0 0 1 7 -7" fill="none" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />
                        <path d="M -13 -13 A 18 18 0 0 1 13 -13" fill="none" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />
                        <path d="M -19 -19 A 26 26 0 0 1 19 -19" fill="none" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />
                     </g>
                 </g>
            </g>
        </svg>
    </div>
  );
};

export default Logo;