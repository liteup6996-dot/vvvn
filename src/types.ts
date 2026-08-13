export type PageView = 'home' | 'team' | 'lms';

export type AccentType = 'American Accent' | 'British Accent';

export type SessionType = 'One-on-One Session' | 'Group Session' | 'Both Options (1-on-1 & Group)';

export interface Instructor {
  id: string;
  name: string;
  role: 'American Accent Instructor' | 'British Accent Instructor';
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
  };
}

export interface StudentProfile {
  id: string;
  studentId: string;
  email: string;
  name: string;
  instructorName: string;
  courseProgram: 'American Accent Program' | 'British Accent Program';
  accentType: AccentType;
  activeAssignments: Assignment[];
  previousAssignments: Assignment[];
}
