import React, { useState } from 'react';
import { PageView, ContactInfo } from '../types';
import { LOGO_URL } from '../data';
import { Instagram, Star, Lock } from 'lucide-react';
import { TrustBoxWidget } from './TrustBoxWidget';
import { PolicyType } from './PrivacyTermsModal';
import { ReviewPasscodeModal } from './ReviewPasscodeModal';

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
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);

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

        {/* Bottom Legal bar & Review Trustpilot Button */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-4">
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

          {/* Button at the end: Review Trustpilot (Passcode Protected with 7869) */}
          <div className="pt-2 md:pt-0">
            <button
              onClick={() => setShowPasscodeModal(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 text-gray-600 hover:text-emerald-800 transition-all text-xs font-semibold shadow-2xs cursor-pointer group"
              id="footer-review-trustpilot-btn"
            >
              <div className="w-4 h-4 rounded-full bg-[#00b67a] flex items-center justify-center text-white shrink-0">
                <Star className="w-2.5 h-2.5 fill-white" />
              </div>
              <span>Review Trustpilot</span>
              <Lock className="w-3 h-3 text-gray-400 group-hover:text-emerald-600" />
            </button>
          </div>
        </div>

      </div>

      {/* Review Passcode Modal (Password: 7869) */}
      <ReviewPasscodeModal
        isOpen={showPasscodeModal}
        onClose={() => setShowPasscodeModal(false)}
        onSuccess={() => {
          onNavigate('review');
        }}
      />
    </footer>
  );
};

