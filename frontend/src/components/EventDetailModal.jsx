import React, { useState } from 'react';
import { X, Calendar, MapPin, Ticket, ShieldCheck, AlertCircle, CheckCircle2, ChevronRight, User } from 'lucide-react';

export default function EventDetailModal({
  event,
  onClose,
  onPurchase,
  isProcessing
}) {
  if (!event) return null;

  const [selectedTicketId, setSelectedTicketId] = useState(
    event.ticket_types && event.ticket_types.length > 0 ? event.ticket_types[0].ticket_id : null
  );
  const [quantity, setQuantity] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedTier = (event.ticket_types || []).find(t => t.ticket_id === selectedTicketId);
  const availableQty = selectedTier ? selectedTier.available_qty : 0;
  const totalPrice = selectedTier ? Number(selectedTier.price) * quantity : 0;

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const handleQuantityChange = (delta) => {
    const next = quantity + delta;
    if (next >= 1 && next <= Math.min(availableQty, 10)) {
      setQuantity(next);
      setErrorMessage('');
    }
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!selectedTier) {
      setErrorMessage('Please select a ticket tier');
      return;
    }
    if (quantity > availableQty) {
      setErrorMessage(`Cannot exceed available quantity (${availableQty} left)`);
      return;
    }

    onPurchase({
      event_id: event.event_id,
      ticket_id: selectedTicketId,
      quantity,
      tier_name: selectedTier.name,
      total_amount: totalPrice
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-950/70 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Banner */}
        <div className="relative h-56 sm:h-64 w-full">
          <img
            src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          
          <div className="absolute bottom-4 left-6 right-6">
            <span className="badge-category mb-2">
              {event.category || 'Community Event'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Event Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Logistics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 text-xs">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-400 font-semibold block">Date & Schedule</span>
                <span className="text-white font-medium">{formattedDate}</span>
                <span className="text-slate-400 block">{formattedTime}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-400 font-semibold block">Venue & Location</span>
                <span className="text-white font-medium">{event.location}</span>
                <span className="text-slate-400 block">Cebu, Philippines</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold text-white mb-2">About This Event</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Ticket Selection (FR-005 & FR-007) */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-indigo-400" />
              Select Ticket Tier
            </h4>

            <div className="space-y-2.5">
              {(event.ticket_types || []).map(tier => {
                const isSelected = tier.ticket_id === selectedTicketId;
                const isSoldOut = tier.available_qty <= 0;

                return (
                  <div
                    key={tier.ticket_id}
                    onClick={() => {
                      if (!isSoldOut) {
                        setSelectedTicketId(tier.ticket_id);
                        setQuantity(1);
                        setErrorMessage('');
                      }
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSoldOut
                        ? 'opacity-50 bg-slate-900/50 border-slate-800 cursor-not-allowed'
                        : isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-indigo-400 bg-indigo-600' : 'border-slate-500'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{tier.name}</span>
                          {tier.price == 0 && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">FREE</span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">
                          {isSoldOut ? 'Sold out' : `${tier.available_qty} ticket(s) remaining`}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-white">
                        {tier.price == 0 ? '₱0.00' : `₱${Number(tier.price).toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector & Checkout Total */}
          {selectedTier && availableQty > 0 && (
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium block">Quantity</span>
                <span className="text-xs text-slate-500">(Max 10 per transaction)</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold flex items-center justify-center hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="w-6 text-center font-bold text-white text-base">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= Math.min(availableQty, 10)}
                  className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold flex items-center justify-center hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Modal Footer / Checkout Action */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 block">Total Amount Due</span>
              <span className="text-2xl font-black text-indigo-400">
                ₱{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <button
              onClick={handleCheckoutSubmit}
              disabled={isProcessing || !selectedTier || availableQty <= 0}
              className="w-full sm:w-auto btn-primary py-3 px-8 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing & Reserving...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm & Purchase ({quantity} Ticket{quantity > 1 ? 's' : ''})</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
