import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface InstructorBannerProps {
  onOpenInstructorLogin: () => void;
}

export const InstructorBanner: React.FC<InstructorBannerProps> = ({ onOpenInstructorLogin }) => {
  return (
    <section className="bg-slate-900 text-white py-12 border-t border-slate-800" id="instructor-access-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-800/80 rounded-2xl p-6 sm:p-8 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D97706]/15 border border-[#D97706]/30 text-[#D97706] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Faculty Portal Access</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
              Instructor Portal Login
            </h3>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onOpenInstructorLogin}
              className="px-6 py-3 bg-[#D97706] text-white font-semibold text-xs uppercase tracking-wider rounded-lg hover:bg-[#b46204] transition-all shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
              id="btn-home-instructor-login"
            >
              <span>Login as Instructor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
