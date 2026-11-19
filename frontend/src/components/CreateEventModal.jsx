import React, { useState } from 'react';
import { X, Calendar, MapPin, Tag, Plus, Trash2, Image, Layers, CheckCircle2 } from 'lucide-react';

export default function CreateEventModal({ onClose, onCreateEvent }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-12-15T09:00');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Technology');
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000');
  
  // Dynamic Ticket Tiers (FR-005)
  const [ticketTiers, setTicketTiers] = useState([
    { name: 'General Admission', price: '250', quantity: '50' }
  ]);

  const [error, setError] = useState('');

  const handleAddTier = () => {
    setTicketTiers([
      ...ticketTiers,
      { name: '', price: '0', quantity: '25' }
    ]);
  };

  const handleRemoveTier = (index) => {
    if (ticketTiers.length > 1) {
      setTicketTiers(ticketTiers.filter((_, i) => i !== index));
    }
  };

  const handleTierChange = (index, field, value) => {
    const updated = [...ticketTiers];
    updated[index][field] = value;
    setTicketTiers(updated);
  };

  const totalCapacity = ticketTiers.reduce((sum, t) => sum + (parseInt(t.quantity, 10) || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !date) {
      setError('Please fill in all required event details (Title, Date, and Location).');
      return;
    }

    const formattedTiers = ticketTiers.map(t => ({
      name: t.name.trim() || 'General Admission',
      price: parseFloat(t.price) || 0,
      quantity: parseInt(t.quantity, 10) || 50
    }));

    onCreateEvent({
      title,
      description,
      date: new Date(date).toISOString(),
      location,
      category,
      banner_url: bannerUrl,
      capacity: totalCapacity,
      ticket_tiers: formattedTiers
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content bg-slate-900 border border-slate-750 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-950/70 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white">Create & Publish New Event</h2>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
              FR-004 & FR-005
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fill in the event details and define capacity & ticket tiers
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Event Title */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Cebu Tech Startup Pitch Night"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Technology">Technology</option>
                <option value="Academic">Academic</option>
                <option value="Concert">Concert</option>
                <option value="Business">Business</option>
                <option value="Community">Community</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Schedule Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Location / Venue */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Venue / Location *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., CIT-U AVR 2, N. Bacalso Ave, Cebu City"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Description & Highlights
            </label>
            <textarea
              rows={3}
              placeholder="Provide event overview, schedule, speaker details, and requirements..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Banner Image URL */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Banner Image URL
            </label>
            <input
              type="url"
              value={bannerUrl}
              onChange={e => setBannerUrl(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Ticket Pricing Tiers & Capacity (FR-005) */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Ticket Capacity & Pricing Tiers (FR-005)
                </span>
                <span className="text-[11px] text-slate-400">
                  Total Capacity: <strong className="text-indigo-400">{totalCapacity} attendees</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddTier}
                className="px-2.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Tier
              </button>
            </div>

            <div className="space-y-2">
              {ticketTiers.map((tier, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Tier Name (e.g., VIP, Regular)"
                      value={tier.name}
                      onChange={e => handleTierChange(idx, 'name', e.target.value)}
                      className="w-full bg-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-white border border-slate-700 focus:outline-none"
                    />
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Price (₱)"
                      min="0"
                      value={tier.price}
                      onChange={e => handleTierChange(idx, 'price', e.target.value)}
                      className="w-full bg-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-white border border-slate-700 focus:outline-none text-right"
                    />
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={tier.quantity}
                      onChange={e => handleTierChange(idx, 'quantity', e.target.value)}
                      className="w-full bg-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-white border border-slate-700 focus:outline-none text-center"
                    />
                  </div>

                  {ticketTiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2.5 px-6"
            >
              Publish Event to Public Feed
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
