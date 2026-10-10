import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Calendar,
  Ticket,
  IndianRupee,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';

const CATEGORIES = [
  'Technology',
  'Music',
  'Business',
  'Workshop',
  'Arts',
  'Sports',
];

const initialFormState = {
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  category: 'Technology',
  price: '',
  availableSeats: '',
  image: '',
};

const AdminDashboard = () => {
  const { user: currentAdmin } = useAuth();

  // Tab state: 'events' | 'bookings' | 'users'
  const [activeTab, setActiveTab] = useState('events');

  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });

  // Data states
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Event modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Search filter inside tables
  const [searchFilter, setSearchFilter] = useState('');

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [statsRes, eventsRes, bookingsRes, usersRes] = await Promise.all([
        API.get('/bookings/stats'),
        API.get('/events'),
        API.get('/bookings'),
        API.get('/auth/users'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (eventsRes.data.success) setEvents(eventsRes.data.data);
      if (bookingsRes.data.success) setBookings(bookingsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setFeedback({
        type: 'error',
        message: 'Failed to load some dashboard data. Check backend connection.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Open modal for Create Event
  const openCreateModal = () => {
    setIsEditing(false);
    setEditEventId(null);
    setFormData(initialFormState);
    setModalError('');
    setIsModalOpen(true);
  };

  // Open modal for Edit Event
  const openEditModal = (event) => {
    setIsEditing(true);
    setEditEventId(event._id);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      price: event.price,
      availableSeats: event.availableSeats,
      image: event.image,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setModalError('');
  };

  // Handle Event Form Submission (Create or Edit)
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (
      !formData.title ||
      !formData.description ||
      !formData.date ||
      !formData.time ||
      !formData.location ||
      !formData.category ||
      formData.price === '' ||
      formData.availableSeats === ''
    ) {
      setModalError('Please fill in all required fields.');
      return;
    }

    try {
      setModalSubmitting(true);

      if (isEditing) {
        // Update Event
        const { data } = await API.put(`/events/${editEventId}`, formData);
        if (data.success) {
          setEvents((prev) =>
            prev.map((evt) => (evt._id === editEventId ? data.data : evt))
          );
          setFeedback({
            type: 'success',
            message: 'Event updated successfully!',
          });
          closeModal();
        }
      } else {
        // Create Event
        const { data } = await API.post('/events', formData);
        if (data.success) {
          setEvents((prev) => [data.data, ...prev]);
          setStats((prev) => ({ ...prev, totalEvents: prev.totalEvents + 1 }));
          setFeedback({
            type: 'success',
            message: 'New event created successfully!',
          });
          closeModal();
        }
      }
    } catch (err) {
      console.error('Event submit error:', err);
      setModalError(
        err.response?.data?.message || 'Failed to save event. Try again.'
      );
    } finally {
      setModalSubmitting(false);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id, title) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${title}"? Associated bookings will also be removed.`
    );
    if (!confirmDelete) return;

    try {
      const { data } = await API.delete(`/events/${id}`);
      if (data.success) {
        setEvents((prev) => prev.filter((e) => e._id !== id));
        setStats((prev) => ({
          ...prev,
          totalEvents: Math.max(0, prev.totalEvents - 1),
        }));
        setFeedback({
          type: 'success',
          message: 'Event deleted successfully.',
        });
      }
    } catch (err) {
      console.error('Delete event error:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete event.',
      });
    }
  };

  // Update Booking Status
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const { data } = await API.put(`/bookings/${bookingId}`, {
        status: newStatus,
      });
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? data.data : b))
        );
        // Refresh stats
        const statsRes = await API.get('/bookings/stats');
        if (statsRes.data.success) setStats(statsRes.data.data);

        setFeedback({
          type: 'success',
          message: `Booking status changed to ${newStatus}.`,
        });
      }
    } catch (err) {
      console.error('Booking status update error:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update booking status.',
      });
    }
  };

  // Cancel / Delete Booking
  const handleDeleteBooking = async (bookingId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to cancel this booking and restore seats?'
    );
    if (!confirmDelete) return;

    try {
      const { data } = await API.delete(`/bookings/${bookingId}`);
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId ? { ...b, status: 'Cancelled' } : b
          )
        );
        // Refresh stats & events for restored seats
        const [statsRes, eventsRes] = await Promise.all([
          API.get('/bookings/stats'),
          API.get('/events'),
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (eventsRes.data.success) setEvents(eventsRes.data.data);

        setFeedback({
          type: 'success',
          message: 'Booking cancelled and seats restored.',
        });
      }
    } catch (err) {
      console.error('Cancel booking error:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to cancel booking.',
      });
    }
  };

  // Delete User
  const handleDeleteUser = async (userId, userName) => {
    if (userId === currentAdmin?._id) {
      alert('You cannot delete your own admin account.');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to remove user "${userName}"?`
    );
    if (!confirmDelete) return;

    try {
      const { data } = await API.delete(`/auth/users/${userId}`);
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        setStats((prev) => ({
          ...prev,
          totalUsers: Math.max(0, prev.totalUsers - 1),
        }));
        setFeedback({
          type: 'success',
          message: `User ${userName} deleted successfully.`,
        });
      }
    } catch (err) {
      console.error('Delete user error:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete user.',
      });
    }
  };

  // Filtered collections based on quick search
  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    e.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
    e.location.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredBookings = bookings.filter((b) =>
    (b.user?.name || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (b.user?.email || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (b.event?.title || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (b.status || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    u.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
    u.role.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 mb-2">
            Administrator Center
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time analytics, event coordination, ticket transactions, and user controls
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllData}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh dashboard data"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
        </div>
      </div>

      {/* Global Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-center justify-between border ${feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
            }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Users
            </p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">
              {stats.totalUsers}
            </h3>
            <span className="text-xs text-indigo-600 font-semibold mt-1 inline-block">
              Registered Accounts
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
        </div>

        {/* Total Events */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Events
            </p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">
              {stats.totalEvents}
            </h3>
            <span className="text-xs text-amber-600 font-semibold mt-1 inline-block">
              Active Listings
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calendar className="w-7 h-7" />
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Bookings
            </p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">
              {stats.totalBookings}
            </h3>
            <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">
              Confirmed Reservations
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Ticket className="w-7 h-7" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Revenue
            </p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">
              ₹{stats.totalRevenue.toLocaleString()}
            </h3>
            <span className="text-xs text-purple-600 font-semibold mt-1 inline-block">
              Gross Ticket Sales
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <IndianRupee className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActiveTab('events');
              setSearchFilter('');
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'events'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Manage Events ({events.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('bookings');
              setSearchFilter('');
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'bookings'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Manage Bookings ({bookings.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('users');
              setSearchFilter('');
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Manage Users ({users.length})</span>
          </button>
        </div>

        {/* In-table Search */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={`Filter ${activeTab}...`}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
        </div>
      </div>

      {/* Tab 1: Event Management */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Event Catalog</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Add, modify details, adjust seat capacity, or archive events
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/70 text-xs uppercase font-bold text-gray-500 tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Seats Left</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-400">
                      No events found.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => (
                    <tr key={event._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={event.image}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover shrink-0 bg-gray-100"
                          />
                          <div>
                            <p className="font-bold text-gray-900 line-clamp-1">
                              {event.title}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-1">
                              {event.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          {event.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <p className="font-semibold text-gray-800">{event.date}</p>
                        <p className="text-gray-400">{event.time}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-700 max-w-xs truncate">
                        {event.location}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {event.price === 0 ? 'Free' : `₹${event.price}`}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${event.availableSeats === 0
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-700'
                            }`}
                        >
                          {event.availableSeats}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(event)}
                            className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Event"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event._id, event.title)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Booking Management */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Booking Management</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Review all reservations, change booking statuses, or cancel tickets
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/70 text-xs uppercase font-bold text-gray-500 tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Tickets</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Booking Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-400">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const isCancelled = b.status === 'Cancelled';
                    return (
                      <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">
                            {b.user?.name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {b.user?.email || 'N/A'}
                          </p>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-800 max-w-xs truncate">
                          {b.event?.title || 'Event Removed'}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {b.numberOfTickets}
                        </td>
                        <td className="px-6 py-4 font-bold text-indigo-600">
                          ₹{b.totalAmount}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {b.bookingDate
                            ? new Date(b.bookingDate).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={b.status}
                            onChange={(e) =>
                              handleUpdateBookingStatus(b._id, e.target.value)
                            }
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${isCancelled
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!isCancelled && (
                            <button
                              onClick={() => handleDeleteBooking(b._id)}
                              className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 rounded-lg transition-colors"
                              title="Cancel & return seats"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">User Management</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Overview of all registered users and account management
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/70 text-xs uppercase font-bold text-gray-500 tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = u._id === currentAdmin?._id;
                    return (
                      <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                              {u.name ? u.name.charAt(0) : 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{u.name}</p>
                              {isSelf && (
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{u.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-700'
                              }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!isSelf && (
                            <button
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Create / Edit Event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Edit Event' : 'Create New Event'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mx-6 mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleEventSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. AI Innovations World Summit"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Location / Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g. San Francisco, CA"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    placeholder="e.g. 10:00 AM"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Ticket Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0 for free"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Available Seats *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.availableSeats}
                    onChange={(e) =>
                      setFormData({ ...formData, availableSeats: e.target.value })
                    }
                    placeholder="e.g. 200"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Description *
                </label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Comprehensive event details, keynote speakers, agendas, etc..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all disabled:opacity-60"
                >
                  {modalSubmitting
                    ? 'Saving...'
                    : isEditing
                      ? 'Save Changes'
                      : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

