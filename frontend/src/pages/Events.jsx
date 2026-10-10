import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api';
import EventCard from '../components/EventCard';
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Technology',
  'Music',
  'Business',
  'Workshop',
  'Arts',
  'Sports',
];

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'All'
  );
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get('date') || ''
  );

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (selectedDate) params.date = selectedDate;

      const { data } = await API.get('/events', { params });
      if (data.success) {
        setEvents(data.data);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Sync state whenever URL query params change
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Refetch when filters change
  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchEvents();
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedDate]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedDate('');
    setSearchParams({});
  };

  const hasActiveFilters =
    searchTerm !== '' || selectedCategory !== 'All' || selectedDate !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover What's Happening</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Explore All Events
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Browse through conferences, live shows, workshops, and gatherings
          </p>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="font-bold text-gray-900 dark:text-gray-100">{events.length}</span>{' '}
          {events.length === 1 ? 'event' : 'events'}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, description or location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 text-sm outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 text-sm outline-none transition-all font-medium text-gray-700 dark:text-gray-200 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Filter */}
          <div className="md:col-span-3">
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 text-sm outline-none transition-all text-gray-700 dark:text-gray-200"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="md:col-span-1 flex justify-end">
            {hasActiveFilters ? (
              <button
                onClick={handleClearFilters}
                className="w-full md:w-auto p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center"
                title="Reset filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-full md:w-auto p-2.5 text-gray-300 dark:text-gray-600 flex items-center justify-center">
                <Filter className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Category Pills for quick filtering */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Listing */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl h-96 border border-gray-100 animate-pulse p-4 flex flex-col justify-between"
            >
              <div>
                <div className="bg-gray-200 h-48 rounded-xl mb-4" />
                <div className="bg-gray-200 h-6 w-3/4 rounded mb-3" />
                <div className="bg-gray-200 h-4 w-full rounded mb-2" />
                <div className="bg-gray-200 h-4 w-2/3 rounded" />
              </div>
              <div className="bg-gray-200 h-10 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl text-center max-w-lg mx-auto">
          <p className="font-semibold text-base mb-2">Error Loading Events</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchEvents}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-xl mx-auto px-6">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            No events match your criteria
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Try adjusting your search terms, removing filters, or clearing the date.
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;

