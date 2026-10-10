import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';

const EventCard = ({ event }) => {
  const isSoldOut = event.availableSeats <= 0;
  const isFewSeatsLeft = event.availableSeats > 0 && event.availableSeats <= 10;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
      {/* Image & Category Badge */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/90 dark:bg-gray-900/90 text-indigo-700 dark:text-indigo-300 backdrop-blur-md shadow-sm">
            {event.category}
          </span>
        </div>

        {/* Seat Availability Badge */}
        <div className="absolute top-3 right-3">
          {isSoldOut ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm">
              Sold Out
            </span>
          ) : isFewSeatsLeft ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm animate-pulse">
              Only {event.availableSeats} left!
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-600 text-white shadow-sm flex items-center gap-1">
              <Users className="w-3 h-3" />
              {event.availableSeats} seats
            </span>
          )}
        </div>

        {/* Price tag */}
        <div className="absolute bottom-3 right-3 bg-gray-900/85 backdrop-blur-md text-white font-bold px-3 py-1 rounded-lg text-sm shadow">
          {event.price === 0 ? 'Free' : `₹${event.price}`}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 mb-2">
            {event.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
            {event.description}
          </p>

          <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 mb-5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Available: <strong className="text-gray-800 dark:text-gray-200">{event.availableSeats}</strong>
          </div>
          <Link
            to={`/events/${event._id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow shadow-indigo-100 dark:shadow-none transition-all group-hover:gap-2"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;

