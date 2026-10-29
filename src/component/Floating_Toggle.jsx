import React from 'react'
import { Sliders, Sparkles } from 'lucide-react'

const Floating_Toggle = ({
  activeTheme,
  customizeOpen,
  setCustomizeOpen,
  onBook,
}) => {
  return (
    <div>
      <div className="fixed right-0 top-1/3 z-40 flex flex-col space-y-2 transition-transform hover:-translate-x-1">
        <button
          onClick={() => setCustomizeOpen(!customizeOpen)}
          className="bg-white text-slate-800 shadow-xl border border-slate-200 pl-3 pr-4 py-3 sm:py-2.5 rounded-l-2xl flex items-center space-x-2 font-medium text-xs hover:bg-slate-50 transition"
        >
          <Sliders className="w-4 h-4 text-slate-600" />
          <span className="max-sm:hidden">Customize</span>
        </button>
        <button
          onClick={onBook}
          className={`${activeTheme.btn} shadow-xl pl-3 pr-4 py-3 sm:py-2.5 rounded-l-2xl flex items-center space-x-2 font-medium text-xs transition`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="max-sm:hidden">Try Now</span>
        </button>
      </div>
    </div>
  );
}

export default Floating_Toggle
