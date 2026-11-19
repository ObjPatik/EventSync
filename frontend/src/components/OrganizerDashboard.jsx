import React, { useState, useMemo } from 'react';
import { DollarSign, Ticket, Users, TrendingUp, Download, Eye, Calendar, MapPin, Search, Filter, Plus, CheckCircle2, ChevronRight, BarChart3, Building } from 'lucide-react';

export default function OrganizerDashboard({
  user,
  events,
  orders,
  onOpenCreateEvent
}) {
  // Requirement 3: Enforce Role-Based Access Control in Frontend
  if (user && user.role !== 'organizer') {
    return (
      <div className="p-12 text-center rounded-3xl border border-rose-500/30 bg-rose-950/20 max-w-xl mx-auto my-12">
        <h3 className="text-xl font-bold text-rose-300 mb-2">Access Restricted (RBAC Guard)</h3>
        <p className="text-xs text-slate-400 mb-4">
          This dashboard requires <strong>Organizer</strong> privileges. You are currently authenticated as an <strong>Attendee</strong>.
        </p>
        <span className="text-[11px] text-slate-500">
          Only event organizers can view sales dashboards and export attendee rosters.
        </span>
      </div>
    );
  }

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All');

  // Compute Overall KPI Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const totalTicketsSold = orders.reduce((sum, o) => sum + Number(o.quantity || 0), 0);
  const totalCapacity = events.reduce((sum, e) => sum + Number(e.capacity || 0), 0) + totalTicketsSold;
  const overallOccupancy = totalCapacity > 0 ? Math.round((totalTicketsSold / totalCapacity) * 100) : 0;

  // Selected event & orders
  const currentEvent = events.find(e => e.event_id === selectedEventId);
  const eventOrders = selectedEventId ? orders.filter(o => o.event_id === selectedEventId) : orders;

  // Filter attendees
  const filteredAttendees = useMemo(() => {
    return eventOrders.flatMap(o => 
      (o.ticket_codes || ['ES-2026-N/A']).map((code, idx) => ({
        order_id: o.order_id,
        user_name: o.user_name || 'Juan Dela Cruz',
        user_email: o.user_email || 'attendee@citu.edu.ph',
        event_title: o.event_title || (currentEvent ? currentEvent.title : 'Event'),
        ticket_name: o.ticket_name || 'General Admission',
        unique_code: code,
        date: o.date,
        total_amount: o.total_amount
      }))
    ).filter(item => {
      const matchQuery = 
        item.user_name.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
        item.user_email.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
        item.unique_code.toLowerCase().includes(attendeeSearch.toLowerCase());
      
      const matchTier = tierFilter === 'All' || item.ticket_name.toLowerCase().includes(tierFilter.toLowerCase());
      return matchQuery && matchTier;
    });
  }, [eventOrders, attendeeSearch, tierFilter, currentEvent]);

  // Export Attendees as CSV (FR-011)
  const handleExportCSV = (eventId) => {
    const targetOrders = eventId ? orders.filter(o => o.event_id === eventId) : orders;
    const targetEvent = events.find(e => e.event_id === eventId);
    
    let csvContent = 'Order ID,Event Title,Attendee Name,Attendee Email,Ticket Tier,Unique Verification Code,Purchase Date,Total Paid (PHP)\n';

    targetOrders.forEach(o => {
      (o.ticket_codes || ['N/A']).forEach(code => {
        csvContent += `${o.order_id},"${o.event_title || (targetEvent ? targetEvent.title : 'Event')}","${o.user_name || 'Attendee'}","${o.user_email || 'N/A'}","${o.ticket_name || 'General'}",${code},"${new Date(o.date).toLocaleDateString()}",${o.total_amount}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendees_${eventId ? `event_${eventId}` : 'all_events'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Organizer Header Profile */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 p-0.5 shadow-xl shadow-pink-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-2xl font-black text-white">
                {user ? user.name.charAt(0) : 'M'}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {user ? user.name : 'Mark Evon (Organizer)'}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                  Organizer Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {user ? user.email : 'mark.organizer@eventsync.ph'} • Real-Time Sales & Analytics Control Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExportCSV(selectedEventId)}
              className="btn-secondary text-xs py-2.5 px-4"
              title="Download attendee roster as CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onOpenCreateEvent}
              className="btn-primary text-xs py-2.5 px-5 shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            ₱{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> Live transactions
          </span>
        </div>

        {/* Tickets Sold */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tickets Sold</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalTicketsSold}</div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Across {events.length} published events
          </span>
        </div>

        {/* Active Events */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Events</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{events.length}</div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Cebu & Central Visayas
          </span>
        </div>

        {/* Overall Occupancy */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Occupancy</span>
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{overallOccupancy}%</div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Inventory fill progress
          </span>
        </div>

      </div>

      {/* Visual Sales & Capacity Performance Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              Event Sales & Capacity Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Click an event to filter attendee list below</p>
          </div>
          {selectedEventId && (
            <button
              onClick={() => setSelectedEventId(null)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
            >
              Show All Events
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Event Details</th>
                <th className="p-4">Date & Venue</th>
                <th className="p-4 text-center">Remaining / Total</th>
                <th className="p-4 text-right">Revenue (PHP)</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {events.map(ev => {
                const isSelected = ev.event_id === selectedEventId;
                const evOrders = orders.filter(o => o.event_id === ev.event_id);
                const evRevenue = evOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
                const evSold = evOrders.reduce((sum, o) => sum + Number(o.quantity || 0), 0);
                const remaining = (ev.ticket_types || []).reduce((s, t) => s + (t.available_qty || 0), 0);

                return (
                  <tr
                    key={ev.event_id}
                    onClick={() => setSelectedEventId(isSelected ? null : ev.event_id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-950/40 text-white' : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{ev.title}</div>
                      <span className="badge-tag mt-1">{ev.category || 'General'}</span>
                    </td>
                    <td className="p-4">
                      <div>{new Date(ev.date).toLocaleDateString()}</div>
                      <div className="text-slate-500 text-[11px]">{ev.location}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-indigo-400">{remaining} left</span>
                      <span className="text-slate-500 block text-[10px]">({evSold} sold)</span>
                    </td>
                    <td className="p-4 text-right font-black text-white text-sm">
                      ₱{evRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportCSV(ev.event_id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 border border-slate-700 inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        CSV
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendee Roster with Real-time Search & Filter (FR-011) */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Verified Registered Attendees (FR-011)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Showing {filteredAttendees.length} verified ticket holder(s)
              </p>
            </div>

            <button
              onClick={() => handleExportCSV(selectedEventId)}
              className="btn-primary text-xs py-2 px-4 shadow-md shadow-indigo-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Roster (.CSV)</span>
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by attendee name, email, or verification code..."
                value={attendeeSearch}
                onChange={e => setAttendeeSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={tierFilter}
                onChange={e => setTierFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="All">All Ticket Tiers</option>
                <option value="Early Bird">Early Bird</option>
                <option value="General">General Admission</option>
                <option value="VIP">VIP All-Access</option>
                <option value="Student">Student Hacker</option>
              </select>
            </div>
          </div>
        </div>

        {/* Attendee Table */}
        <div className="overflow-x-auto">
          {filteredAttendees.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              No matching attendees found for your search criteria.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">Attendee Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Event</th>
                  <th className="p-4">Tier</th>
                  <th className="p-4">Unique Code (FR-009)</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredAttendees.map((item, idx) => (
                  <tr key={`${item.order_id}-${idx}`} className="hover:bg-slate-800/40 text-slate-300 transition-colors">
                    <td className="p-4 font-bold text-white">{item.user_name}</td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">{item.user_email}</td>
                    <td className="p-4 text-slate-300 font-medium">{item.event_title}</td>
                    <td className="p-4">
                      <span className="badge-tag">{item.ticket_name}</span>
                    </td>
                    <td className="p-4 font-mono-code font-bold text-indigo-400">{item.unique_code}</td>
                    <td className="p-4 text-slate-500">{new Date(item.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
