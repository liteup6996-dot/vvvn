import React from 'react';
import { Instructor } from '../types';
import { INITIAL_INSTRUCTORS } from '../data';
import { User, Sparkles, UserCheck } from 'lucide-react';

export const OurTeam: React.FC = () => {
  const instructors: Instructor[] = INITIAL_INSTRUCTORS;

  const americanInstructors = instructors.filter((inst) => inst.role === 'American Accent Instructor');
  const britishInstructors = instructors.filter((inst) => inst.role === 'British Accent Instructor');

  const renderCard = (instructor: Instructor) => {
    const isAmerican = instructor.role === 'American Accent Instructor';

    return (
      <div
        key={instructor.id}
        className="bg-white rounded-xl border border-gray-200 p-6 sm:p-7 shadow-2xs hover:shadow-sm transition-all flex flex-col sm:flex-row gap-6 items-start group"
      >
        {/* Photograph or Animated Character Avatar */}
        <div className="w-full sm:w-40 h-52 sm:h-48 rounded-xl overflow-hidden bg-gradient-to-b from-slate-100 to-gray-200 shrink-0 border border-gray-200/80 flex items-center justify-center relative p-3 group-hover:scale-105 transition-transform duration-300">
          {instructor.gender === 'female' ? (
            <a href="https://ibb.co/nNvLzGyc" target="_blank" rel="noopener noreferrer" className="w-full h-full block">
              <img
                src="https://i.ibb.co/yc1QW9Cy/Vocal-Vantage-3.png"
                alt="Vocal-Vantage-3"
                className="w-full h-full object-contain filter drop-shadow-md group-hover:rotate-1 transition-all duration-300"
                referrerPolicy="no-referrer"
              />
            </a>
          ) : (
            <a href="https://ibb.co/6RTwrfbf" target="_blank" rel="noopener noreferrer" className="w-full h-full block">
              <img
                src="https://i.ibb.co/hR49LtHt/Vocal-Vantage-2.png"
                alt="Vocal-Vantage-2"
                className="w-full h-full object-contain filter drop-shadow-md group-hover:rotate-1 transition-all duration-300"
                referrerPolicy="no-referrer"
              />
            </a>
          )}
          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-bold text-gray-700 shadow-2xs border border-gray-200 pointer-events-none">
            {instructor.gender === 'female' ? 'Female Faculty' : 'Male Faculty'}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3 w-full">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-xs text-[11px] font-bold uppercase tracking-wider ${
                  isAmerican
                    ? 'bg-[#7A1B28]/10 text-[#7A1B28]'
                    : 'bg-[#D97706]/10 text-[#D97706]'
                }`}
              >
                {instructor.role}
              </span>

              {instructor.offersOneOnOne && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                  <UserCheck className="w-3 h-3" />
                  <span>Offers 1-on-1 Coaching</span>
                </span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold font-serif text-gray-900 group-hover:text-[#7A1B28] transition-colors">
              {instructor.name}
            </h3>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed font-light">
            {instructor.bio}
          </p>

          <div className="pt-2 border-t border-gray-100 text-xs flex items-start gap-1.5 text-gray-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong className="font-semibold text-gray-800">Specialization: </strong>
              {instructor.specialization}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-16 bg-white min-h-[75vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b border-gray-100 pb-8 mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7A1B28]">
            Faculty & Specialists
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 mt-1">
            Meet Our Team
          </h1>
          <p className="text-gray-500 text-base mt-2 max-w-2xl font-light">
            Our team of expert speech and phonetics trainers specializes in American and British accent instruction, offering group masterclasses and personalized 1-on-1 coaching.
          </p>
        </div>

        {/* American Accent Faculty */}
        <div className="space-y-6 mb-16">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#7A1B28]"></div>
            <h2 className="text-2xl font-bold font-serif text-gray-900">
              American Accent Faculty
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {americanInstructors.map(renderCard)}
          </div>
        </div>

        {/* British Accent Faculty */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#D97706]"></div>
            <h2 className="text-2xl font-bold font-serif text-gray-900">
              British Accent Faculty
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {britishInstructors.map(renderCard)}
          </div>
        </div>

      </div>
    </div>
  );
};
