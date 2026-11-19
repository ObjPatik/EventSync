import React, { useState } from 'react';
import { Search, MapPin, Filter, Sparkles, Calendar, Layers } from 'lucide-react';
import EventCard from './EventCard';

const CATEGORIES = ['All', 'Technology', 'Academic', 'Concert', 'Business', 'Community'];

export default function EventDiscovery({ events, onSelectEvent, onOpenCreateEvent, currentRole }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesLocation = selectedLocation === 'All' || (event.location && event.location.toLowerCase().includes(selectedLocation.toLowerCase()));

    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero Banner Section */}
      <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 border border-indigo-500/20 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>CIT-U IT342 Systems Architecture Project</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Discover & Ticket <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              Local Community Events
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 mb-8 leading-relaxed">
            EventSync empowers Cebu organizers, university clubs, and community groups to host, sell, and verify digital tickets with real-time inventory locking and automated email receipts.
          </p>

          {/* Quick Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3 bg-slate-900/90 p-2 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md">
            <div className="flex-1 flex items-center gap-3 px-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search events, seminars, workshops, gigs..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-700/80 pt-2 sm:pt-0 sm:pl-3">
              <MapPin className="w-4 h-4 text-slate-400" />
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className="bg-transparent text-xs sm:text-sm text-slate-300 focus:outline-none cursor-pointer pr-3"
              >
                <option value="All" className="bg-slate-900 text-white">All Locations</option>
                <option value="Cebu City" className="bg-slate-900 text-white">Cebu City</option>
                <option value="Lahug" className="bg-slate-900 text-white">Lahug</option>
                <option value="IT Park" className="bg-slate-900 text-white">Cebu IT Park</option>
                <option value="Mandaue" className="bg-slate-900 text-white">Mandaue City</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-2">
          <Filter className="w-3.5 h-3.5" />
          Categories:
        </span>
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Upcoming Published Events
            </h2>
            <p className="text-xs text-slate-400">
              Showing {filteredEvents.length} active events in Cebu
            </p>
          </div>

          {currentRole === 'organizer' && (
            <button
              onClick={onOpenCreateEvent}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              + Post New Event
            </button>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
            <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">No events match your criteria</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Try adjusting your search terms or filter selection to find local events.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedLocation('All'); }}
              className="btn-secondary text-xs"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard
                key={event.event_id}
                event={event}
                onSelect={onSelectEvent}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
