import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Sparkles, MonitorPlay, Bot } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const location = useLocation();

  const links = [
    { name: '首页', path: '/', icon: Rocket },
    { name: 'AI创造工具', path: '/tools', icon: Sparkles },
    { name: 'AI课件工具', path: '/courseware', icon: MonitorPlay },
    { name: '产品中心', path: '/products', icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 border-b border-slate-200 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-primary text-white p-2.5 rounded-2xl group-hover:rotate-12 transition-transform duration-300 shadow-md">
                <Bot size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-bold text-2xl tracking-tight text-slate-900 leading-none">
                  探奇 <span className="text-primary font-black">AI</span>
                </h1>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                  Tanqi Planet
                </p>
              </div>
            </Link>

            {/* Nav Links - Desktop */}
            <nav className="hidden md:flex items-center gap-2">
              {links.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      'relative px-4 py-2 rounded-full font-medium text-sm transition-colors duration-200 flex items-center gap-2',
                      isActive ? 'text-primary' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute inset-0 bg-primary/10 rounded-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon size={16} />
                      {link.name}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="md:hidden">
                <div className="p-2 border rounded-md">
                    Menu
                </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col pt-6 pb-20">
        <Outlet />
      </main>

      <footer className="bg-white border-t py-12 px-8">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
            <p>© 2026 探奇具身教育 Tanqi Planet. All rights reserved.</p>
            <p className="mt-4 md:mt-0">让世界充满更多会玩又有创造力的人。</p>
         </div>
      </footer>
    </div>
  );
}
