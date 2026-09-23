export type PageView = 'home' | 'team' | 'lms' | 'review';

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
}
