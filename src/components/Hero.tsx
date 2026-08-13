import React from 'react';
import { Mic, ArrowRight, MessageSquare, Volume2 } from 'lucide-react';

interface HeroProps {
  onExploreCourses: () => void;
  onContactUs: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreCourses, onContactUs }) => {
  return (
    <section id="hero" className="relative bg-white pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7A1B28]/5 border border-[#7A1B28]/15 text-[#7A1B28] text-xs font-semibold uppercase tracking-wider">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Accent Training & Communication Excellence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif text-gray-900 tracking-tight leading-[1.15]">
              Speak With Confidence.{' '}
              <span className="block text-[#7A1B28] italic font-normal mt-1">
                Sound More Natural.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl font-light leading-relaxed">
              Personalized American and British accent training designed to help you improve pronunciation, clarity, fluency, and confidence in everyday communication.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-4 sm:items-center">
              <button
                onClick={onExploreCourses}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#7A1B28] text-white font-medium text-base rounded-md hover:bg-[#621520] transition-colors shadow-xs group cursor-pointer"
                id="hero-explore-courses-btn"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onContactUs}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-800 font-medium text-base rounded-md border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
                id="hero-contact-us-btn"
              >
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <span>Contact Us</span>
              </button>
            </div>

            {/* Subtle proof markers */}
            <div className="pt-6 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm text-gray-600">
              <div>
                <span className="block font-semibold text-gray-900 text-base">Group & 1-on-1</span>
                <span className="text-xs text-gray-500">Flexible Training Formats</span>
              </div>
              <div>
                <span className="block font-semibold text-gray-900 text-base">Dual Programs</span>
                <span className="text-xs text-gray-500">American & British Accents</span>
              </div>
              <div>
                <span className="block font-semibold text-gray-900 text-base">Practical Results</span>
                <span className="text-xs text-gray-500">For Professionals & Speakers</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Studio Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-2 bg-gradient-to-tr from-gray-100 to-gray-50 rounded-2xl -z-10 transform rotate-1"></div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs">
                <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-4/3 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=1000"
                    alt="Voice coaching and studio microphone"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  <div className="absolute bottom-4 left-4 right-4 text-white p-3 bg-black/50 backdrop-blur-md rounded-md border border-white/10 flex items-center gap-3">
                    <div className="p-2.5 rounded-full bg-[#7A1B28] text-white shrink-0">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">Group & 1-on-1 Coaching</p>
                      <p className="text-sm font-medium text-white">Live Accent Training Sessions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
