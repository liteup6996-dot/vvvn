import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface PrivacyTermsModalProps {
  type: 'terms' | 'privacy' | null;
  onClose: () => void;
}

export const PrivacyTermsModal: React.FC<PrivacyTermsModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const isTerms = type === 'terms';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 sm:p-8 shadow-xl border border-gray-200 max-h-[85vh] flex flex-col space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            {isTerms ? (
              <FileText className="w-5 h-5 text-[#7A1B28]" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-[#7A1B28]" />
            )}
            <h3 className="text-xl font-bold font-serif text-gray-900">
              {isTerms ? 'Terms & Conditions' : 'Privacy Policy'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto text-sm text-gray-600 space-y-4 pr-2 font-light leading-relaxed">
          {isTerms ? (
            <>
              <p>
                Welcome to <strong>Vocal Vantage</strong>. By enrolling in our American or British accent training programs, you agree to comply with the following academy terms:
              </p>
              <h4 className="font-semibold text-gray-900 pt-2">1. Personal Coaching & Intellectual Property</h4>
              <p>
                All curriculum materials, phonetics exercises, audio guides, and home task assignments provided through our website and LMS remain the exclusive intellectual property of Vocal Vantage.
              </p>
              <h4 className="font-semibold text-gray-900 pt-2">2. Student LMS Submissions</h4>
              <p>
                Students are responsible for submitting home tasks on or before the assigned due date. Audio/video recordings uploaded are strictly used for evaluation and instructor feedback.
              </p>
              <h4 className="font-semibold text-gray-900 pt-2">3. Code of Conduct</h4>
              <p>
                Professional and respectful communication with instructors and staff is required at all times.
              </p>
            </>
          ) : (
            <>
              <p>
                At <strong>Vocal Vantage</strong>, we prioritize the confidentiality and privacy of our student communications and speech data.
              </p>
              <h4 className="font-semibold text-gray-900 pt-2">1. Information Collection</h4>
              <p>
                We collect information provided directly through our contact inquiry forms (Full Name, Email, Phone/WhatsApp, Accent Preference) and LMS assignment submissions (audio, video, document files).
              </p>
              <h4 className="font-semibold text-gray-900 pt-2">2. Audio & Speech Recording Protection</h4>
              <p>
                Audio files submitted for accent diagnostics and home task evaluation are accessible solely by your assigned phonetic coach. We never sell, share, or monetize student voice samples.
              </p>
              <h4 className="font-semibold text-gray-900 pt-2">3. Contact Inquiries</h4>
              <p>
                Inquiry details are used exclusively by our admissions team to answer your course questions.
              </p>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#7A1B28] text-white rounded-md text-xs font-semibold uppercase tracking-wider hover:bg-[#621520] transition-colors"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
};
