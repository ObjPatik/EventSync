import React from 'react';
import { Calendar, MapPin, Users, Ticket, ArrowRight } from 'lucide-react';

export default function EventCard({ event, onSelect }) {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Calculate pricing range
  const prices = (event.ticket_types || []).map(t => Number(t.price));
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  // Calculate total tickets remaining
  const totalAvailable = (event.ticket_types || []).reduce((sum, t) => sum + (t.available_qty || 0), 0);
  const totalInitial = (event.ticket_types || []).reduce((sum, t) => sum + (t.initial_qty || t.available_qty || 0), 0) || (event.capacity || 100);
  const fillPercentage = totalInitial > 0 ? Math.round(((totalInitial - totalAvailable) / totalInitial) * 100) : 0;
  const isSoldOut = totalAvailable <= 0;

  return (
    <div className="glow-card bg-slate-900 rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-800/80">
      
      {/* Event Banner Image with Category & Status Badge */}
      <div className="relative h-48 w-full overflow-hidden group">
        <img
          src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />
        
        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="badge-category backdrop-blur-md">
            {event.category || 'Community'}
          </span>
        </div>

        {/* Status / Sold Out Pill */}
        <div className="absolute top-3 right-3">
          {isSoldOut ? (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/90 text-white uppercase tracking-wider">
              Sold Out
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900/80 text-emerald-400 backdrop-blur-md border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {totalAvailable} left
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Date & Time */}
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate} • {formattedTime}</span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">
            {event.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span>{event.location}</span>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {event.description}
          </p>
        </div>

        <div>
          {/* Capacity Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1.5">
              <span>Capacity Progress</span>
              <span>{fillPercentage}% Claimed</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  fillPercentage > 85 ? 'bg-rose-500' : fillPercentage > 50 ? 'bg-amber-400' : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(fillPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Price & Action */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Starting From</span>
              <span className="text-base font-extrabold text-white">
                {minPrice === 0 ? 'Free' : `₱${minPrice.toLocaleString()}`}
                {maxPrice > minPrice && <span className="text-xs text-slate-400 font-normal"> - ₱{maxPrice.toLocaleString()}</span>}
              </span>
            </div>

            <button
              onClick={() => onSelect(event)}
              disabled={isSoldOut}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSoldOut
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
              }`}
            >
              <span>{isSoldOut ? 'Sold Out' : 'Get Tickets'}</span>
              {!isSoldOut && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
