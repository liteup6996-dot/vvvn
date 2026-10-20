import { Instructor, ContactInfo, StudentProfile, CertificateRecord } from './types';

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
    name: 'Miss Maha',
    role: 'Core Language & Speech Instructor',
    gender: 'female',
    photoUrl: 'https://i.ibb.co/yc1QW9Cy/Vocal-Vantage-3.png',
    bio: 'Specialist voice and articulation coach coaching students in Core Language mastery, vocabulary architecture, articulatory precision, and personalized 1-on-1 language development. Assigned instructor for Abdul Rehman.',
    specialization: 'Core Language Program, Articulatory Precision & One-on-One Coaching',
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
  instructorName: 'Miss Maha',
  courseProgram: 'Core Language Program',
  accentType: 'Core Language',
  activeAssignments: [],
  previousAssignments: [],
};

export const HAFSA_GHUMMAN_STUDENT: StudentProfile = {
  id: 'std-690h',
  studentId: '690H',
  email: 'hafsa.ghumman@vocalvantage.online',
  name: 'Hafsa Ghumman',
  instructorName: 'Mr. Hash',
  courseProgram: 'American Accent Program',
  accentType: 'American Accent',
  activeAssignments: [],
  previousAssignments: [],
};

export const ENROLLED_STUDENTS: StudentProfile[] = [
  HAFSA_GHUMMAN_STUDENT,
  ABDUL_REHMAN_STUDENT,
];

export const DEMO_STUDENT_AMERICAN = ABDUL_REHMAN_STUDENT;

export const DEMO_STUDENT_BRITISH: StudentProfile = {
  id: 'std-british-202',
  studentId: 'VV-2026-BR',
  email: 'student.british@vocalvantage.online',
  name: 'Liam Chen',
  instructorName: 'Julian Sterling',
  courseProgram: 'British Accent Program',
  accentType: 'British Accent',
  activeAssignments: [],
  previousAssignments: [],
};

