import React from 'react';
import { UserCheck, Users, Mic2, Laptop } from 'lucide-react';

export const WhyVocalVantage: React.FC = () => {
  const points = [
    {
      title: 'Personalized Training',
      icon: UserCheck,
      description: 'Customized curriculum based on your accent profile.',
    },
    {
      title: 'One-on-One Guidance',
      icon: Users,
      description: 'Direct feedback from expert phonetic instructors.',
    },
    {
      title: 'Practical Speaking Practice',
      icon: Mic2,
      description: 'Real-world conversational and speech exercises.',
    },
    {
      title: 'Flexible Online Learning',
      icon: Laptop,
      description: 'Convenient scheduling and digital task submission.',
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 tracking-tight mb-12">
          Why Vocal Vantage?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {points.map((point, index) => {
            const IconComponent = point.icon;
            return (
              <div
                key={index}
                className="p-6 bg-gray-50/80 rounded-lg border border-gray-100 text-center space-y-3"
              >
                <div className="inline-flex p-3 rounded-full bg-white text-[#7A1B28] shadow-2xs border border-gray-100">
                  <IconComponent className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 font-sans">
                  {point.title}
                </h3>
                <p className="text-xs text-gray-500 font-light">
                  {point.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
