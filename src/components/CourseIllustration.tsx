import { clsx } from "clsx";

export function CourseIllustration({ id, className }: { id: string, className?: string }) {
  switch (id) {
    case 'l1':
      return (
        <svg viewBox="0 0 400 300" className={clsx("w-full h-full", className)} xmlns="http://www.w3.org/2000/svg">
          <defs>
             <pattern id="grid1" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
            </pattern>
            <linearGradient id="l1-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#e11d48" stopOpacity="1"/>
            </linearGradient>
            <linearGradient id="l1-grad-light" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="1"/>
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="url(#grid1)" stroke="none" className="text-rose-500"/>
          
          <g transform="translate(200, 150) scale(1.2)">
            {/* Center Isometric Cube Base */}
            <path d="M 0 0 L 50 -25 L 0 -50 L -50 -25 Z" fill="url(#l1-grad-light)" />
            <path d="M -50 -25 L 0 0 L 0 50 L -50 25 Z" fill="#9f1239" opacity="0.5"/>
            <path d="M 0 0 L 50 -25 L 50 25 L 0 50 Z" fill="#be123c" opacity="0.8"/>
            
            {/* Top Block */}
            <g transform="translate(0, -40)">
              <path d="M 0 0 L 30 -15 L 0 -30 L -30 -15 Z" fill="#fecdd3" />
              <path d="M -30 -15 L 0 0 L 0 30 L -30 15 Z" fill="#fda4af" />
              <path d="M 0 0 L 30 -15 L 30 15 L 0 30 Z" fill="#fb7185" />
            </g>
            
            {/* Decorative Nodes */}
             <circle cx="0" cy="-70" r="4" fill="#fff" opacity="0.8" />
             <circle cx="50" cy="25" r="4" fill="#fff" opacity="0.6" />
             <circle cx="-50" cy="25" r="4" fill="#fff" opacity="0.6" />
          </g>
        </svg>
      );
    case 'l2':
      return (
        <svg viewBox="0 0 400 300" className={clsx("w-full h-full", className)} xmlns="http://www.w3.org/2000/svg">
          <defs>
             <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
            </pattern>
            <linearGradient id="l2-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#d97706" stopOpacity="1"/>
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="url(#grid2)" stroke="none" className="text-amber-500"/>
          
          <g transform="translate(200, 150)">
            {/* Big Gear */}
            <g stroke="#b45309" strokeWidth="4" fill="none" className="origin-center animate-[spin_10s_linear_infinite]">
                <circle cx="0" cy="0" r="40" fill="url(#l2-grad)" stroke="none" opacity="0.5"/>
                <circle cx="0" cy="0" r="40" />
                <circle cx="0" cy="0" r="15" fill="#fde68a" stroke="#d97706"/>
                {[...Array(8)].map((_, i) => (
                    <path key={i} d="M 0 -40 L 0 -50" strokeWidth="8" strokeLinecap="round" transform={`rotate(${i * 45})`} />
                ))}
            </g>
            {/* Small working Gear */}
            <g transform="translate(-65, 45) rotate(15)">
              <g stroke="#b45309" strokeWidth="3" fill="none" className="origin-center animate-[spin_5s_linear_infinite_reverse]">
                  <circle cx="0" cy="0" r="25" fill="#f59e0b" stroke="none" opacity="0.3"/>
                  <circle cx="0" cy="0" r="25" />
                  <circle cx="0" cy="0" r="8" fill="#fef3c7" stroke="#d97706"/>
                  {[...Array(6)].map((_, i) => (
                      <path key={i} d="M 0 -25 L 0 -32" strokeWidth="6" strokeLinecap="round" transform={`rotate(${i * 60})`} />
                  ))}
              </g>
            </g>
            
            {/* Abstract structure */}
            <path d="M 20 20 L 70 70 M -20 20 L -40 40 M 35 -35 L 60 -60" stroke="#fcd34d" strokeWidth="4" strokeLinecap="round" />
            <circle cx="70" cy="70" r="6" fill="#fde68a" />
            <circle cx="-40" cy="40" r="6" fill="#fde68a" />
            <circle cx="60" cy="-60" r="6" fill="#fde68a" />
          </g>
        </svg>
      );
    case 'l3':
      return (
        <svg viewBox="0 0 400 300" className={clsx("w-full h-full", className)} xmlns="http://www.w3.org/2000/svg">
          <defs>
             <pattern id="grid3" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
            </pattern>
            <linearGradient id="l3-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#059669" stopOpacity="1"/>
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="url(#grid3)" stroke="none" className="text-emerald-500"/>
          
          <g transform="translate(200, 150)">
            {/* Bulb / Brain abstract */}
            <path d="M 0 -60 C -40 -60 -50 -20 -30 10 C -20 25 -20 40 -20 40 L 20 40 C 20 40 20 25 30 10 C 50 -20 40 -60 0 -60 Z" fill="url(#l3-grad)" opacity="0.2"/>
            <path d="M 0 -60 C -40 -60 -50 -20 -30 10 C -20 25 -20 40 -20 40 L 20 40 C 20 40 20 25 30 10 C 50 -20 40 -60 0 -60 Z" fill="none" stroke="#34d399" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            
            {/* Bulb filaments/circuits */}
            <path d="M -10 40 L -10 20 L 0 0 L 10 20 L 10 40" stroke="#a7f3d0" fill="none" strokeWidth="3" strokeLinejoin="round"/>
            <circle cx="0" cy="0" r="5" fill="#6ee7b7" />
            
            {/* Connecting points */}
            <path d="M -15 50 L 15 50 M -10 60 L 10 60 L 0 70 Z" stroke="#34d399" fill="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>

            <g stroke="#6ee7b7" strokeWidth="2" fill="none" opacity="0.6">
               <path d="M -60 -20 L -80 -30 M -40 -50 L -60 -70 M 60 -20 L 80 -30 M 40 -50 L 60 -70 M 0 -75 L 0 -95" strokeLinecap="round"/>
               <circle cx="-85" cy="-32" r="3" fill="#6ee7b7"/>
               <circle cx="-65" cy="-75" r="3" fill="#6ee7b7"/>
               <circle cx="85" cy="-32" r="3" fill="#6ee7b7"/>
               <circle cx="65" cy="-75" r="3" fill="#6ee7b7"/>
               <circle cx="0" cy="-100" r="3" fill="#6ee7b7"/>
            </g>
          </g>
        </svg>
      );
    case 'l4':
      return (
        <svg viewBox="0 0 400 300" className={clsx("w-full h-full", className)} xmlns="http://www.w3.org/2000/svg">
          <defs>
             <pattern id="grid4" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
            </pattern>
            <linearGradient id="l4-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#2563eb" stopOpacity="1"/>
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="url(#grid4)" stroke="none" className="text-blue-500"/>
          
          <g transform="translate(200, 150)">
            {/* Rocket Shape */}
            <g transform="rotate(45) translate(0, -20)">
                <path d="M 0 -60 Q 20 -20 20 20 L -20 20 Q -20 -20 0 -60 Z" fill="url(#l4-grad)" stroke="#60a5fa" strokeWidth="3" strokeLinejoin="round"/>
                {/* Fins */}
                <path d="M 20 0 L 40 30 L 20 20 Z" fill="#93c5fd" />
                <path d="M -20 0 L -40 30 L -20 20 Z" fill="#3b82f6" />
                
                {/* Window */}
                <circle cx="0" cy="-10" r="8" fill="#1e3a8a" stroke="#bfdbfe" strokeWidth="2"/>
                
                {/* Flame */}
                <path d="M -10 20 Q 0 50 10 20 Z" fill="#fcd34d" />
            </g>

            {/* Orbiting element */}
            <g className="origin-center animate-[spin_8s_linear_infinite]">
              <ellipse cx="0" cy="0" rx="90" ry="30" fill="none" stroke="#93c5fd" strokeWidth="2" strokeDasharray="8 8" opacity="0.5"/>
              <circle cx="90" cy="0" r="5" fill="#60a5fa"/>
              <circle cx="-90" cy="0" r="3" fill="#bfdbfe"/>
            </g>
          </g>
        </svg>
      );
    default:
      return null;
  }
}
