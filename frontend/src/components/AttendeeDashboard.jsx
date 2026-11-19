import React, { useState } from 'react';
import { User, Ticket, Calendar, ShieldCheck, QrCode, ExternalLink, ArrowRight, Copy, Check, Clock, Sparkles, MapPin } from 'lucide-react';

export default function AttendeeDashboard({
  user,
  orders,
  onSelectOrder,
  onBrowseEvents
}) {
  const [copiedCode, setCopiedCode] = useState(null);

  // RBAC Guard
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
  const totalSpent = attendeeOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Attendee Profile Hero Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-xl shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-2xl font-black text-white">
                {user ? user.name.charAt(0) : 'A'}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {user ? user.name : 'Juan Dela Cruz'}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  CIT-U Attendee
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <span>{user ? user.email : 'cit.student@citu.edu.ph'}</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">Session Active (JWT)</span>
              </p>
            </div>
          </div>

          <button
            onClick={onBrowseEvents}
            className="btn-primary text-xs sm:text-sm py-2.5 px-5 shadow-lg shadow-indigo-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Discover Events in Cebu</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Digital Passes</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{totalTickets}</div>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 block">Verified for entrance</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Events Attending</span>
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{attendeeOrders.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Academic & Community gatherings</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Booking Value</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">₱{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Zero service charge</span>
        </div>

      </div>

      {/* Digital Passes Wallet */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Ticket className="w-5 h-5 text-indigo-400" />
              My Digital Entrance Passes
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Present your unique verification code or QR pass at the gate
            </p>
          </div>
        </div>

        {attendeeOrders.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/40">
            <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No Tickets Claimed Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
              Explore upcoming university hackathons, seminars, and concerts in Cebu.
            </p>
            <button onClick={onBrowseEvents} className="btn-secondary text-xs">
              Browse Discovery Feed
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {attendeeOrders.map(order => (
              <div
                key={order.order_id}
                className="ticket-wrapper p-6 border border-slate-700/80 shadow-2xl relative group hover:border-indigo-500/40 transition-all"
              >
                <div className="ticket-notch-left" />
                <div className="ticket-notch-right" />

                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                      CIT-U EventSync Verified Gate Pass
                    </span>
                    <h3 className="text-lg font-extrabold text-white leading-snug">
                      {order.event_title}
                    </h3>
                  </div>
                  <span className="badge-category">
                    {order.ticket_name} (x{order.quantity})
                  </span>
                </div>

                <div className="text-xs text-slate-400 mb-4 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Purchased on {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                {/* Perforation */}
                <div className="ticket-perforation" />

                {/* Verification Code Box & Barcode */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Verification Code (FR-009)
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-black font-mono-code text-indigo-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                        {(order.ticket_codes || ['ES-2026-X89J2K'])[0]}
                      </div>
                      
                      <button
                        onClick={() => handleCopyCode((order.ticket_codes || ['ES-2026-X89J2K'])[0])}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        title="Copy ticket code"
                      >
                        {copiedCode === (order.ticket_codes || ['ES-2026-X89J2K'])[0] ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-500 block mt-1">
                      Show at entrance gate
                    </span>
                  </div>

                  {/* QR Pass Action */}
                  <div 
                    onClick={() => onSelectOrder(order)}
                    className="p-2 rounded-xl bg-white cursor-pointer hover:opacity-90 transition-opacity shadow-md"
                    title="Click to view full pass"
                  >
                    <QrCode className="w-12 h-12 text-slate-900" />
                  </div>
                </div>

                {/* Bottom Trigger */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Order #{order.order_id}</span>
                  <button
                    onClick={() => onSelectOrder(order)}
                    className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                  >
                    <span>View Pass & Receipt</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