export const DEFAULT_CERTIFICATE_AYESHA: CertificateRecord = {
  id: 'AA-630H',
  certificateNumber: 'VV-AA-630H',
  studentName: 'Ayesha Noor Muhammad',
  courseTitle: '24-Day American Accent Program',
  completionDate: '20 October 2026',
  score: 97,
  grade: 'Certified in American Accent Training (Score: 97%)',
  instructorName: 'Akhtar Hayat & Faizan Muhammad',
  leadSpecialistRole: 'Akhtar Hayat (Program Manager) • Faizan Muhammad (Chief Executive Officer)',
  programManager: 'AKHTAR HAYAT',
  ceo: 'FAIZAN MUHAMMAD',
  duration: '24 Days • 6 Weeks • 4 Classes / Week • 1-to-1 Training • 60 Min / Class',
  accreditationAuthority: 'Vocal Vantage - Speak Clear. Connect Confidently.',
  verificationUrl: 'https://vocalvantage.online/certify-id-AA-630H',
  verificationHash: 'e7c9b83a21f64980da6e0539c36214bf39a1c5d01249b646c82d7f8a3e9c1182',
  certificateImageUrl: '/certificates/VV-AA-630H.png',
  skills: [
    'Clean K & P Air Release (Days 1–4)',
    'CH / "Cha" Production Without Over-forcing (Days 5–6)',
    'Voiced TH /ð/ Tongue Placement (Days 7–8)',
    'Voiceless THETA /θ/ Contrast Drills (Days 9–10)',
    'Syllables & Word Stress Architecture (Day 11)',
    'Sentence Stress: Content vs Function Words (Day 12)',
    'Schwa /ə/ & Weak Forms in Unstressed Syllables (Day 13)',
    'Linking & Connected Speech Flow (Day 14)',
    'American Intonation: Rising/Falling Pitch (Day 15)',
    'Reductions & Contractions (Day 16)',
    'American T / Flap T /ɾ/ Conversational Speech (Day 17)',
    'Word Endings: -ED & -S Articulation (Day 18)',
    'R & L Tongue Position & Acoustic Clarity (Day 19)',
    'V & W Lip/Teeth Placement Distinction (Day 20)',
    'Rhythm, Thought Groups & Fluency Drills (Day 21)',
    'Native Speaker Shadowing & Mimicry (Day 22)',
    'Real-Life Workplace, Interviews & Meetings (Day 23)',
    'Final Clinical Assessment & 30-Day Plan (Day 24)',
  ],
  moduleBreakdown: [
    {
      title: 'Section 1: Core Accent Sounds (Days 1–10)',
      score: 98,
      description: 'Two sessions per target sound: K / "Ka", P / "Pa", CH / "Cha", Voiced TH /ð/, and Voiceless THETA /θ/ minimal-pair contrast.',
    },
    {
      title: 'Section 2: Accent Mechanics (Days 11–16)',
      score: 97,
      description: 'Syllables & word stress, content vs. function words, relaxed schwa /ə/, smooth linking, American pitch intonation, and natural contractions.',
    },
    {
      title: 'Section 3: American Pronunciation Patterns (Days 17–20)',
      score: 96,
      description: 'Soft American Flap T /ɾ/, word endings (-ED & -S), R & L clarity and mouth position, and V & W lip/teeth differentiation.',
    },
    {
      title: 'Section 4: Fluency, Listening & Real-Life Application (Days 21–24)',
      score: 98,
      description: 'Rhythm with thought groups, native clip shadowing, workplace & interview role-plays, and final comprehensive speech assessment.',
    },
  ],
  curriculumSections: [
    {
      sectionNumber: 1,
      sectionTitle: 'SECTION 1 | CORE ACCENT SOUNDS',
      daysRange: 'DAYS 1-10',
      subtitle: 'Two sessions per target sound: placement, repetition, vocabulary, sentence drills, short reading, and conversation.',
      items: [
        {
          days: '1-2',
          focus: 'K / "Ka"',
          content: 'Clean K release and mouth placement. Vocabulary: key, keep, kind, car, correct, school, speak, work. Move from isolated words to short sentences and conversation.',
          score: 98,
        },
        {
          days: '3-4',
          focus: 'P / "Pa"',
          content: 'Lip closure and controlled air release. Vocabulary: people, paper, place, perfect, practice, problem, open, happy. Compare weak vs clear pronunciation.',
          score: 97,
        },
        {
          days: '5-6',
          focus: 'CH / "Cha"',
          content: 'Clear CH production without over-forcing. Vocabulary: chair, change, choice, chance, teacher, future, watch, much. Word-to-sentence and reading practice.',
          score: 99,
        },
        {
          days: '7-8',
          focus: 'TH / "Tha" /ð/',
          content: 'Voiced TH. Vocabulary: this, that, they, there, these, those, together, weather. Tongue placement plus conversational repetition.',
          score: 98,
        },
        {
          days: '9-10',
          focus: 'THETA / θ',
          content: 'Voiceless TH. Vocabulary: think, thank, three, Thursday, healthy, method, both, month. Minimal-pair listening, sentence drills, and confidence practice.',
          score: 97,
        },
      ],
    },
    {
      sectionNumber: 2,
      sectionTitle: 'SECTION 2 | ACCENT MECHANICS',
      daysRange: 'DAYS 11-16',
      subtitle: 'Professional concepts, explained simply. Every technical point is immediately practiced through words and real speech.',
      items: [
        {
          days: '11',
          focus: 'Syllables & Word Stress',
          content: 'Divide words into beats and identify the strongest syllable. Examples: TAble, beGIN, PREsent / preSENT, PHOtograph / phoTOGraphy.',
          score: 97,
        },
        {
          days: '12',
          focus: 'Sentence Stress',
          content: 'Introduce content words vs function words. Example: “I NEED the REPORT by FRIDAY.” Practice emphasis so speech sounds less flat.',
          score: 96,
        },
        {
          days: '13',
          focus: 'Schwa /ə/ & Weak Forms',
          content: 'Teach the relaxed vowel /ə/ in unstressed syllables. Examples: about, ago, support, problem, today. Apply in short natural sentences.',
          score: 98,
        },
        {
          days: '14',
          focus: 'Linking & Connected Speech',
          content: 'Connect words smoothly: pick_it_up, turn_it_on, an_apple, next_day, want_it. Practice short phrases, then complete sentences.',
          score: 97,
        },
        {
          days: '15',
          focus: 'American Intonation',
          content: 'Simple rising/falling pitch for statements, yes/no questions, open questions, lists, and emphasis. Repeat natural patterns rather than memorizing theory.',
          score: 98,
        },
        {
          days: '16',
          focus: 'Reductions & Contractions',
          content: 'Natural spoken forms: I’m, you’re, can’t, didn’t, going to, want to, have to. Explain when reduced speech is natural and when clearer formal speech is better.',
          score: 96,
        },
      ],
    },
    {
      sectionNumber: 3,
      sectionTitle: 'SECTION 3 | AMERICAN PRONUNCIATION PATTERNS',
      daysRange: 'DAYS 17-20',
      subtitle: 'Technical enough to demonstrate real accent training, but easy to teach through examples, comparison, and repetition.',
      items: [
        {
          days: '17',
          focus: 'American T / Flap T /ɾ/',
          content: 'Teach the soft American T in water, better, city, pretty, meeting. Compare careful pronunciation with natural conversational speech.',
          score: 98,
        },
        {
          days: '18',
          focus: 'Word Endings: -ED & -S',
          content: 'Three common pronunciations through examples: worked, played, wanted; cats, dogs, buses. Focus on clarity rather than rule memorization.',
          score: 96,
        },
        {
          days: '19',
          focus: 'R & L Clarity',
          content: 'Mouth-position work for common R/L confusion. Vocabulary: right/light, road/load, glass/grass, really, world, clear. Record and correct.',
          score: 95,
        },
        {
          days: '20',
          focus: 'V & W Clarity',
          content: 'Lip/teeth placement for V and rounded-lip W. Vocabulary: very/wary, vest/west, vine/wine, voice, work, view. Finish with conversation drills.',
          score: 97,
        },
      ],
    },
    {
      sectionNumber: 4,
      sectionTitle: 'SECTION 4 | FLUENCY, LISTENING & REAL-LIFE APPLICATION',
      daysRange: 'DAYS 21-24',
      subtitle: 'The final stage combines the sound work and technical patterns into natural, confident speaking.',
      items: [
        {
          days: '21',
          focus: 'Rhythm & Fluency Drills',
          content: 'Combine stress, linking, reductions, and target sounds in short passages. Use thought groups and 30-60 second spontaneous answers.',
          score: 98,
        },
        {
          days: '22',
          focus: 'Shadowing & Listening',
          content: 'Listen to a short native-speaker clip, imitate its rhythm and pronunciation, record a second attempt, and correct the most important errors.',
          score: 97,
        },
        {
          days: '23',
          focus: 'Real-Life Speaking',
          content: 'Role-plays for university, workplace, interviews, introductions, meetings, travel, and social conversation. Prioritize clarity and confidence.',
          score: 99,
        },
        {
          days: '24',
          focus: 'Final Assessment & Plan',
          content: 'Repeat selected Day 1 tasks. Assess target sounds, word stress, connected speech, intonation, and fluency. Give a personalized 30-day practice plan.',
          score: 97,
        },
      ],
    },
  ],
};

export const CERTIFICATES_DATABASE: Record<string, CertificateRecord> = {
  'AA-630H': DEFAULT_CERTIFICATE_AYESHA,
  'aa-630h': DEFAULT_CERTIFICATE_AYESHA,
  'VV-AA-630H': DEFAULT_CERTIFICATE_AYESHA,
  'vv-aa-630h': DEFAULT_CERTIFICATE_AYESHA,
  'AA630H': DEFAULT_CERTIFICATE_AYESHA,
  'aa630h': DEFAULT_CERTIFICATE_AYESHA,
  '630H': DEFAULT_CERTIFICATE_AYESHA,
  '630h': DEFAULT_CERTIFICATE_AYESHA,
};
