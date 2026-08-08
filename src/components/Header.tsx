import React, { useState } from 'react';
import { PageView } from '../types';
import { LOGO_URL } from '../data';
import { Menu, X, UserCheck } from 'lucide-react';

interface HeaderProps {
  currentView: PageView;
  setCurrentView: (view: PageView) => void;
  onNavigateSection: (sectionId: string) => void;
  isLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  onNavigateSection,
  isLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: PageView, sectionId?: string) => {
    setMobileMenuOpen(false);
    if (view === 'home' && sectionId) {
      if (currentView !== 'home') {
        setCurrentView('home');
        setTimeout(() => {
          onNavigateSection(sectionId);
        }, 100);
      } else {
        onNavigateSection(sectionId);
      }
    } else {
      setCurrentView(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Official Vocal Vantage Logo */}
        <button
          onClick={() => handleNavClick('home', 'hero')}
          className="flex items-center gap-3 text-left focus:outline-hidden group"
          id="nav-brand-logo-btn"
        >
          <img
            src={LOGO_URL}
            alt="Vocal Vantage Logo"
            className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            referrerPolicy="no-referrer"
          />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" id="desktop-nav-menu">
          <button
            onClick={() => handleNavClick('home', 'hero')}
            className={`text-sm font-semibold tracking-wide uppercase transition-colors ${
              currentView === 'home'
                ? 'text-[#7A1B28]'
                : 'text-gray-700 hover:text-[#7A1B28]'
            }`}
            id="nav-home-btn"
          >
            Home
          </button>

          <button
            onClick={() => handleNavClick('home', 'courses')}
            className="text-sm font-semibold tracking-wide uppercase text-gray-700 hover:text-[#7A1B28] transition-colors"
            id="nav-courses-btn"
          >
            Courses
          </button>

          <button
            onClick={() => handleNavClick('team')}
            className={`text-sm font-semibold tracking-wide uppercase transition-colors ${
              currentView === 'team'
                ? 'text-[#7A1B28]'
                : 'text-gray-700 hover:text-[#7A1B28]'
            }`}
            id="nav-our-team-btn"
          >
            Our Team
          </button>

          <button
            onClick={() => handleNavClick('home', 'contact')}
            className="text-sm font-semibold tracking-wide uppercase text-gray-700 hover:text-[#7A1B28] transition-colors"
            id="nav-contact-btn"
          >
            Contact Us
          </button>

          {/* LMS Button - Noticeable outlined button */}
          <button
            onClick={() => handleNavClick('lms')}
            className={`ml-2 px-5 py-2.5 rounded-md border text-sm font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
              currentView === 'lms'
                ? 'bg-[#7A1B28] text-white border-[#7A1B28] shadow-sm'
                : 'border-[#7A1B28] text-[#7A1B28] hover:bg-[#7A1B28] hover:text-white'
            }`}
            id="nav-lms-btn"
          >
            {isLoggedIn && <UserCheck className="w-4 h-4" />}
            <span>LMS</span>
          </button>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-700 hover:text-[#7A1B28] focus:outline-hidden"
          aria-label="Toggle navigation menu"
          id="mobile-menu-toggle-btn"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <button
            onClick={() => handleNavClick('home', 'hero')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-md"
            id="mobile-nav-home"
          >
            Home
          </button>

          <button
            onClick={() => handleNavClick('home', 'courses')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-md"
            id="mobile-nav-courses"
          >
            Courses
          </button>

          <button
            onClick={() => handleNavClick('team')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-md"
            id="mobile-nav-team"
          >
            Our Team
          </button>

          <button
            onClick={() => handleNavClick('home', 'contact')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-md"
            id="mobile-nav-contact"
          >
            Contact Us
          </button>

          <button
            onClick={() => handleNavClick('lms')}
            className="w-full mt-2 px-4 py-3 text-center text-base font-semibold uppercase tracking-wider text-white bg-[#7A1B28] rounded-md shadow-xs flex items-center justify-center gap-2"
            id="mobile-nav-lms"
          >
            {isLoggedIn && <UserCheck className="w-4 h-4" />}
            <span>Student LMS Portal</span>
          </button>
        </div>
      )}
    </header>
  );
};
