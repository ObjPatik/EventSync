import React from 'react';
import { User, Ticket, Calendar, ShieldCheck, QrCode, ExternalLink, ArrowRight, Clock, Award } from 'lucide-react';

export default function AttendeeDashboard({
  user,
  orders,
  onSelectOrder,
  onBrowseEvents
}) {
  // If not attendee
  if (user && user.role !== 'attendee') {
    return (
      <div className="p-12 text-center rounded-3xl border border-rose-500/30 bg-rose-950/20 max-w-xl mx-auto my-12">
        <h3 className="text-xl font-bold text-rose-300 mb-2">Access Restricted (RBAC Guard)</h3>
        <p className="text-xs text-slate-400 mb-6">
          This dashboard is reserved for users with the <strong>Attendee</strong> role. You are currently authenticated as <strong>{user.role.toUpperCase()}</strong>.
        </p>
      </div>
    );
  }

  const attendeeOrders = orders.filter(o => !user || o.user_id === user.user_id || o.user_email === user.email);
  const totalTickets = attendeeOrders.reduce((sum, o) => sum + (o.quantity || 1), 0);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Profile Section */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-xl font-black text-white">
                {user ? user.name.charAt(0) : 'A'}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{user ? user.name : 'Juan Dela Cruz'}</h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Attendee Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user ? user.email : 'cit.student@citu.edu.ph'}</p>
            </div>
          </div>

          <button
            onClick={onBrowseEvents}
            className="btn-primary text-xs py-2.5 px-5"
          >
            <span>Explore Upcoming Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Passes Claimed</span>
            <Ticket className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalTickets}</div>
          <span className="text-[10px] text-emerald-400 mt-1 block">Active entrance reservations</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Registered Events</span>
            <Calendar className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-black text-white">{attendeeOrders.length}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Cebu Community & Academic</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Account Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">Authenticated</div>
          <span className="text-[10px] text-slate-400 mt-1 block">JWT Session Secured</span>
        </div>

      </div>

      {/* Passes List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Your Active Entrance Passes</h2>
            <p className="text-xs text-slate-400">Present your unique verification code at the event entrance</p>
          </div>
        </div>

        {attendeeOrders.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
            <Ticket className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-white">No Tickets Claimed Yet</h4>
            <p className="text-xs text-slate-400 mb-4">Find an event in Cebu and claim your digital ticket pass.</p>
            <button onClick={onBrowseEvents} className="btn-secondary text-xs">
              Browse Events Feed
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attendeeOrders.map(order => (
              <div
                key={order.order_id}
                onClick={() => onSelectOrder(order)}
                className="ticket-wrapper p-5 border border-slate-700/80 hover:border-indigo-500/50 cursor-pointer transition-all hover:-translate-y-1 group relative shadow-lg"
              >
                <div className="ticket-notch-left" />
                <div className="ticket-notch-right" />

                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-indigo-400 block mb-0.5">
                      Order #{order.order_id}
                    </span>
                    <h3 className="text-base font-extrabold text-white group-hover:text-indigo-400 transition-colors">
                      {order.event_title}
                    </h3>
                  </div>
                  <span className="badge-tag">
                    {order.ticket_name} (x{order.quantity})
                  </span>
                </div>

                <div className="text-xs text-slate-400 mb-3">
                  Purchased on {new Date(order.date).toLocaleDateString()}
                </div>

                <div className="ticket-perforation" />

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Unique Verification Code (FR-009)
                    </span>
                    <span className="font-mono-code font-bold text-sm text-indigo-400">
                      {(order.ticket_codes || ['ES-2026-X89J2K'])[0]}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-indigo-400 font-semibold group-hover:text-indigo-300">
                    <span>View Pass</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
