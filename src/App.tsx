import { useState } from 'react';
import { PageView, ContactInfo, AccentType, StudentProfile } from './types';
import { DEFAULT_CONTACT_INFO, ABDUL_REHMAN_STUDENT } from './data';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Courses } from './components/Courses';
import { WhyVocalVantage } from './components/WhyVocalVantage';
import { OurTeam } from './components/OurTeam';
import { ContactSection } from './components/ContactSection';
import { InstructorBanner } from './components/InstructorBanner';
import { LMSPortal } from './components/LMSPortal';
import { Footer } from './components/Footer';
import { PrivacyTermsModal } from './components/PrivacyTermsModal';

export default function App() {
  const [currentView, setCurrentView] = useState<PageView>('home');
  const [lmsLoginMode, setLmsLoginMode] = useState<'student' | 'instructor'>('student');
  const [selectedCoursePref, setSelectedCoursePref] = useState<AccentType>('American Accent');
  const [contactInfo, setContactInfo] = useState<ContactInfo>(DEFAULT_CONTACT_INFO);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<StudentProfile>(ABDUL_REHMAN_STUDENT);
  const [modalType, setModalType] = useState<'terms' | 'privacy' | null>(null);

  // Smooth scroll helper
  const handleNavigateSection = (sectionId: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Course selection action from Courses section
  const handleSelectCourse = (courseType: AccentType) => {
    setSelectedCoursePref(courseType);
    handleNavigateSection('contact');
  };

  const handleOpenInstructorLogin = () => {
    setLmsLoginMode('instructor');
    setCurrentView('lms');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      {/* Show header on Home & Team views */}
      {currentView !== 'lms' && (
        <Header
          currentView={currentView}
          setCurrentView={(view) => {
            if (view === 'lms') setLmsLoginMode('student');
            setCurrentView(view);
          }}
          onNavigateSection={handleNavigateSection}
          isLoggedIn={isLoggedIn}
        />
      )}

      {/* VIEW: MAIN HOME PAGE (Home, Courses, Why Vocal Vantage, Contact, Instructor Access) */}
      {currentView === 'home' && (
        <main className="grow">
          <Hero
            onExploreCourses={() => handleNavigateSection('courses')}
            onContactUs={() => handleNavigateSection('contact')}
          />
          <Courses onSelectCourse={handleSelectCourse} />
          <WhyVocalVantage />
          <ContactSection
            contactInfo={contactInfo}
            onUpdateContactInfo={setContactInfo}
            selectedCoursePref={selectedCoursePref}
          />
          <InstructorBanner onOpenInstructorLogin={handleOpenInstructorLogin} />
        </main>
      )}

      {/* VIEW: OUR TEAM */}
      {currentView === 'team' && (
        <main className="grow">
          <OurTeam />
        </main>
      )}

      {/* VIEW: STUDENT / INSTRUCTOR LMS PORTAL */}
      {currentView === 'lms' && (
        <LMSPortal
          onBackToHome={() => setCurrentView('home')}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          currentStudent={currentStudent}
          setCurrentStudent={setCurrentStudent}
          initialLoginMode={lmsLoginMode}
        />
      )}

      {/* FOOTER */}
      {currentView !== 'lms' && (
        <Footer
          onNavigate={(view, sectionId) => {
            if (view === 'home' && sectionId) {
              handleNavigateSection(sectionId);
            } else {
              if (view === 'lms') setLmsLoginMode('student');
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          contactInfo={contactInfo}
          onOpenPrivacyTerms={(type) => setModalType(type)}
        />
      )}

      {/* PRIVACY & TERMS MODAL */}
      <PrivacyTermsModal type={modalType} onClose={() => setModalType(null)} />
    </div>
  );
}
