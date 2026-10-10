const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Booking');

dotenv.config();

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@eventhub.com',
    password: 'password123',
    role: 'admin',
  },
  {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user',
  },
  {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    password: 'password123',
    role: 'user',
  },
];

const sampleEvents = [
  {
    title: 'Global Tech Summit 2025',
    description:
      'Join thousands of tech leaders, developers, and founders exploring AI breakthroughs, cloud innovations, quantum computing, and the future of web architecture.',
    date: '2025-11-15',
    time: '09:00 AM',
    location: 'Convention Center, San Francisco, CA',
    category: 'Technology',
    price: 2499,
    availableSeats: 250,
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Neon Horizon Music Festival',
    description:
      'A multi-genre outdoor music festival featuring world-class electronic producers, indie rock bands, visual light displays, and artisanal food markets.',
    date: '2025-12-05',
    time: '04:00 PM',
    location: 'Sunset Amphitheater, Austin, TX',
    category: 'Music',
    price: 1499,
    availableSeats: 400,
    image:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Startup Pitch & Venture Gala',
    description:
      'Watch 20 curated early-stage startups pitch to top Silicon Valley venture capitalists and angel investors. Features networking dinner and keynote speech.',
    date: '2025-11-28',
    time: '06:00 PM',
    location: 'Grand Ballroom, New York, NY',
    category: 'Business',
    price: 1999,
    availableSeats: 150,
    image:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Modern UI/UX Design Workshop',
    description:
      'An intensive hands-on masterclass covering Figma design systems, wireframing, interactive prototyping, user research, and modern UI heuristics.',
    date: '2025-12-10',
    time: '10:00 AM',
    location: 'Design Lab Studios, Seattle, WA',
    category: 'Workshop',
    price: 799,
    availableSeats: 45,
    image:
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'International Film & Art Showcase',
    description:
      'Celebrate independent cinema and contemporary art. Screenings of award-winning indie shorts, director Q&As, and an evening art gallery reception.',
    date: '2025-12-18',
    time: '05:30 PM',
    location: 'Metropolitan Art Center, Chicago, IL',
    category: 'Arts',
    price: 499,
    availableSeats: 180,
    image:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Metro Marathon & 10K Run',
    description:
      'The city’s premier annual road running event for athletes of all skill levels. Complete with aid stations, race medals, commemorative bibs, and festival finish.',
    date: '2025-12-22',
    time: '06:30 AM',
    location: 'Waterfront Boulevard, Miami, FL',
    category: 'Sports',
    price: 599,
    availableSeats: 300,
    image:
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Event.deleteMany();
    await Booking.deleteMany();
    console.log('Cleared existing Users, Events, and Bookings.');

    // Create users (using User.create so pre-save password hash hook executes)
    const createdUsers = [];
    for (const u of sampleUsers) {
      const created = await User.create(u);
      createdUsers.push(created);
    }
    console.log(`Created ${createdUsers.length} sample users.`);

    // Create events
    const createdEvents = await Event.insertMany(sampleEvents);
    console.log(`Created ${createdEvents.length} sample events.`);

    // Create a sample booking
    const adminUser = createdUsers.find((u) => u.role === 'admin');
    const regularUser = createdUsers.find((u) => u.role === 'user');

    if (regularUser && createdEvents.length > 0) {
      const eventToBook = createdEvents[0];
      const tickets = 2;
      const totalAmount = eventToBook.price * tickets;

      eventToBook.availableSeats -= tickets;
      await eventToBook.save();

      await Booking.create({
        user: regularUser._id,
        event: eventToBook._id,
        numberOfTickets: tickets,
        totalAmount,
        bookingDate: new Date(),
        status: 'Confirmed',
      });
      console.log('Created sample booking for demonstration.');
    }

    console.log('\n--- Seeding Completed Successfully! ---');
    console.log('Admin Account: admin@eventhub.com | Password: password123');
    console.log('User Account:  jane@example.com  | Password: password123\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

