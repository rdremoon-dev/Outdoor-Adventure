import React from 'react'
import { Compass, Menu, X } from 'lucide-react'

const Header = ({
  activeTheme,
  currentPage,
  setCurrentPage,
  mobileMenuOpen,
  setMobileMenuOpen,
  onBook,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F5F5F5]/80 backdrop-blur-sm border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <div
          onClick={() => setCurrentPage('home')}
          className="cursor-pointer flex items-center space-x-3 group"
        >
          <div
            className={`p-2.5 rounded-2xl ${activeTheme.bgLight} transition`}
          >
            <Compass className={`w-7 h-7 ${activeTheme.text}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:opacity-80 transition">
              OUTDOOR
            </span>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase -mt-1">
              ADVENTURE
            </span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center space-x-8">
          {[
            { id: 'home', label: 'Home' },
            { id: 'about', label: 'About Us' },
            { id: 'services', label: 'Services' },
            { id: 'projects', label: 'Projects' },
            { id: 'contact', label: 'Contact' },
          ].map(nav => (
            <button
              key={nav.id}
              onClick={() => setCurrentPage(nav.id)}
              className={`text-sm font-semibold transition relative py-1 ${
                currentPage === nav.id
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {nav.label}
              {currentPage === nav.id && (
                <span
                  className={`absolute bottom-0 left-0 right-0 h-[2.5px] ${activeTheme.btn.split(' ')[0]} rounded-full animate-in fade-in`}
                />
              )}
            </button>
          ))}
        </nav>

        <div className="hidden lg:flex items-center space-x-4">
          <button
            onClick={onBook}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 ${activeTheme.btn}`}
          >
            Take Action
          </button>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <div
        id="mobile-navigation"
        aria-hidden={!mobileMenuOpen}
        inert={mobileMenuOpen ? undefined : ''}
        className={`lg:hidden fixed right-0 top-20 z-50 h-[calc(100dvh-5rem)] w-4/5 max-w-sm overflow-y-auto bg-slate-950/80 backdrop-blur-xl border-l border-slate-700/50 px-6 py-6 shadow-xl transition-transform duration-300 ease-in-out motion-reduce:transition-none ${
          mobileMenuOpen
            ? 'translate-x-0'
            : 'translate-x-full pointer-events-none'
        }`}
      >
        {['home', 'about', 'services', 'projects', 'contact'].map(page => (
          <button
            key={page}
            onClick={() => {
              setCurrentPage(page);
              setMobileMenuOpen(false);
            }}
            className={`block w-full text-left py-2 font-semibold capitalize ${
              currentPage === page
                ? activeTheme.text
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => {
            setMobileMenuOpen(false);
            onBook();
          }}
          className={`w-full mt-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider ${activeTheme.btn}`}
        >
          Take Action
        </button>
      </div>
    </header>
  );
}

export default Header
