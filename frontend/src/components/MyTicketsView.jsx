import React from 'react';
import { Ticket, Calendar, MapPin, QrCode, ExternalLink } from 'lucide-react';

export default function MyTicketsView({ orders, onSelectOrder }) {
  return (
    <div className="space-y-6 pb-16">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          My Digital Passes & Tickets
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Your confirmed event reservations and entrance passes
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">No Tickets Purchased Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse published events and claim your tickets to see your passes here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map(order => (
            <div
              key={order.order_id}
              onClick={() => onSelectOrder(order)}
              className="ticket-wrapper p-6 border border-slate-700/80 hover:border-indigo-500/50 shadow-xl cursor-pointer transition-all hover:-translate-y-1 group relative"
            >
              <div className="ticket-notch-left" />
              <div className="ticket-notch-right" />

              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                    Order #{order.order_id}
                  </span>
                  <h3 className="text-lg font-extrabold text-white group-hover:text-indigo-400 transition-colors">
                    {order.event_title}
                  </h3>
                </div>
                <span className="badge-tag">
                  {order.ticket_name} (x{order.quantity})
                </span>
              </div>

              <div className="text-xs text-slate-400 mb-4 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Purchased on {new Date(order.date).toLocaleDateString()}</span>
              </div>

              <div className="ticket-perforation" />

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Verification Code
                  </span>
                  <span className="font-mono-code font-bold text-sm text-indigo-400">
                    {(order.ticket_codes || ['ES-2026-X89J2K'])[0]}
                  </span>
                  {order.ticket_codes && order.ticket_codes.length > 1 && (
                    <span className="text-[10px] text-slate-400 block">
                      +{order.ticket_codes.length - 1} more ticket(s)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold group-hover:text-indigo-300">
                  <span>View Pass</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
