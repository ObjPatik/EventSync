// Initial Seed & Mock Data for EventSync
// Featuring Cebu Institute of Technology - University & Cebu Community Events

export const INITIAL_EVENTS = [
  {
    event_id: 1,
    org_id: 1,
    title: 'Cebu Tech Summit 2026',
    description: 'The premier technology conference in Central Visayas, bringing together software engineers, cloud architects, and tech founders.',
    date: '2026-12-15T09:00:00+08:00',
    location: 'Waterfront Cebu City Hotel & Casino, Lahug',
    capacity: 250,
    category: 'Technology',
    banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000',
    status: 'published',
    ticket_types: [
      { ticket_id: 1, name: 'Early Bird Ticket', price: 250.00, available_qty: 45, initial_qty: 50 },
      { ticket_id: 2, name: 'General Admission', price: 500.00, available_qty: 140, initial_qty: 150 },
      { ticket_id: 3, name: 'VIP All-Access Pass', price: 1200.00, available_qty: 48, initial_qty: 50 }
    ]
  },
  {
    event_id: 2,
    org_id: 1,
    title: 'CIT-U IT Hackathon & Innovation Expo',
    description: 'Annual 24-hour hackathon hosted by CIT University. Compete, build cutting-edge solutions, and win exciting prizes!',
    date: '2026-11-28T08:00:00+08:00',
    location: 'CIT-U Gymnasium, N. Bacalso Ave, Cebu City',
    capacity: 150,
    category: 'Academic',
    banner_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000',
    status: 'published',
    ticket_types: [
      { ticket_id: 4, name: 'Student Hacker Ticket', price: 0.00, available_qty: 95, initial_qty: 100 },
      { ticket_id: 5, name: 'Observer / Mentor Pass', price: 150.00, available_qty: 48, initial_qty: 50 }
    ]
  },
  {
    event_id: 3,
    org_id: 3,
    title: 'Sugbo Indie Music Fest',
    description: 'A night of vibrant local music featuring homegrown Cebuano indie bands, acoustic sets, and artisanal food pop-ups.',
    date: '2026-12-05T18:00:00+08:00',
    location: 'IT Park Garden Bloc, Cebu City',
    capacity: 300,
    category: 'Concert',
    banner_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1000',
    status: 'published',
    ticket_types: [
      { ticket_id: 6, name: 'General Admission', price: 300.00, available_qty: 180, initial_qty: 200 },
      { ticket_id: 7, name: 'VIP Backstage Pass', price: 800.00, available_qty: 95, initial_qty: 100 }
    ]
  },
  {
    event_id: 4,
    org_id: 1,
    title: 'Visayas Small Business Networking Night',
    description: 'Connect with local Cebu entrepreneurs, investors, and community leaders for collaboration, mentorship, and growth.',
    date: '2026-12-20T17:30:00+08:00',
    location: 'Oakridge Business Park, Mandaue City',
    capacity: 80,
    category: 'Business',
    banner_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000',
    status: 'published',
    ticket_types: [
      { ticket_id: 8, name: 'Standard Delegate Pass', price: 350.00, available_qty: 75, initial_qty: 80 }
    ]
  }
];

export const INITIAL_ORDERS = [
  {
    order_id: 1,
    user_id: 2,
    user_name: 'Juan Dela Cruz',
    user_email: 'cit.student@citu.edu.ph',
    event_id: 1,
    event_title: 'Cebu Tech Summit 2026',
    ticket_name: 'Early Bird Ticket',
    quantity: 1,
    total_amount: 250.00,
    date: '2026-11-10T14:32:00+08:00',
    ticket_codes: ['ES-2026-CEB-89X2']
  },
  {
    order_id: 2,
    user_id: 2,
    user_name: 'Maria Santos',
    user_email: 'maria.santos@gmail.com',
    event_id: 2,
    event_title: 'CIT-U IT Hackathon & Innovation Expo',
    ticket_name: 'Student Hacker Ticket',
    quantity: 2,
    total_amount: 0.00,
    date: '2026-11-12T10:15:00+08:00',
    ticket_codes: ['ES-2026-CIT-41K9', 'ES-2026-CIT-92M1']
  }
];

export const DEMO_USERS = {
  attendee: {
    user_id: 2,
    name: 'Juan Dela Cruz',
    email: 'cit.student@citu.edu.ph',
    role: 'attendee',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  },
  organizer: {
    user_id: 1,
    name: 'Mark Evon (Organizer)',
    email: 'mark.organizer@eventsync.ph',
    role: 'organizer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  }
};
