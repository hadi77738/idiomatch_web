'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoading, logout } = useUser();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Quiz', href: '/quiz' },
    { label: 'Credit', href: '/credit' },
    { label: 'About', href: '/about' },
    { label: 'Acknowledgment', href: '/acknowledgment' },
    { label: 'Testimonies', href: '/testimony' },
  ];

  return (
    <header className="w-full bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-[Bauhaus93] bg-gradient-to-r from-green-800 to-blue-600 bg-clip-text text-transparent"
          >
            Idiomatch
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-gray-700 hover:text-green-800 transition-colors duration-200 font-medium"
              >
                {item.label}
              </Link>
            ))}

            {/* Bagian Dinamis untuk Tombol Aksi */}
            <div className="flex items-center space-x-4">
              
              {/* === TOMBOL DOWNLOAD BARU (DESKTOP) === */}
              <a 
                href="/idiomatch-app.apk" 
                download
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Download App
              </a>

              {isLoading ? (
                <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse"></div>
              ) : user ? (
                <>
                  <span className="font-medium text-gray-700">Hi, {user.full_name}</span>
                  {user.is_admin && (
                    <Link href="/admin" className="px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700">
                      Admin
                    </Link>
                  )}
                  <button onClick={logout} className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800">
                  Login
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile Burger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <nav className="md:hidden pb-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-800 rounded-md transition"
              >
                {item.label}
              </Link>
            ))}
            <hr className="my-2" />
            
            {/* Bagian Dinamis untuk Mobile */}
            <div className="px-4 py-2 space-y-3">

              {/* === TOMBOL DOWNLOAD BARU (MOBILE) === */}
              <a 
                href="/idiomatch-app.apk" 
                download
                onClick={() => setIsOpen(false)}
                className="block text-center px-4 py-2 text-white bg-blue-600 rounded-md transition"
              >
                Download App
              </a>

              {isLoading ? (
                <div className="h-8 w-full bg-gray-200 rounded-md animate-pulse"></div>
              ) : user ? (
                <div className="space-y-3">
                    <p className="font-medium text-gray-800">Hi, {user.full_name}</p>
                    {user.is_admin && (
                        <Link href="/admin" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-2 text-sm text-white bg-purple-600 rounded-md">
                            Admin Dashboard
                        </Link>
                    )}
                    <button onClick={() => {logout(); setIsOpen(false);}} className="block w-full text-left px-4 py-2 text-sm text-white bg-red-600 rounded-md">
                        Logout
                    </button>
                </div>
              ) : (
                  <Link href="/login" onClick={() => setIsOpen(false)} className="block text-center px-4 py-2 text-white bg-green-700 rounded-md transition">
                    Login
                  </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
