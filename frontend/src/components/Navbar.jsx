import React from 'react';
import { Ticket, PlusCircle, LayoutDashboard, Database, UserCheck, Sparkles, LogIn, LogOut, User } from 'lucide-react';

export default function Navbar({
  user,
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  onLogout,
  onOpenCreateEvent,
  onOpenSupabaseModal,
  isSupabaseConnected
}) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => setActiveTab('events')}
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white">Event<span className="text-indigo-400">Sync</span></span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">CIT-U</span>
            </div>
            <p className="text-xs text-slate-400">IT342 Increment 1 • Auth & Role Access</p>
          </div>
        </div>

        {/* Dynamic Navigation Tabs based on Role */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'events'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Explore Events
          </button>

          {/* Attendee Dashboard Tab */}
          {user && user.role === 'attendee' && (
            <button
              onClick={() => setActiveTab('attendee-dashboard')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'attendee-dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Attendee Dashboard
            </button>
          )}

          {/* Attendee Passes Tab */}
          {user && user.role === 'attendee' && (
            <button
              onClick={() => setActiveTab('my-tickets')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'my-tickets'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              My Passes
            </button>
          )}

          {/* Organizer Dashboard Tab */}
          {user && user.role === 'organizer' && (
            <button
              onClick={() => setActiveTab('organizer-dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'organizer-dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Organizer Dashboard
            </button>
          )}
        </nav>

        {/* Right Tools & Auth Controls */}
        <div className="flex items-center gap-3">
          
          {/* Supabase Status Pill */}
          <button
            onClick={onOpenSupabaseModal}
            className={`hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-all ${
              isSupabaseConnected
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/30'
                : 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:bg-amber-900/30'
            }`}
            title="Configure Supabase Database"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="font-semibold">{isSupabaseConnected ? 'DB: Supabase' : 'DB: Local Persistent'}</span>
            <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          </button>

          {/* Organizer Create Event Quick Action */}
          {user && user.role === 'organizer' && (
            <button
              onClick={onOpenCreateEvent}
              className="btn-primary text-xs sm:text-sm py-2 px-3.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Create Event</span>
            </button>
          )}

          {/* Authentication Actions (Login/Logout) */}
          {user ? (
            <div className="flex items-center gap-2.5 bg-slate-900/90 p-1.5 pl-3 rounded-2xl border border-slate-700">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white leading-none">{user.name}</div>
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  {user.role}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 text-slate-300 transition-colors border border-slate-700/80"
                title="Logout (Terminate Session)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="btn-primary text-xs sm:text-sm py-2 px-4 flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
