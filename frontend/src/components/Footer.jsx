import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Mail, MapPin, Phone, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-xl font-bold text-white">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <Calendar className="w-5 h-5" />
              </div>
              <span>EventHub</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your premier destination to discover, organize, and experience unforgettable conferences, music concerts, creative workshops, and professional networking summits.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-indigo-600 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-indigo-600 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-indigo-600 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wide">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  All Events
                </Link>
              </li>
              <li>
                <Link to="/events?category=Technology" className="hover:text-white transition-colors">
                  Tech Conferences
                </Link>
              </li>
              <li>
                <Link to="/events?category=Music" className="hover:text-white transition-colors">
                  Music & Concerts
                </Link>
              </li>
              <li>
                <Link to="/events?category=Workshop" className="hover:text-white transition-colors">
                  Masterclasses & Workshops
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Help */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wide">
              Account & Help
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-white transition-colors">
                  Manage Bookings
                </Link>
              </li>
              <li>
                <span className="text-gray-500 cursor-not-allowed">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="text-gray-500 cursor-not-allowed">
                  Privacy Policy
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wide">
              Contact & Support
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span>500 Innovation Way, Suite 400, San Francisco, CA 94105</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>+1 (800) 555-0199</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>support@eventhub.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} EventHub Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with React, Node.js, Express & MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

