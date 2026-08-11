import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Navigation */}
      <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold tracking-wider text-white">✈️ TripSync</h1>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-white text-sm font-medium hover:text-blue-400 transition-colors">
            Log In
          </Link>
          <Link href="/register" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-bold transition-colors shadow-sm">
            Sign Up Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="grow flex flex-col justify-center items-center text-center px-6 py-20">
        <h2 className="text-5xl md:text-6xl font-extrabold text-slate-800 mb-6 max-w-4xl leading-tight">
          Coordinate Your Group Travel in One Shared Workspace
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl">
          From winter getaways in Banff to massive summer hacker houses, say goodbye to messy chat groups. Plan itineraries, track schedules, and invite your group securely.
        </p>
        
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/register" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all">
            Get Started
          </Link>
          <Link href="/login" className="bg-white text-slate-800 font-bold py-3 px-8 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-all">
            Access Your Trips
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mt-24 text-left">
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Live Itineraries</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Create detailed, day-by-day schedules with specific legs, dates, and locations. Everyone stays perfectly on the same page.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Ironclad Security</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your travel plans are protected. TripSync requires mandatory Time-based One-Time Passwords (TOTP) for all users to ensure safe access.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Seamless Collaboration</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Add or remove users from your trip instantly. Share your workspace so everyone can view the schedule and contribute to the planning.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-center py-8 text-sm mt-auto">
        <p>&copy; {new Date().getFullYear()} TripSync. Built for seamless travel.</p>
      </footer>
    </div>
  );
}