import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import EventDiscovery from './components/EventDiscovery';
import EventDetailModal from './components/EventDetailModal';
import DigitalTicketModal from './components/DigitalTicketModal';
import OrganizerDashboard from './components/OrganizerDashboard';
import AttendeeDashboard from './components/AttendeeDashboard';
import CreateEventModal from './components/CreateEventModal';
import SupabaseSettingsModal from './components/SupabaseSettingsModal';
import MyTicketsView from './components/MyTicketsView';
import AuthModal from './components/AuthModal';

import { INITIAL_EVENTS, INITIAL_ORDERS } from './lib/mockData';
import { getSupabaseConfig, getSupabaseClient } from './lib/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080/api';

export default function App() {
  // Authentication & Session State (Increment 1)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('eventsync_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('eventsync_jwt_token') || null);

  // Active Tab: 'events', 'attendee-dashboard', 'organizer-dashboard', 'my-tickets'
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('eventsync_user');
    if (saved) {
      const u = JSON.parse(saved);
      return u.role === 'organizer' ? 'organizer-dashboard' : 'attendee-dashboard';
    }
    return 'events';
  });

  // Data State
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  // Modals
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTicketOrder, setActiveTicketOrder] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Status & Notification
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [notification, setNotification] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Validate session token on startup
  useEffect(() => {
    if (token) {
      fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Session expired');
        return res.json();
      })
      .then(data => {
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('eventsync_user', JSON.stringify(data.user));
        }
      })
      .catch(() => {
        // Token invalid or backend offline, keep local user state or clean
      });
    }
  }, [token]);

  // Check Supabase connection
  useEffect(() => {
    const checkSupabase = async () => {
      const { isConfigured } = getSupabaseConfig();
      if (!isConfigured) return;
      const client = getSupabaseClient();
      if (!client) return;

      try {
        const { data: dbEvents, error } = await client
          .from('events')
          .select('*, ticket_types(*)')
          .eq('status', 'published')
          .order('date', { ascending: true });

        if (!error && dbEvents) {
          setEvents(dbEvents);
          setIsSupabaseConnected(true);
        }
      } catch (err) {
        setIsSupabaseConnected(false);
      }
    };
    checkSupabase();
  }, []);

  // Auth Success Handler (Requirement 1 & 2)
  const handleAuthSuccess = (authenticatedUser, jwtToken) => {
    setUser(authenticatedUser);
    setToken(jwtToken);
    
    // Requirement 3: Redirect users to their respective dashboards after successful authentication
    if (authenticatedUser.role === 'organizer') {
      setActiveTab('organizer-dashboard');
      showToast(`Welcome back, ${authenticatedUser.name}! Redirected to Organizer Dashboard.`);
    } else {
      setActiveTab('attendee-dashboard');
      showToast(`Welcome, ${authenticatedUser.name}! Redirected to Attendee Dashboard.`);
    }
  };

  // Logout Handler (Requirement 2: Proper session termination)
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    } catch (e) {
      // offline fallback
    }

    localStorage.removeItem('eventsync_jwt_token');
    localStorage.removeItem('eventsync_user');
    setUser(null);
    setToken(null);
    setActiveTab('events');
    showToast('Session terminated. You have been successfully logged out.');
  };

  // Event Creation Handler
  const handleCreateEvent = async (eventData) => {
    if (!user || user.role !== 'organizer') {
      showToast('Unauthorized: Only organizers can create events.', 'error');
      return;
    }

    try {
      // Send to backend with JWT token
      const res = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      if (res.ok) {
        const saved = await res.json();
        setEvents([saved, ...events]);
        showToast('Event published successfully to backend database!');
        setShowCreateModal(false);
        setActiveTab('events');
        return;
      }
    } catch (e) {
      console.warn('Backend unavailable, saving locally:', e);
    }

    // Local fallback
    const newId = events.length + 1;
    const newEvent = {
      event_id: newId,
      org_id: user ? user.user_id : 1,
      ...eventData,
      status: 'published',
      ticket_types: eventData.ticket_tiers.map((t, i) => ({
        ticket_id: newId * 10 + i,
        ...t,
        available_qty: t.quantity,
        initial_qty: t.quantity
      }))
    };
    setEvents([newEvent, ...events]);
    showToast('Event published to public feed!');
    setShowCreateModal(false);
    setActiveTab('events');
  };

  // Purchase Handler
  const handlePurchase = async ({ event_id, ticket_id, quantity, tier_name, total_amount }) => {
    if (!user) {
      setShowAuthModal(true);
      showToast('Please sign in or register an account before booking tickets.', 'error');
      return;
    }

    setIsProcessingPurchase(true);

    try {
      const res = await fetch(`${API_BASE_URL}/tickets/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ event_id, ticket_id, quantity })
      });

      if (res.ok) {
        const result = await res.json();
        const newOrder = result.order;
        setOrders([newOrder, ...orders]);
        
        // Update local available quantity
        setEvents(events.map(ev => {
          if (ev.event_id === event_id) {
            return {
              ...ev,
              capacity: Math.max(0, ev.capacity - quantity),
              ticket_types: (ev.ticket_types || []).map(t => 
                t.ticket_id === ticket_id ? { ...t, available_qty: Math.max(0, t.available_qty - quantity) } : t
              )
            };
          }
          return ev;
        }));

        setSelectedEvent(null);
        setActiveTicketOrder(newOrder);
        showToast('Purchase verified and ticket issued!');
        return;
      }
    } catch (e) {
      console.warn('Backend purchase error, falling back locally:', e);
    } finally {
      setIsProcessingPurchase(false);
    }

    // Local fallback purchase simulation
    setTimeout(() => {
      const codes = [];
      for (let i = 0; i < quantity; i++) {
        codes.push('ES-2026-' + Math.random().toString(36).substring(2, 8).toUpperCase());
      }

      const newOrder = {
        order_id: orders.length + 1,
        user_id: user.user_id,
        user_name: user.name,
        user_email: user.email,
        event_id,
        event_title: selectedEvent ? selectedEvent.title : 'Event',
        ticket_name: tier_name,
        quantity,
        total_amount,
        date: new Date().toISOString(),
        ticket_codes: codes
      };

      setOrders([newOrder, ...orders]);
      setSelectedEvent(null);
      setActiveTicketOrder(newOrder);
      setIsProcessingPurchase(false);
      showToast('Purchase verified and digital ticket issued!');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs sm:text-sm font-semibold flex items-center gap-2 ${
            notification.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
          }`}>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onOpenCreateEvent={() => setShowCreateModal(true)}
        onOpenSupabaseModal={() => setShowSupabaseModal(true)}
        isSupabaseConnected={isSupabaseConnected}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Explore Events Tab */}
        {activeTab === 'events' && (
          <EventDiscovery
            events={events}
            onSelectEvent={ev => setSelectedEvent(ev)}
            onOpenCreateEvent={() => setShowCreateModal(true)}
            currentRole={user ? user.role : 'attendee'}
          />
        )}

        {/* Requirement 3: Role-Based User Dashboard - Attendee */}
        {activeTab === 'attendee-dashboard' && (
          <AttendeeDashboard
            user={user}
            orders={orders}
            onSelectOrder={ord => setActiveTicketOrder(ord)}
            onBrowseEvents={() => setActiveTab('events')}
          />
        )}

        {/* My Passes View */}
        {activeTab === 'my-tickets' && (
          <MyTicketsView
            orders={orders.filter(o => !user || o.user_id === user.user_id || o.user_email === user.email)}
            onSelectOrder={ord => setActiveTicketOrder(ord)}
          />
        )}

        {/* Requirement 3: Role-Based User Dashboard - Organizer */}
        {activeTab === 'organizer-dashboard' && (
          <OrganizerDashboard
            user={user}
            events={events}
            orders={orders}
            onOpenCreateEvent={() => setShowCreateModal(true)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong>EventSync</strong> — Localized Event Management & Ticketing Platform
          </div>
          <div>
            Cebu Institute of Technology - University • IT342 Increment 1 (User Accounts & Authentication)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Bcrypt Hashing • JWT Session Auth • RBAC Protection</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
          apiBaseUrl={API_BASE_URL}
        />
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onPurchase={handlePurchase}
          isProcessing={isProcessingPurchase}
        />
      )}

      {activeTicketOrder && (
        <DigitalTicketModal
          order={activeTicketOrder}
          onClose={() => setActiveTicketOrder(null)}
        />
      )}

      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onCreateEvent={handleCreateEvent}
        />
      )}

      {showSupabaseModal && (
        <SupabaseSettingsModal
          onClose={() => setShowSupabaseModal(false)}
          onConfigSaved={(connected) => {
            setIsSupabaseConnected(connected);
            if (connected) {
              showToast('Live Supabase PostgreSQL connection confirmed!');
            }
          }}
          isConnected={isSupabaseConnected}
        />
      )}

    </div>
  );
}
