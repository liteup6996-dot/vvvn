import { useState, useEffect } from 'react';
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
import { ReviewProductPage } from './components/ReviewProductPage';
import { Footer } from './components/Footer';
import { PrivacyTermsModal, PolicyType } from './components/PrivacyTermsModal';
import { WhatsAppButton } from './components/WhatsAppButton';

export default function App() {
  // Determine initial view from window.location.pathname
  const getInitialView = (): PageView => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path === '/review-page' || path.startsWith('/review-page')) {
        return 'review';
      }
      if (path === '/lms' || path.startsWith('/lms')) {
        return 'lms';
      }
      if (path === '/team' || path.startsWith('/team')) {
        return 'team';
      }
    }
    return 'home';
  };

  const [currentView, setCurrentView] = useState<PageView>(getInitialView);
  const [lmsLoginMode, setLmsLoginMode] = useState<'student' | 'instructor'>('student');
  const [selectedCoursePref, setSelectedCoursePref] = useState<AccentType>('American Accent');
  const [contactInfo, setContactInfo] = useState<ContactInfo>(DEFAULT_CONTACT_INFO);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<StudentProfile>(ABDUL_REHMAN_STUDENT);
  const [modalType, setModalType] = useState<PolicyType | null>(null);

  // Sync browser back/forward buttons with current view
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/review-page' || path.startsWith('/review-page')) {
        setCurrentView('review');
      } else if (path === '/lms' || path.startsWith('/lms')) {
        setCurrentView('lms');
      } else if (path === '/team' || path.startsWith('/team')) {
        setCurrentView('team');
      } else {
        setCurrentView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update browser URL on navigation
  const handleNavigateView = (view: PageView) => {
    if (view === 'lms') setLmsLoginMode('student');
    setCurrentView(view);

    if (typeof window !== 'undefined') {
      let targetPath = '/';
      if (view === 'review') targetPath = '/review-page';
      else if (view === 'lms') targetPath = '/lms';
      else if (view === 'team') targetPath = '/team';

      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Smooth scroll helper
  const handleNavigateSection = (sectionId: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
      }
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
    handleNavigateView('lms');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      {/* Show header on Home, Team, and Review views */}
      {currentView !== 'lms' && currentView !== 'review' && (
        <Header
          currentView={currentView}
          setCurrentView={(view) => handleNavigateView(view)}
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

      {/* VIEW: 0 USD PRODUCT REVIEW & TRUSTPILOT PAGE (/review-page) */}
      {currentView === 'review' && (
        <main className="grow">
          <ReviewProductPage onBackToHome={() => handleNavigateView('home')} />
        </main>
      )}

      {/* VIEW: STUDENT / INSTRUCTOR LMS PORTAL */}
      {currentView === 'lms' && (
        <LMSPortal
          onBackToHome={() => handleNavigateView('home')}
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
              handleNavigateView(view);
            }
          }}
          contactInfo={contactInfo}
          onOpenPrivacyTerms={(type) => setModalType(type)}
        />
      )}

      {/* PRIVACY & TERMS MODAL */}
      <PrivacyTermsModal type={modalType} onClose={() => setModalType(null)} />

      {/* FLOATING WHATSAPP BUTTON */}
      <WhatsAppButton />
    </div>
  );
}
