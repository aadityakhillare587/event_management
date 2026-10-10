import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await API.get('/bookings/my');
      if (data.success) {
        setBookings(data.data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Unable to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this booking? The tickets will be released back to the event.'
    );
    if (!confirmCancel) return;

    try {
      setCancellingId(bookingId);
      setActionMessage(null);
      const { data } = await API.put(`/bookings/${bookingId}`, {
        status: 'Cancelled',
      });

      if (data.success) {
        setActionMessage({
          type: 'success',
          text: 'Booking cancelled successfully. Seats have been returned.',
        });
        // Update local state
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: 'Cancelled' } : b))
        );
      }
    } catch (err) {
      console.error('Cancel booking error:', err);
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to cancel booking.',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
            <Ticket className="w-3.5 h-3.5" />
            <span>Manage Reservations</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            My Bookings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            View your ticket receipts, event schedules, and reservation statuses
          </p>
        </div>

        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-sm font-semibold transition-colors self-start sm:self-auto"
        >
          <span>Discover More Events</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-center justify-between border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse flex flex-col md:flex-row gap-6"
            >
              <div className="bg-gray-200 dark:bg-gray-800 h-32 w-full md:w-48 rounded-xl shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="bg-gray-200 dark:bg-gray-800 h-6 w-2/3 rounded" />
                <div className="bg-gray-200 dark:bg-gray-800 h-4 w-1/2 rounded" />
                <div className="bg-gray-200 dark:bg-gray-800 h-4 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 text-center">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm px-6">
          <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No Bookings Yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            You haven’t reserved any event tickets yet. Explore upcoming summits, concerts, and workshops!
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none transition-all"
          >
            <span>Browse Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {bookings.map((booking) => {
            const evt = booking.event;
            const isCancelled = booking.status === 'Cancelled';

            return (
              <div
                key={booking._id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row"
              >
                {/* Event Image */}
                <div className="md:w-56 h-48 md:h-auto bg-gray-100 dark:bg-gray-800 relative shrink-0">
                  <img
                    src={
                      evt?.image ||
                      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={evt?.title || 'Event'}
                    className="w-full h-full object-cover"
                  />
                  {evt?.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/90 dark:bg-gray-900/90 text-indigo-700 dark:text-indigo-300 backdrop-blur-sm shadow-sm">
                      {evt.category}
                    </span>
                  )}
                </div>

                {/* Booking Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {evt?.title || 'Event Information Unavailable'}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 ${
                          isCancelled
                            ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {isCancelled ? (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            Cancelled
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            Confirmed
                          </>
                        )}
                      </span>
                    </div>

                    {/* Event metadata */}
                    <div className="flex flex-wrap gap-y-2 gap-x-5 text-xs text-gray-500 dark:text-gray-400 mb-4">
                      {evt?.date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span>{evt.date}</span>
                        </div>
                      )}
                      {evt?.time && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span>{evt.time}</span>
                        </div>
                      )}
                      {evt?.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span>{evt.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Financials & Actions */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400 block">Tickets</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                          {booking.numberOfTickets}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Total Paid</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                          ₹{booking.totalAmount}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Booked On</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                          {formatDate(booking.bookingDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {evt?._id && (
                        <Link
                          to={`/events/${evt._id}`}
                          className="px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        >
                          Event Info
                        </Link>
                      )}
                      {!isCancelled ? (
                        <button
                          type="button"
                          disabled={cancellingId === booking._id}
                          onClick={() => handleCancelBooking(booking._id)}
                          className="px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-white bg-red-50 dark:bg-red-950/40 hover:bg-red-600 dark:hover:bg-red-600 border border-red-200 dark:border-red-900/50 hover:border-red-600 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1"
                        >
                          {cancellingId === booking._id ? (
                            <span>Cancelling...</span>
                          ) : (
                            <span>Cancel Booking</span>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Reservation released
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;

