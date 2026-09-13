import React, { useState, useEffect } from 'react';
import { Lock, X, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface ReviewPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewPasscodeModal: React.FC<ReviewPasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPasscode('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passcode.trim() === '7869') {
      try {
        sessionStorage.setItem('review_portal_unlocked', 'true');
      } catch {
        // Safe fallback if sessionStorage is blocked
      }
      onSuccess();
      onClose();
    } else {
      setError('Incorrect passcode. Please enter the valid authorization code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        id="review-passcode-modal"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-gray-100">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
            <Lock className="w-4 h-4 text-[#7A1B28]" />
            <span>Authorized Review Access</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
            id="close-passcode-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#00b67a] mx-auto shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-gray-900">
              Review Trustpilot Portal
            </h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Please enter the security password to unlock the $0.00 product checkout and official Trustpilot review page.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Security Passcode
              </label>
              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter passcode"
                  autoFocus
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm tracking-widest text-center font-mono focus:outline-hidden focus:ring-2 focus:ring-[#7A1B28] focus:bg-white transition-all pr-10"
                  id="review-passcode-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#7A1B28] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#621520] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              id="submit-passcode-btn"
            >
              <span>Unlock & Access Page</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-gray-400 text-center">
            Verification protected for authentic consumer transaction tracking.
          </p>
        </div>
      </div>
    </div>
  );
};
