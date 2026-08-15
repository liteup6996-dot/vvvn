import React from 'react';
import { X, ShieldCheck, FileText, RotateCcw, Globe } from 'lucide-react';

export type PolicyType = 'terms' | 'privacy' | 'refund' | 'delivery';

interface PrivacyTermsModalProps {
  type: PolicyType | null;
  onClose: () => void;
}

export const PrivacyTermsModal: React.FC<PrivacyTermsModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const getHeaderInfo = () => {
    switch (type) {
      case 'terms':
        return {
          title: 'Terms & Conditions',
          subtitle: 'Terms & Conditions – Accent Program',
          icon: <FileText className="w-5 h-5 text-[#7A1B28]" />,
        };
      case 'privacy':
        return {
          title: 'Privacy Policy',
          subtitle: 'Student Data & Confidentiality Policy',
          icon: <ShieldCheck className="w-5 h-5 text-[#7A1B28]" />,
        };
      case 'refund':
        return {
          title: 'Refund Policy',
          subtitle: 'Payment & Continuation Policy',
          icon: <RotateCcw className="w-5 h-5 text-[#7A1B28]" />,
        };
      case 'delivery':
        return {
          title: 'Service Delivery Policy',
          subtitle: 'Online Training & LMS Delivery Policy',
          icon: <Globe className="w-5 h-5 text-[#7A1B28]" />,
        };
    }
  };

  const { title, subtitle, icon } = getHeaderInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 sm:p-8 shadow-xl border border-gray-200 max-h-[85vh] flex flex-col space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            {icon}
            <div>
              <h3 className="text-xl font-bold font-serif text-gray-900 leading-tight">
                {title}
              </h3>
              <p className="text-xs text-[#7A1B28] font-semibold uppercase tracking-wider">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto text-sm text-gray-600 space-y-4 pr-2 font-light leading-relaxed">
          {type === 'terms' && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2">
                Vocal Vantage — Terms & Conditions – Accent Program
              </p>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Demo Session</h4>
                <p>
                  Every prospective student is welcome to attend a demo session before enrollment. Admission is confirmed only after the applicable payment is received.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">One-on-One Payment Policy</h4>
                <p>
                  The first weekly installment is payable in advance before the first class. Remaining weekly payments are due every Sunday for the following week's classes. Where a calendar month ends before the regular Sunday cycle, payment will be collected on the final scheduled class of that week to maintain a consistent weekly billing cycle.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Group Sessions</h4>
                <p>
                  Group course fees are payable in full before the first class. Seats are reserved only after payment confirmation.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Course Continuation</h4>
                <p>
                  Students may discontinue after any completed paid week. No future weekly payments are required if the student chooses not to continue. Amounts already paid remain non-refundable.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Refund Policy</h4>
                <p>
                  All payments are final and non-refundable, including missed classes, late attendance, voluntary withdrawal, or unused sessions.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Attendance & Rescheduling</h4>
                <p>
                  Students are expected to attend punctually. Rescheduling requests are subject to instructor availability and should be communicated in advance.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Course Materials</h4>
                <p>
                  All learning materials are the intellectual property of Vocal Vantage and may not be copied, shared, recorded for redistribution, or commercially reused without written permission.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Acceptance</h4>
                <p>
                  Payment for any course constitutes acceptance of these Terms & Conditions.
                </p>
              </div>
            </div>
          )}

          {type === 'privacy' && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2">
                Vocal Vantage — Privacy Policy
              </p>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Student Information & Contact Details</h4>
                <p>
                  We collect personal details provided directly by students during enrollment and course inquiries, including full name, email address, phone/WhatsApp number, and accent training preferences. Your contact information is used exclusively to facilitate course communications, schedule live classes, and send administrative updates.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">LMS Data & Assignment Submissions</h4>
                <p>
                  Audio/video practice recordings, phonetics exercises, and written tasks uploaded to the Vocal Vantage Learning Management System (LMS) are collected solely for performance evaluation and direct feedback from your assigned instructor. All submitted assignments and voice data remain strictly confidential and will never be shared, sold, or publicly distributed.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Payment-Related Information</h4>
                <p>
                  Payment transaction references and confirmation proofs are collected to verify course enrollment. Vocal Vantage does not store credit card numbers or sensitive banking credentials on our servers.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Data Protection & Security</h4>
                <p>
                  We employ appropriate technical and administrative safeguards to protect student data from unauthorized access or disclosure.
                </p>
              </div>
            </div>
          )}

          {type === 'refund' && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2">
                Vocal Vantage — Refund Policy
              </p>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Non-Refundable Payments</h4>
                <p>
                  All payments made for Vocal Vantage accent training courses (including group masterclasses, one-on-one sessions, demo confirmations, and LMS portal access) are final and non-refundable under any circumstances, including missed classes, late attendance, voluntary withdrawal, or unused sessions.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">One-on-One Course Continuation</h4>
                <p>
                  Students enrolled in One-on-One sessions pay on a weekly installment basis in advance. Students may discontinue their training after any completed paid week. If a student chooses not to continue, no future weekly payments are required. However, amounts already paid for completed or ongoing weeks remain strictly non-refundable.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Group Session Policy</h4>
                <p>
                  Group course fees are payable in full before the first class. Seats are reserved only after payment confirmation and fees are non-refundable once enrollment is confirmed.
                </p>
              </div>
            </div>
          )}

          {type === 'delivery' && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2">
                Vocal Vantage — Service Delivery Policy
              </p>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Online Accent Training Services</h4>
                <p>
                  Vocal Vantage provides specialized online accent-training and communication coaching for American and British accents. All training sessions, group masterclasses, and one-on-one coaching classes are conducted live online via video conferencing platforms.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Digital Delivery of Materials & LMS Access</h4>
                <p>
                  All course curriculum workbooks, phonetics audio files, home assignments, and LMS portal access credentials are provided digitally upon payment confirmation. No physical goods or hardcopy course materials are shipped.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Service Timelines & Class Links</h4>
                <p>
                  Access to the Vocal Vantage Student LMS is activated immediately upon enrollment setup. Class schedules and live session video links are sent directly to enrolled students prior to each session.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#7A1B28] text-white rounded-md text-xs font-semibold uppercase tracking-wider hover:bg-[#621520] transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
};

