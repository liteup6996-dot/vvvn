import React from 'react';
import { PageView, ContactInfo } from '../types';
import { LOGO_URL } from '../data';
import { Instagram } from 'lucide-react';
import { TrustBoxWidget } from './TrustBoxWidget';
import { PolicyType } from './PrivacyTermsModal';

interface FooterProps {
  onNavigate: (view: PageView, sectionId?: string) => void;
  contactInfo: ContactInfo;
  onOpenPrivacyTerms: (type: PolicyType) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  contactInfo,
  onOpenPrivacyTerms,
}) => {
  return (
    <footer className="bg-white border-t border-gray-200 py-12 text-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-gray-100">
          
          {/* Brand & Tagline */}
          <div className="space-y-2 text-center md:text-left">
            <button
              onClick={() => onNavigate('home', 'hero')}
              className="inline-block focus:outline-hidden"
              id="footer-logo-btn"
            >
              <img
                src={LOGO_URL}
                alt="Vocal Vantage Logo"
                className="h-10 w-auto object-contain mx-auto md:mx-0"
                referrerPolicy="no-referrer"
              />
            </button>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#7A1B28]">
              Accent Training & Communication Excellence
            </p>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold uppercase tracking-wider text-gray-600">
            <button
              onClick={() => onNavigate('home', 'hero')}
              className="hover:text-[#7A1B28] transition-colors cursor-pointer"
              id="footer-nav-home"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('home', 'courses')}
              className="hover:text-[#7A1B28] transition-colors cursor-pointer"
              id="footer-nav-courses"
            >
              Courses
            </button>
            <button
              onClick={() => onNavigate('team')}
              className="hover:text-[#7A1B28] transition-colors cursor-pointer"
              id="footer-nav-team"
            >
              Our Team
            </button>
            <button
              onClick={() => onNavigate('lms')}
              className="hover:text-[#7A1B28] transition-colors cursor-pointer"
              id="footer-nav-lms"
            >
              LMS
            </button>
            <button
              onClick={() => onNavigate('home', 'contact')}
              className="hover:text-[#7A1B28] transition-colors cursor-pointer"
              id="footer-nav-contact"
            >
              Contact Us
            </button>
          </nav>

          {/* Instagram Only Link */}
          <div>
            <a
              href={contactInfo.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-[#7A1B28] hover:text-white transition-colors inline-flex items-center justify-center"
              aria-label="Vocal Vantage Instagram"
              id="footer-instagram-link"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>

        </div>

        {/* TrustBox Review Collector Widget */}
        <div className="py-4 border-b border-gray-100 flex justify-center">
          <TrustBoxWidget />
        </div>

        {/* Bottom Legal bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <div>
            <p>© {new Date().getFullYear()} Vocal Vantage. All rights reserved.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={() => onOpenPrivacyTerms('terms')}
              className="hover:text-gray-700 transition-colors cursor-pointer"
              id="footer-terms-btn"
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => onOpenPrivacyTerms('privacy')}
              className="hover:text-gray-700 transition-colors cursor-pointer"
              id="footer-privacy-btn"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onOpenPrivacyTerms('refund')}
              className="hover:text-gray-700 transition-colors cursor-pointer"
              id="footer-refund-btn"
            >
              Refund Policy
            </button>
            <button
              onClick={() => onOpenPrivacyTerms('delivery')}
              className="hover:text-gray-700 transition-colors cursor-pointer"
              id="footer-delivery-btn"
            >
              Service Delivery Policy
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

