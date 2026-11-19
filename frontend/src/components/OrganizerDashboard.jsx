import React, { useState } from 'react';
import { DollarSign, Ticket, Users, TrendingUp, Download, Eye, Calendar, MapPin, ChevronRight, CheckCircle2 } from 'lucide-react';

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

  // Compute overall KPI metrics
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const totalTicketsSold = orders.reduce((sum, o) => sum + Number(o.quantity || 0), 0);
  const totalCapacity = events.reduce((sum, e) => sum + Number(e.capacity || 0), 0) + totalTicketsSold;
  const overallOccupancy = totalCapacity > 0 ? Math.round((totalTicketsSold / totalCapacity) * 100) : 0;

  // Filter attendees for selected event
  const currentEvent = events.find(e => e.event_id === selectedEventId);
  const eventOrders = selectedEventId ? orders.filter(o => o.event_id === selectedEventId) : orders;

  // FR-011: Export Attendee List as CSV
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
      
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Organizer Sales Dashboard
            </h1>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
              FR-010 Live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time analytics, revenue tracking, and attendee roster management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExportCSV(selectedEventId)}
            className="btn-secondary text-xs py-2.5 px-4"
            title="Download full attendee list as CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Attendees (CSV)</span>
          </button>

          <button
            onClick={onOpenCreateEvent}
            className="btn-primary text-xs py-2.5 px-4"
          >
            + Create New Event
          </button>
        </div>
      </div>

      {/* KPI Stats Cards (FR-010) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Revenue */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ₱{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> Live transactions
          </span>
        </div>

        {/* Card 2: Tickets Sold */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tickets Sold</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {totalTicketsSold}
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">
            Across {events.length} published events
          </span>
        </div>

        {/* Card 3: Active Events */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Events</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {events.length}
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">
            Cebu & Central Visayas
          </span>
        </div>

        {/* Card 4: Occupancy Rate */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Occupancy</span>
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {overallOccupancy}%
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">
            Inventory fill progress
          </span>
        </div>

      </div>

      {/* Events Performance Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Event Sales & Capacity Breakdown</h3>
            <p className="text-xs text-slate-400">Click an event to filter attendee list below</p>
          </div>
          {selectedEventId && (
            <button
              onClick={() => setSelectedEventId(null)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Reset Filter (Show All)
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
                    <td className="p-4 text-right font-extrabold text-white text-sm">
                      ₱{evRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportCSV(ev.event_id);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 border border-slate-700 inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3 text-emerald-400" />
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

      {/* Registered Attendees Roster (FR-011) */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Registered Attendee Roster (FR-011)
            </h3>
            <p className="text-xs text-slate-400">
              {currentEvent ? `Showing attendees for "${currentEvent.title}"` : 'Showing all verified ticket holders across all events'}
            </p>
          </div>

          <button
            onClick={() => handleExportCSV(selectedEventId)}
            className="btn-primary text-xs py-2 px-3.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export This Roster (.CSV)
          </button>
        </div>

        <div className="overflow-x-auto">
          {eventOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No attendees registered for this selection yet.
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
                {eventOrders.flatMap(o => 
                  (o.ticket_codes || ['ES-2026-N/A']).map((code, idx) => (
                    <tr key={`${o.order_id}-${idx}`} className="hover:bg-slate-800/30 text-slate-300">
                      <td className="p-4 font-bold text-white">{o.user_name || 'Juan Dela Cruz'}</td>
                      <td className="p-4 text-slate-400 font-mono text-[11px]">{o.user_email || 'attendee@citu.edu.ph'}</td>
                      <td className="p-4 text-slate-300 font-medium">{o.event_title}</td>
                      <td className="p-4">
                        <span className="badge-tag">{o.ticket_name}</span>
                      </td>
                      <td className="p-4 font-mono-code font-bold text-indigo-400">{code}</td>
                      <td className="p-4 text-slate-500">{new Date(o.date).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
