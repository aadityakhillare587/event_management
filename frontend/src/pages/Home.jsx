import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import EventCard from '../components/EventCard';
import {
  Calendar,
  Sparkles,
  Search,
  ArrowRight,
  TrendingUp,
  Cpu,
  Music2,
  Briefcase,
  PenTool,
  Palette,
  Trophy,
  ShieldCheck,
  Zap,
  Users,
} from 'lucide-react';

const categories = [
  { name: 'Technology', icon: Cpu, color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { name: 'Music', icon: Music2, color: 'bg-pink-50 text-pink-600 border-pink-100' },
  { name: 'Business', icon: Briefcase, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { name: 'Workshop', icon: PenTool, color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { name: 'Arts', icon: Palette, color: 'bg-purple-50 text-purple-600 border-purple-100' },
  { name: 'Sports', icon: Trophy, color: 'bg-orange-50 text-orange-600 border-orange-100' },
];

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeEvents = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/events');
        if (data.success) {
          setEvents(data.data);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
        setError('Unable to load upcoming events right now. Please verify backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeEvents();
  }, []);

  // Upcoming events (first 3) & popular events (next 3 or sorted)
  const upcomingEvents = events.slice(0, 3);
  const popularEvents = events.slice(3, 6).length > 0 ? events.slice(3, 6) : events.slice(0, 3);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        {/* Glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-violet-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs sm:text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Discover Unforgettable Moments Near You</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
            Find, Book & Experience{' '}
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-pink-400 bg-clip-text text-transparent">
              Extraordinary Events
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-indigo-100/90 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            From premier tech summits and live music festivals to creative workshops and sporting marathons. Seamless booking with instant ticket confirmation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/events"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-indigo-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Explore All Events</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all flex items-center justify-center"
            >
              Join EventHub
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 pt-10 border-t border-white/10 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-300">500+</p>
              <p className="text-xs sm:text-sm text-indigo-200 mt-1">Live Events</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-300">50K+</p>
              <p className="text-xs sm:text-sm text-indigo-200 mt-1">Happy Attendees</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-300">99.8%</p>
              <p className="text-xs sm:text-sm text-indigo-200 mt-1">Satisfaction Rate</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-300">Instant</p>
              <p className="text-xs sm:text-sm text-indigo-200 mt-1">E-Ticket Confirmation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
            Browse By Interest
          </p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Popular Categories</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Find events tailored specifically to your passions and hobbies
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/events?category=${encodeURIComponent(cat.name)}`}
                className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center text-center group hover:-translate-y-1.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 ${cat.color}`}
              >
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Calendar className="w-4 h-4" />
              <span>Don't Miss Out</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Upcoming Events</h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 group"
          >
            <span>View all events</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl h-80 border border-gray-100 dark:border-gray-800 animate-pulse p-4">
                <div className="bg-gray-200 dark:bg-gray-800 h-44 rounded-xl mb-4" />
                <div className="bg-gray-200 dark:bg-gray-800 h-5 w-3/4 rounded mb-2" />
                <div className="bg-gray-200 dark:bg-gray-800 h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 p-6 rounded-2xl text-center">
            <p className="font-medium">{error}</p>
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">No events found</h3>
            <p className="text-sm text-gray-400 mt-1">Check back soon for new event listings!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((evt) => (
              <EventCard key={evt._id} event={evt} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Events Section */}
      {events.length > 3 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Trending Now</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Popular Events</h2>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 group"
            >
              <span>Explore all</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularEvents.map((evt) => (
              <EventCard key={evt._id} event={evt} />
            ))}
          </div>
        </section>
      )}

      {/* Feature highlights */}
      <section className="bg-gray-100/70 dark:bg-gray-900/40 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Why Attendees Love EventHub</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Everything you need for effortless event discovery and seat reservation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Instant Ticket Confirmation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Book tickets in seconds with zero hassle. Receive instant confirmation and easily manage all reservations in your dashboard.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Verified & Secure</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                All organizers and venue details are verified. Your transactions and seat availability are secured in real-time.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Flexible Booking Control</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Change your mind? Cancel bookings with a single click and have tickets automatically released back to the event pool.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-700 text-white p-10 sm:p-14 relative overflow-hidden shadow-xl shadow-indigo-500/20">
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              Ready to explore your next memorable experience?
            </h2>
            <p className="text-indigo-100 text-base sm:text-lg mb-8 leading-relaxed">
              Create your account today, reserve seats at leading events, or manage your attendee tickets seamlessly.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/events"
                className="px-6 py-3.5 rounded-xl font-bold text-indigo-950 bg-white hover:bg-gray-100 shadow-md transition-all"
              >
                Browse Events Now
              </Link>
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-xl font-bold text-white bg-indigo-500 hover:bg-indigo-400 border border-white/20 transition-all"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

