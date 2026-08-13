import { Instructor, ContactInfo, StudentProfile } from './types';

export const LOGO_URL = 'https://i.ibb.co/gKXRzPS/Vocal-Vantage-6.png';

export const DEFAULT_CONTACT_INFO: ContactInfo = {
  email: 'info@vocalvantage.online',
  phoneWhatsapp: '+92-370-6555909 / +1-417-346-2315',
  instagramHandle: '@vocal_vantage_network',
  instagramUrl: 'https://instagram.com/vocal_vantage_network',
};

export const INITIAL_INSTRUCTORS: Instructor[] = [
  // American Accent Instructors
  {
    id: 'inst-1',
    name: 'Mr. Hammad Hassan',
    role: 'American Accent Instructor',
    gender: 'male',
    photoUrl: 'https://i.ibb.co/hR49LtHt/Vocal-Vantage-2.png',
    bio: 'Lead American accent and phonetics specialist with extensive experience coaching corporate executives, broadcasters, and ESL students in General American pronunciation and conversational resonance.',
    specialization: 'General American Phonetics, Executive Fluency & Vowel Precision',
  },
  {
    id: 'inst-2',
    name: 'Ms. Zeba Akhtar',
    role: 'American Accent Instructor',
    gender: 'female',
    photoUrl: 'https://i.ibb.co/yc1QW9Cy/Vocal-Vantage-3.png',
    bio: 'Certified speech and intonation coach specializing in personalized American speech patterns. Offers exclusive One-on-One coaching sessions for targeted accent modification and vocal clarity.',
    specialization: 'American Intonation, Connected Speech & One-on-One Coaching',
    offersOneOnOne: true,
  },
  {
    id: 'inst-3',
    name: 'Mr. Abdulleh Hashmi',
    role: 'American Accent Instructor',
    gender: 'male',
    photoUrl: 'https://i.ibb.co/hR49LtHt/Vocal-Vantage-2.png',
    bio: 'Expert phonetics coach specializing in American vowel shifts, stress cadence, and articulatory precision. Offers dedicated One-on-One training sessions.',
    specialization: 'Vowel Shift Cadence, Sentence Stress & One-on-One Training',
    offersOneOnOne: true,
  },
  {
    id: 'inst-4',
    name: 'Mr. Hashim Juni',
    role: 'American Accent Instructor',
    gender: 'male',
    photoUrl: 'https://i.ibb.co/hR49LtHt/Vocal-Vantage-2.png',
    bio: 'Senior communication and voice trainer specializing in North American rhythm, reduced speech forms, and pitch dynamics for international communicators.',
    specialization: 'Speech Rhythm, Pitch Dynamics & Reduced Forms',
  },

  // British Accent Instructors
  {
    id: 'inst-5',
    name: 'Mr. Khalid Awan',
    role: 'British Accent Instructor',
    gender: 'male',
    photoUrl: 'https://i.ibb.co/hR49LtHt/Vocal-Vantage-2.png',
    bio: 'Renowned Received Pronunciation (RP) instructor guiding students toward refined British diction, non-rhotic vowel articulation, and formal speech elocution.',
    specialization: 'Received Pronunciation (RP), Diction & Formal Speech',
  },
  {
    id: 'inst-6',
    name: 'Mr. Heydar Shah',
    role: 'British Accent Instructor',
    gender: 'male',
    photoUrl: 'https://i.ibb.co/hR49LtHt/Vocal-Vantage-2.png',
    bio: 'British accent and public speaking mentor skilled in pitch modulation, elegant intonation contours, and natural British conversational tone.',
    specialization: 'Intonation Contours, Tone Modulation & Public Speaking',
  },
  {
    id: 'inst-7',
    name: 'Ms. Fatima Imad',
    role: 'British Accent Instructor',
    gender: 'female',
    photoUrl: 'https://i.ibb.co/yc1QW9Cy/Vocal-Vantage-3.png',
    bio: 'Voice and phonology expert coaching students in standard British pronunciation, vowel length distinctions, and professional elocution.',
    specialization: 'Standard British Phonology, Vowel Distinctions & Elocution',
  },
  {
    id: 'inst-8',
    name: 'Ms. Zunaira Saeed',
    role: 'British Accent Instructor',
    gender: 'female',
    photoUrl: 'https://i.ibb.co/yc1QW9Cy/Vocal-Vantage-3.png',
    bio: 'Specialist in British speech rhythm, soft consonant release, and accent softening for career advancement and global presentations.',
    specialization: 'British Speech Rhythm, Consonant Release & Accent Softening',
  },
  {
    id: 'inst-9',
    name: 'Mr. Kashif Kayani',
    role: 'British Accent Instructor',
    gender: 'male',
    photoUrl: 'https://i.ibb.co/hR49LtHt/Vocal-Vantage-2.png',
    bio: 'Experienced British speech instructor focusing on articulatory precision, formal presentation delivery, and modern British standard pronunciation.',
    specialization: 'Articulatory Precision & Presentation Delivery',
  },
];

export const ABDUL_REHMAN_STUDENT: StudentProfile = {
  id: 'std-625h',
  studentId: '625H',
  email: 'abdul.rehman@vocalvantage.online',
  name: 'Abdul REHMAN',
  instructorName: 'Mr. Abdulleh Hashmi',
  courseProgram: 'American Accent Program',
  accentType: 'American Accent',
  activeAssignments: [],
  previousAssignments: [],
};

export const DEMO_STUDENT_AMERICAN = ABDUL_REHMAN_STUDENT;

export const DEMO_STUDENT_BRITISH: StudentProfile = {
  id: 'std-british-202',
  studentId: 'VV-2026-BR',
  email: 'student.british@vocalvantage.online',
  name: 'Liam Chen',
  instructorName: 'Julian Sterling',
  courseProgram: 'British Accent Program',
  accentType: 'British Accent',
  activeAssignments: [
    {
      id: 'asg-3',
      title: 'Home Task – Received Pronunciation Long Vowels & Non-Rhotic R',
      assignedDate: '8 August 2026',
      dueDate: '10 August 2026',
      instructions: 'Practice the assigned monologue focusing on non-rhotic post-vocalic R sounds (e.g., "car", "hard", "park") and crisp long vowel distinctions. Submit your audio or video recording.',
      status: 'Pending',
    },
  ],
  previousAssignments: [
    {
      id: 'asg-prev-2',
      title: 'Module 1 Assessment – British Intonation Contours',
      assignedDate: '2 August 2026',
      dueDate: '5 August 2026',
      instructions: 'Record the questions and statement pairs applying fall-rise pitch contours.',
      status: 'Submitted',
      submittedFile: {
        name: 'Liam_RP_Intonation_Module1.m4a',
        size: '4.8 MB',
        type: 'audio/m4a',
        date: '4 August 2026',
      },
    },
  ],
};
