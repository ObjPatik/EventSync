import React, { useState } from 'react';
import { X, CheckCircle2, QrCode, Download, Mail, ExternalLink, Printer, Calendar, MapPin, Tag, Copy, Check, Share2 } from 'lucide-react';

export default function DigitalTicketModal({ order, onClose }) {
  if (!order) return null;

  const [activeTab, setActiveTab] = useState('ticket'); // 'ticket' or 'email-preview'
  const [copiedCode, setCopiedCode] = useState(null);

  const formattedDate = new Date(order.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Google Calendar URL generator
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(order.event_title)}&details=${encodeURIComponent(`EventSync Ticket #${order.order_id} - Verified Pass: ${(order.ticket_codes || [])[0]}`)}&location=${encodeURIComponent('Cebu, Philippines')}`;

  return (
    <div className="modal-overlay">
      <div className="modal-content bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-950/70 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Success Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 text-center border-b border-emerald-500/20">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-white">Booking Confirmed!</h3>
          <p className="text-xs text-slate-300 mt-1">
            Order #{order.order_id} • Digital passes registered in database
          </p>

          {/* Toggle between Ticket View & SendGrid Email View */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setActiveTab('ticket')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ticket'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Digital Pass
            </button>
            <button
              onClick={() => setActiveTab('email-preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'email-preview'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              SendGrid Receipt Preview
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8">

          {activeTab === 'ticket' ? (
            <div className="space-y-6">
              
              {/* Ticket Cards */}
              {(order.ticket_codes || ['ES-2026-DEMO-99']).map((code, index) => (
                <div key={index} className="ticket-wrapper p-6 border border-slate-700/80 shadow-2xl relative">
                  <div className="ticket-notch-left" />
                  <div className="ticket-notch-right" />

                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                        CIT-U IT342 Verified Gate Pass
                      </span>
                      <h4 className="text-lg font-black text-white leading-snug">
                        {order.event_title}
                      </h4>
                    </div>
                    <span className="badge-category">
                      {order.ticket_name}
                    </span>
                  </div>

                  {/* Logistics */}
                  <div className="grid grid-cols-2 gap-3 text-xs mb-4 text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Attendee</span>
                      <span className="font-semibold text-white">{order.user_name || 'Juan Dela Cruz'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Order Reference</span>
                      <span className="font-semibold text-white">#{order.order_id}</span>
                    </div>
                  </div>

                  {/* Perforation Line */}
                  <div className="ticket-perforation" />

                  {/* Bottom Verification Section: Unique Code & QR */}
                  <div className="flex items-center justify-between gap-4 pt-1 mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Unique Verification Code (FR-009)
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-black font-mono-code text-indigo-400 tracking-wider bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                          {code}
                        </div>
                        <button
                          onClick={() => handleCopyCode(code)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Copy Code"
                        >
                          {copiedCode === code ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-500 block mt-1">
                        Scan or present upon gate admission
                      </span>
                    </div>

                    {/* QR Code Graphic */}
                    <div className="w-16 h-16 rounded-xl bg-white p-2 flex items-center justify-center shadow-md flex-shrink-0">
                      <QrCode className="w-full h-full text-slate-900" />
                    </div>
                  </div>

                  {/* Barcode Graphic */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="barcode-lines opacity-70" />
                    <span className="text-[9px] font-mono text-slate-500 block text-center mt-1">
                      CITU-ES-AUTH-{order.order_id}-{code.slice(-4)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary text-xs w-full sm:flex-1 justify-center py-2.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Add to Calendar</span>
                </a>

                <button
                  onClick={handlePrint}
                  className="btn-secondary text-xs w-full sm:flex-1 justify-center py-2.5"
                >
                  <Printer className="w-3.5 h-3.5 text-pink-400" />
                  <span>Print Pass</span>
                </button>

                <button
                  onClick={onClose}
                  className="btn-primary text-xs w-full sm:flex-1 justify-center py-2.5"
                >
                  Done
                </button>
              </div>

            </div>
          ) : (
            /* SendGrid Receipt Preview */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                  <span><strong>From:</strong> tickets@eventsync.ph (via SendGrid API)</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 202 Delivered
                  </span>
                </div>
                <div><strong>To:</strong> {order.user_email || 'attendee@citu.edu.ph'}</div>
                <div><strong>Subject:</strong> Your Tickets for {order.event_title} [Order #{order.order_id}]</div>
              </div>

              {/* Simulated HTML Email Body */}
              <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-inner text-xs space-y-4 font-sans">
                <div className="border-b pb-4">
                  <h2 className="text-base font-black text-indigo-700">EventSync Digital Receipt</h2>
                  <p className="text-slate-500 text-[11px]">Thank you for supporting local community events.</p>
                </div>

                <div className="space-y-1.5">
                  <p><strong>Event:</strong> {order.event_title}</p>
                  <p><strong>Attendee:</strong> {order.user_name || 'Juan Dela Cruz'}</p>
                  <p><strong>Tier:</strong> {order.ticket_name} (x{order.quantity})</p>
                  <p><strong>Total Paid:</strong> ₱{Number(order.total_amount).toFixed(2)}</p>
                </div>

                <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">Your Gate Pass Codes:</span>
                  {(order.ticket_codes || []).map((c, i) => (
                    <div key={i} className="font-mono text-sm font-bold text-indigo-600 bg-white p-1.5 rounded border border-slate-300 inline-block mr-2 mb-1">
                      {c}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t text-[10px] text-slate-400 text-center">
                  Cebu Institute of Technology - University • IT342 EventSync Architecture
                </div>
              </div>

              <button
                onClick={onClose}
                className="btn-primary w-full justify-center text-xs py-2.5"
              >
                Close Receipt
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
