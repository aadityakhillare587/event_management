import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
  Ticket,
  ShieldCheck,
} from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking states
  const [tickets, setTickets] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await API.get(`/events/${id}`);
      if (data.success) {
        setEvent(data.data);
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Event not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleTicketChange = (val) => {
    if (!event) return;
    const count = parseInt(val, 10);
    if (isNaN(count)) {
      setTickets(1);
      return;
    }
    const clamped = Math.max(1, Math.min(count, event.availableSeats));
    setTickets(clamped);
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }

    if (!event || event.availableSeats < tickets) {
      setBookingError('Not enough seats available.');
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError('');
      const { data } = await API.post('/bookings', {
        eventId: event._id,
        numberOfTickets: tickets,
      });

      if (data.success) {
        setBookingSuccess(data.data);
        // Refresh local event state to reflect reduced seats
        setEvent((prev) => ({
          ...prev,
          availableSeats: prev.availableSeats - tickets,
        }));
      }
    } catch (err) {
      console.error('Booking failed:', err);
      const msg =
        err.response?.data?.message ||
        'Failed to complete booking. Please try again.';
      setBookingError(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium text-sm">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">
          {error || "The event you are looking for doesn't exist or has been removed."}
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>
      </div>
    );
  }

  const isSoldOut = event.availableSeats <= 0;
  const totalPrice = event.price * tickets;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>
      </div>

      {/* Main Grid: Details (Left) + Booking Box (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Event Overview */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Event Image with Category Badge */}
          <div className="relative rounded-3xl overflow-hidden shadow-md bg-gray-100 max-h-[460px]">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute top-4 left-4">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 text-indigo-700 backdrop-blur-md shadow">
                {event.category}
              </span>
            </div>
            {isSoldOut && (
              <div className="absolute top-4 right-4 bg-red-600 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-full shadow">
                Sold Out
              </div>
            )}
          </div>

          {/* Title and Key Details */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight mb-4">
              {event.title}
            </h1>

            {/* Quick Metadata badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 pb-6 border-b border-gray-200 dark:border-gray-800 text-sm">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-800">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Date</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{event.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-800">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Time</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{event.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-800">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Availability</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {event.availableSeats} seats left
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
            <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">Venue & Location</h4>
              <p className="text-sm text-indigo-900/80 dark:text-indigo-300/80 mt-0.5">{event.location}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">About This Event</h3>
            <div className="prose max-w-none text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line text-base">
              {event.description}
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              EventHub Guarantee
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
              <p>✓ 100% Verified venue & organizer credentials</p>
              <p>✓ Instant booking receipt & e-ticket generation</p>
              <p>✓ Hassle-free cancellation directly from your account</p>
              <p>✓ Dedicated 24/7 customer support team</p>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none space-y-6">
            <div className="flex items-baseline justify-between border-b border-gray-100 dark:border-gray-800 pb-5">
              <div>
                <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                  {event.price === 0 ? 'Free' : `₹${event.price}`}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5 font-medium">/ ticket</span>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    isSoldOut
                      ? 'bg-red-100 text-red-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {isSoldOut ? 'Sold Out' : `${event.availableSeats} seats remaining`}
                </span>
              </div>
            </div>

            {/* Booking Confirmation Box if booked */}
            {bookingSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-7 h-7 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-base font-bold text-emerald-950">
                      Booking Confirmed!
                    </h4>
                    <p className="text-xs text-emerald-700">
                      Receipt ID: #{bookingSuccess._id.substring(0, 8)}
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 rounded-xl p-3 text-xs space-y-1.5 text-emerald-900">
                  <div className="flex justify-between">
                    <span>Tickets Reserved:</span>
                    <strong className="font-semibold">{bookingSuccess.numberOfTickets}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Amount Paid:</span>
                    <strong className="font-semibold">₹{bookingSuccess.totalAmount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-bold text-emerald-600">
                      {bookingSuccess.status}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/my-bookings"
                    className="w-full py-3 px-4 rounded-xl text-center text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
                  >
                    View in My Bookings
                  </Link>
                  <button
                    onClick={() => setBookingSuccess(null)}
                    className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-semibold text-emerald-800 hover:bg-emerald-100/50 transition-colors"
                  >
                    Book Additional Tickets
                  </button>
                </div>
              </div>
            ) : (
              /* Booking Form */
              <div className="space-y-6">
                {bookingError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Ticket Counter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Select Number of Tickets
                  </label>
                  <div className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-2xl p-2 bg-gray-50/50 dark:bg-gray-800/50">
                    <button
                      type="button"
                      disabled={tickets <= 1 || isSoldOut}
                      onClick={() => handleTicketChange(tickets - 1)}
                      className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 dark:text-gray-200 shadow-sm transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="text-center">
                      <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{tickets}</span>
                      <span className="text-xs text-gray-400 block">
                        {tickets === 1 ? 'ticket' : 'tickets'}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={tickets >= event.availableSeats || isSoldOut}
                      onClick={() => handleTicketChange(tickets + 1)}
                      className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 dark:text-gray-200 shadow-sm transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="space-y-2.5 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>
                      ₹{event.price} × {tickets} {tickets === 1 ? 'ticket' : 'tickets'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Booking & Service Fees</span>
                    <span className="text-emerald-600 font-medium">Free (₹0)</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 dark:text-gray-100 pt-3 border-t border-gray-200 dark:border-gray-800">
                    <span>Total Amount</span>
                    <span className="text-indigo-600 dark:text-indigo-400 text-xl font-extrabold">
                      ₹{totalPrice}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                {isSoldOut ? (
                  <button
                    disabled
                    className="w-full py-4 rounded-2xl font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-center text-sm"
                  >
                    Event is Sold Out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleBooking}
                    disabled={bookingLoading}
                    className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-lg shadow-indigo-300 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group text-base"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Reserving Seats...</span>
                      </>
                    ) : isAuthenticated ? (
                      <>
                        <Ticket className="w-5 h-5" />
                        <span>Book Now</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Book</span>
                      </>
                    )}
                  </button>
                )}

                {!isAuthenticated && !isSoldOut && (
                  <p className="text-center text-xs text-gray-400">
                    You will be prompted to sign in before finalizing your reservation.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;

