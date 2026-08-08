import React from 'react';
import { Check } from 'lucide-react';

interface CoursesProps {
  onSelectCourse: (courseType: 'American Accent' | 'British Accent') => void;
}

export const Courses: React.FC<CoursesProps> = ({ onSelectCourse }) => {
  return (
    <section id="courses" className="py-20 bg-gray-50/50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7A1B28]">
            Core Programs
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 tracking-tight">
            Choose Your Accent
          </h2>
          <p className="text-lg text-gray-600 font-light">
            Professional accent training designed around your communication goals.
          </p>
        </div>

        {/* Two Large Side-By-Side Marketing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          
          {/* LEFT: AMERICAN ACCENT PROGRAM (Burgundy Branding) */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-10 shadow-xs flex flex-col justify-between hover:border-[#7A1B28]/40 transition-all group">
            <div className="space-y-6">
              
              {/* Badge & Title */}
              <div>
                <div className="inline-block px-3 py-1 rounded-sm bg-[#7A1B28] text-white text-xs font-bold uppercase tracking-wider mb-4">
                  American Accent
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 group-hover:text-[#7A1B28] transition-colors">
                  Speak Naturally. Communicate Confidently.
                </h3>
              </div>

              <p className="text-gray-600 leading-relaxed text-base font-light">
                Develop clearer American pronunciation, smoother speech, natural rhythm, and greater confidence in everyday and professional communication.
              </p>

              {/* 5 Benefits List */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Program Highlights & Formats
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-800 text-sm font-medium">
                    <div className="p-1 rounded-full bg-[#7A1B28]/10 text-[#7A1B28] shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span><strong>Group Masterclasses & 1-on-1 Sessions</strong> options available</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-800 text-sm font-medium">
                    <div className="p-1 rounded-full bg-[#7A1B28]/10 text-[#7A1B28] shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Develop a natural American speaking style</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-800 text-sm font-medium">
                    <div className="p-1 rounded-full bg-[#7A1B28]/10 text-[#7A1B28] shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Improve pronunciation, vowels and clarity</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-800 text-sm font-medium">
                    <div className="p-1 rounded-full bg-[#7A1B28]/10 text-[#7A1B28] shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Build smoother speaking rhythm & stress cadence</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-800 text-sm font-medium">
                    <div className="p-1 rounded-full bg-[#7A1B28]/10 text-[#7A1B28] shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Personalized feedback & speech practice</span>
                  </li>
                </ul>
              </div>

            </div>

            {/* Action Button */}
            <div className="pt-8 mt-6 border-t border-gray-100">
              <button
                onClick={() => onSelectCourse('American Accent')}
                className="w-full py-4 px-6 rounded-md bg-[#7A1B28] text-white font-semibold text-base uppercase tracking-wider hover:bg-[#621520] transition-colors shadow-xs text-center cursor-pointer"
                id="btn-american-accent-training"
              >
                American Accent Training
              </button>
            </div>
          </div>

          {/* RIGHT: BRITISH ACCENT PROGRAM (Premium Orange Branding) */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-10 shadow-xs flex flex-col justify-between hover:border-[#D97706]/40 transition-all group">
            <div className="space-y-6">
              
              {/* Badge & Title */}
              <div>
                <div className="inline-block px-3 py-1 rounded-sm bg-[#D97706] text-white text-xs font-bold uppercase tracking-wider mb-4">
                  British Accent
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 group-hover:text-[#D97706] transition-colors">
                  Refine Your Speech. Stand Out.
                </h3>
              </div>

              <p className="text-gray-600 leading-relaxed text-base font-light">
                Develop clearer British pronunciation and a more polished speaking style through personalized accent and communication training.
              </p>

              {/* 5 Benefits List */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Program Highlights & Formats
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-800 text-sm font-medium">
                    <div className="p-1 rounded-full bg-[#D97706]/10 text-[#D97706] shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span><strong>Group Masterclasses & 1-on-1 Sessions</strong> options available</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-800 text-sm font-medium">
                    <div className="p-1 rounded-full bg-[#D97706]/10 text-[#D97706] shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Develop a refined British speaking style</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-800 text-sm font-medium">
                    <div className="p-1 rounded-full bg-[#D97706]/10 text-[#D97706] shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Improve Received Pronunciation (RP) & diction</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-800 text-sm font-medium">
                    <div className="p-1 rounded-full bg-[#D97706]/10 text-[#D97706] shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Build natural rhythm, pitch and intonation</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-800 text-sm font-medium">
                    <div className="p-1 rounded-full bg-[#D97706]/10 text-[#D97706] shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Personalized accent coaching & feedback</span>
                  </li>
                </ul>
              </div>

            </div>

            {/* Action Button */}
            <div className="pt-8 mt-6 border-t border-gray-100">
              <button
                onClick={() => onSelectCourse('British Accent')}
                className="w-full py-4 px-6 rounded-md bg-[#D97706] text-white font-semibold text-base uppercase tracking-wider hover:bg-[#B45309] transition-colors shadow-xs text-center cursor-pointer"
                id="btn-british-accent-training"
              >
                British Accent Training
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
