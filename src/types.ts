export type PageView = 'home' | 'team' | 'lms' | 'review' | 'certificate';

export interface CurriculumDay {
  days: string; // e.g. "1-2"
  focus: string; // e.g. 'K / "Ka"'
  content: string; // e.g. "Clean K release and mouth placement. Vocabulary: key, keep..."
  score?: number;
}

export interface CurriculumSection {
  sectionNumber: number;
  sectionTitle: string; // "SECTION 1 | CORE ACCENT SOUNDS | DAYS 1-10"
  subtitle?: string;
  daysRange: string;
  items: CurriculumDay[];
}

export interface CertificateRecord {
  id: string; // e.g. "AA-630H" or "VV-AA-630H"
  certificateNumber: string; // e.g. "VV-AA-630H"
  studentName: string;
  courseTitle: string;
  completionDate: string; // "20 October 2026"
  score: number; // 97
  grade: string; // "Certified in American Accent Training"
  instructorName: string;
  leadSpecialistRole: string;
  programManager: string; // "AKHTAR HAYAT"
  ceo: string; // "FAIZAN MUHAMMAD"
  duration: string; // "24 Days (6 Weeks • 4 Classes / Week • 1-to-1 Training • 60 Min / Class)"
  accreditationAuthority: string;
  verificationUrl: string;
  verificationHash: string;
  certificateImageUrl: string;
  skills: string[];
  moduleBreakdown: {
    title: string;
    score: number;
    description: string;
  }[];
  curriculumSections?: CurriculumSection[];
  customScannedImageUrl?: string;
}

export type AccentType = 'American Accent' | 'British Accent';

export type SessionType = 'One-on-One Session' | 'Group Session' | 'Both Options (1-on-1 & Group)';

export interface OrderRecord {
  id: string;
  orderNumber: string; // e.g. "VV-2026-8492"
  referenceId: string; // e.g. "VV-ORD-8492-REV"
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  country?: string;
  nativeLanguage?: string;
  productName: string;
  sku: string;
  originalPrice: number; // 49.00
  discountAmount: number; // 49.00
  finalAmount: number; // 0.00
  currency: string; // "USD"
  promoCode: string; // "TRUSTPILOT100"
  status: 'Completed' | 'Verified';
  createdAt: string;
  trustpilotAfsTriggered: boolean;
  trustpilotReviewUrl: string;
}

export interface Instructor {
  id: string;
  name: string;
  role: 'American Accent Instructor' | 'British Accent Instructor' | 'Core Language & Speech Instructor' | string;
  gender?: 'male' | 'female';
  photoUrl: string;
  bio: string;
  specialization: string;
  offersOneOnOne?: boolean;
}

export interface ContactInfo {
  email: string;
  phoneWhatsapp: string;
  instagramHandle: string;
  instagramUrl: string;
}

export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  interestedIn: AccentType;
  sessionFormat?: string;
  message: string;
}

export interface ContactSubmissionRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  interestedIn: string;
  sessionFormat?: string;
  message: string;
  submittedAt: string;
  status: 'New' | 'Contacted' | 'Enrolled' | string;
}

export interface Assignment {
  id: string;
  studentIdCode?: string; // '690H' | '625H' | 'ALL' | etc.
  targetStudentName?: string; // e.g. 'Hafsa Ghumman' | 'Abdul REHMAN' | 'All Students'
  title: string;
  assignedDate: string;
  dueDate: string;
  dueDateTimeMs?: number;
  instructions: string;
  imageUrl?: string;
  status: 'Pending' | 'Submitted' | 'Closed';
  submittedFile?: {
    name: string;
    size: string;
    type: string;
    date: string;
    dataUrl?: string;
    studentIdCode?: string;
    studentName?: string;
  };
}

export interface CourseResource {
  id: string;
  studentIdCode: string; // e.g. '625H' or 'ALL'
  targetStudentName: string;
  instructorName: string;
  title: string;
  description: string;
  category: 'Grammar & Vocabulary' | 'Phonetics & Pronunciation' | 'Listening & Audio' | 'Worksheets & Guides' | 'General Reading' | string;
  uploadedAt: string;
  file?: {
    name: string;
    size: string;
    type: string;
    dataUrl?: string;
  };
  linkUrl?: string;
}

export interface StudentProfile {
  id: string;
  studentId: string;
  email: string;
  name: string;
  instructorName: string;
  courseProgram: 'American Accent Program' | 'British Accent Program' | 'Core Language Program' | string;
  accentType: AccentType | 'Core Language' | string;
  activeAssignments: Assignment[];
  previousAssignments: Assignment[];
  resources?: CourseResource[];
}
