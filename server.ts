import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure data directory and storage files exist
const DATA_DIR = path.join(process.cwd(), 'data');
const ASSIGNMENTS_FILE = path.join(DATA_DIR, 'assignments.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contact_submissions.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const RESOURCES_FILE = path.join(DATA_DIR, 'resources.json');
const SUPABASE_CONFIG_FILE = path.join(DATA_DIR, 'supabase_config.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

if (!fs.existsSync(RESOURCES_FILE)) {
  fs.writeFileSync(RESOURCES_FILE, JSON.stringify([], null, 2), 'utf-8');
}

if (!fs.existsSync(ASSIGNMENTS_FILE)) {
  fs.writeFileSync(ASSIGNMENTS_FILE, JSON.stringify([]), 'utf-8');
}

if (!fs.existsSync(CONTACTS_FILE)) {
  // Seed with sample initial inquiry for instant admin view
  const initialContacts = [
    {
      id: 'sub-sample-01',
      fullName: 'Eleanor Vance',
      email: 'eleanor.vance@example.com',
      phone: '+1 (555) 234-5678',
      interestedIn: 'American Accent',
      sessionFormat: 'One-on-One Session',
      message: 'Looking to refine American pronunciation for executive presentations.',
      submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'New',
    },
    {
      id: 'sub-sample-02',
      fullName: 'Muhammad Ali',
      email: 'm.ali@example.com',
      phone: '+92 300 1234567',
      interestedIn: 'British Accent',
      sessionFormat: 'Group Session',
      message: 'Inquiring about upcoming RP British accent group masterclass batch schedule.',
      submittedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      status: 'Contacted',
    },
  ];
  fs.writeFileSync(CONTACTS_FILE, JSON.stringify(initialContacts, null, 2), 'utf-8');
}

if (!fs.existsSync(SUPABASE_CONFIG_FILE)) {
  fs.writeFileSync(
    SUPABASE_CONFIG_FILE,
    JSON.stringify({ url: process.env.VITE_SUPABASE_URL || '', key: process.env.VITE_SUPABASE_ANON_KEY || '' }),
    'utf-8'
  );
}

// Helper: Read and write JSON files safely
function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T): boolean {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Get Supabase Client on demand
function getSupabaseClient(): SupabaseClient | null {
  let url = process.env.VITE_SUPABASE_URL || '';
  let key = process.env.VITE_SUPABASE_ANON_KEY || '';

  const fileConfig = readJsonFile<{ url: string; key: string }>(SUPABASE_CONFIG_FILE, { url: '', key: '' });
  if (!url) url = fileConfig.url;
  if (!key) key = fileConfig.key;

  url = url.trim();
  key = key.trim();

  if (url && key && url.startsWith('http')) {
    try {
      return createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    } catch (err) {
      console.error('Failed to instantiate Supabase client:', err);
    }
  }
  return null;
}

// API ROUTE: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API ROUTE: Get Supabase Config Status
app.get('/api/supabase/config', (req, res) => {
  const supabase = getSupabaseClient();
  const fileConfig = readJsonFile<{ url: string; key: string }>(SUPABASE_CONFIG_FILE, { url: '', key: '' });
  res.json({
    configured: Boolean(supabase),
    url: fileConfig.url,
    key: fileConfig.key,
  });
});

// API ROUTE: Update Supabase Config
app.post('/api/supabase/config', (req, res) => {
  const { url, key } = req.body;
  if (url && key) {
    writeJsonFile(SUPABASE_CONFIG_FILE, { url: url.trim(), key: key.trim() });
    return res.json({ success: true, configured: true });
  }
  return res.status(400).json({ success: false, message: 'Invalid URL or Key' });
});

// API ROUTE: User Auth
app.post('/api/auth/login', async (req, res) => {
  const { role, identifier, password } = req.body;
  const cleanId = (identifier || '').trim();
  const cleanPass = (password || '').trim();

  // Admin Login Check (username: 123123, passcode: 1122)
  if (role === 'admin' || (cleanId === '123123' && cleanPass === '1122' && role === 'admin')) {
    if (cleanId === '123123' && cleanPass === '1122') {
      return res.json({
        success: true,
        role: 'admin',
        adminInfo: {
          id: '123123',
          name: 'Vocal Vantage Administrator',
          email: 'admin@vocalvantage.online',
        },
        source: 'server-local',
      });
    }
    return res.status(401).json({ success: false, errorMessage: 'Invalid Admin username or passcode.' });
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('user_id_code', cleanId)
        .eq('role', role)
        .single();

      if (data && !error && data.password === cleanPass) {
        if (role === 'student') {
          const studentName =
            data.name ||
            (data.user_id_code?.toUpperCase() === '690H' ? 'Hafsa Ghumman' : 'Abdul REHMAN');
          const instructorName =
            data.user_id_code?.toUpperCase() === '625H'
              ? 'Miss Maha'
              : data.instructor_name ||
                (data.user_id_code?.toUpperCase() === '690H' ? 'Mr. Hash' : 'Miss Maha');
          const email =
            data.email ||
            (data.user_id_code?.toUpperCase() === '690H'
              ? 'hafsa.ghumman@vocalvantage.online'
              : 'abdul.rehman@vocalvantage.online');

          const courseProgram =
            data.user_id_code?.toUpperCase() === '625H'
              ? 'Core Language Program'
              : data.course_program || 'American Accent Program';
          const accentType =
            data.user_id_code?.toUpperCase() === '625H'
              ? 'Core Language'
              : data.accent_type || 'American Accent';

          return res.json({
            success: true,
            role: 'student',
            studentProfile: {
              id: data.id || `std-${data.user_id_code.toLowerCase()}`,
              studentId: data.user_id_code,
              email: email,
              name: studentName,
              instructorName: instructorName,
              courseProgram: courseProgram,
              accentType: accentType,
              activeAssignments: [],
              previousAssignments: [],
            },
            source: 'supabase',
          });
        } else {
          return res.json({
            success: true,
            role: 'instructor',
            instructorInfo: {
              id: data.user_id_code,
              name: data.name || 'Miss Maha',
              email: data.email || 'miss.maha@vocalvantage.online',
            },
            source: 'supabase',
          });
        }
      }
    } catch (err) {
      console.warn('Supabase auth fallback:', err);
    }
  }

  // Fallback to default local credentials
  if (role === 'student') {
    if (cleanId.toUpperCase() === '690H' && cleanPass === '162123') {
      return res.json({
        success: true,
        role: 'student',
        studentProfile: {
          id: 'std-690h',
          studentId: '690H',
          email: 'hafsa.ghumman@vocalvantage.online',
          name: 'Hafsa Ghumman',
          instructorName: 'Mr. Hash',
          courseProgram: 'American Accent Program',
          accentType: 'American Accent',
          activeAssignments: [],
          previousAssignments: [],
        },
        source: 'server-local',
      });
    } else if (cleanId.toUpperCase() === '625H' && cleanPass === '162111') {
      return res.json({
        success: true,
        role: 'student',
        studentProfile: {
          id: 'std-625h',
          studentId: '625H',
          email: 'abdul.rehman@vocalvantage.online',
          name: 'Abdul REHMAN',
          instructorName: 'Miss Maha',
          courseProgram: 'Core Language Program',
          accentType: 'Core Language',
          activeAssignments: [],
          previousAssignments: [],
        },
        source: 'server-local',
      });
    }
    return res.status(401).json({ success: false, errorMessage: 'Invalid Student ID or password.' });
  } else {
    // Instructor login for Miss Maha (supports ID: MAHA, 123123, or MISS MAHA with pass: 1122 or 162123)
    const isMaha =
      (cleanId.toUpperCase() === 'MAHA' && (cleanPass === '1122' || cleanPass === '162123')) ||
      (cleanId === '123123' && (cleanPass === '1122' || cleanPass === '162123')) ||
      (cleanId.toUpperCase() === 'MISS MAHA' && (cleanPass === '1122' || cleanPass === '162123')) ||
      (cleanId === '1003' && cleanPass === '1122');

    if (isMaha) {
      return res.json({
        success: true,
        role: 'instructor',
        instructorInfo: {
          id: cleanId.toUpperCase() === 'MAHA' ? 'MAHA' : '123123',
          name: 'Miss Maha',
          email: 'miss.maha@vocalvantage.online',
        },
        source: 'server-local',
      });
    }
    return res.status(401).json({ success: false, errorMessage: 'Invalid Instructor ID or password.' });
  }
});

// API ROUTE: Fetch Enrolled Students List
app.get('/api/students', async (req, res) => {
  const { instructor, instructorName } = req.query;
  const isMahaReq =
    (typeof instructor === 'string' && (instructor.toUpperCase() === 'MAHA' || instructor === '123123')) ||
    (typeof instructorName === 'string' && instructorName.toLowerCase().includes('maha'));

  const defaultStudents = [
    {
      id: 'std-690h',
      studentId: '690H',
      email: 'hafsa.ghumman@vocalvantage.online',
      name: 'Hafsa Ghumman',
      instructorName: 'Mr. Hash',
      courseProgram: 'American Accent Program',
      accentType: 'American Accent',
      activeAssignments: [],
      previousAssignments: [],
    },
    {
      id: 'std-625h',
      studentId: '625H',
      email: 'abdul.rehman@vocalvantage.online',
      name: 'Abdul REHMAN',
      instructorName: 'Miss Maha',
      courseProgram: 'Core Language Program',
      accentType: 'Core Language',
      activeAssignments: [],
      previousAssignments: [],
    },
  ];

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      if (!error && data && data.length > 0) {
        let mapped = data.map((p) => {
          const is625H = p.user_id_code?.toUpperCase() === '625H';
          return {
            id: p.id || `std-${p.user_id_code?.toLowerCase()}`,
            studentId: p.user_id_code,
            email: p.email || (p.user_id_code === '690H' ? 'hafsa.ghumman@vocalvantage.online' : 'abdul.rehman@vocalvantage.online'),
            name: p.name || (p.user_id_code === '690H' ? 'Hafsa Ghumman' : 'Abdul REHMAN'),
            instructorName: is625H ? 'Miss Maha' : p.instructor_name || (p.user_id_code === '690H' ? 'Mr. Hash' : 'Miss Maha'),
            courseProgram: is625H ? 'Core Language Program' : p.course_program || 'American Accent Program',
            accentType: is625H ? 'Core Language' : p.accent_type || 'American Accent',
            activeAssignments: [],
            previousAssignments: [],
          };
        });

        if (isMahaReq) {
          mapped = mapped.filter((s) => s.studentId === '625H' || s.instructorName.toLowerCase().includes('maha'));
        }

        return res.json({ success: true, students: mapped });
      }
    } catch (err) {
      console.warn('Supabase fetch students warning:', err);
    }
  }

  let resultStudents = defaultStudents;
  if (isMahaReq) {
    resultStudents = defaultStudents.filter((s) => s.studentId === '625H');
  }

  res.json({ success: true, students: resultStudents });
});

// API ROUTE: Fetch Contact Submissions
app.get('/api/contacts', async (req, res) => {
  const contactsMap = new Map<string, any>();

  // 1. Read local contacts
  const localContacts = readJsonFile<any[]>(CONTACTS_FILE, []);
  localContacts.forEach((c) => {
    if (c && c.id) contactsMap.set(c.id, c);
  });

  // 2. Fetch Supabase contacts
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        data.forEach((row) => {
          const c = {
            id: row.id,
            fullName: row.full_name,
            email: row.email,
            phone: row.phone,
            interestedIn: row.interested_in,
            sessionFormat: row.session_format,
            message: row.message,
            submittedAt: row.submitted_at,
            status: row.status || 'New',
          };
          contactsMap.set(c.id, c);
        });
      } else if (error) {
        console.warn('Supabase fetch contacts notice:', error.message || error);
      }
    } catch (err) {
      console.warn('Supabase fetch contacts error:', err);
    }
  }

  const combinedContacts = Array.from(contactsMap.values()).sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  res.json({ success: true, contacts: combinedContacts, source: supabase ? 'supabase-merged' : 'server-local' });
});

// API ROUTE: Create Contact Submission
app.post('/api/contacts', async (req, res) => {
  const { fullName, email, phone, interestedIn, sessionFormat, message } = req.body;
  if (!fullName || !email || !phone) {
    return res.status(400).json({ success: false, message: 'Name, email and phone are required.' });
  }

  const newSubmission = {
    id: `sub-${Date.now()}`,
    fullName: String(fullName).trim(),
    email: String(email).trim(),
    phone: String(phone).trim(),
    interestedIn: String(interestedIn || 'American Accent').trim(),
    sessionFormat: String(sessionFormat || 'Both Options (Group & 1-on-1)').trim(),
    message: String(message || '').trim(),
    submittedAt: new Date().toISOString(),
    status: 'New',
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('contact_submissions').insert([
        {
          id: newSubmission.id,
          full_name: newSubmission.fullName,
          email: newSubmission.email,
          phone: newSubmission.phone,
          interested_in: newSubmission.interestedIn,
          session_format: newSubmission.sessionFormat,
          message: newSubmission.message,
          submitted_at: newSubmission.submittedAt,
          status: newSubmission.status,
        },
      ]);
      if (error) {
        console.warn('Supabase contact insert notice:', error.message || error);
      }
    } catch (err) {
      console.warn('Supabase contact insert warning:', err);
    }
  }

  const contacts = readJsonFile<any[]>(CONTACTS_FILE, []);
  contacts.unshift(newSubmission);
  writeJsonFile(CONTACTS_FILE, contacts);

  res.json({ success: true, submission: newSubmission });
});

// API ROUTE: Update Contact Submission Status
app.patch('/api/contacts/:id/status', async (req, res) => {
  const subId = req.params.id;
  const { status } = req.body;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('contact_submissions').update({ status }).eq('id', subId);
    } catch (err) {
      console.warn('Supabase update contact status error:', err);
    }
  }

  const contacts = readJsonFile<any[]>(CONTACTS_FILE, []);
  const updated = contacts.map((c) => (c.id === subId ? { ...c, status } : c));
  writeJsonFile(CONTACTS_FILE, updated);

  res.json({ success: true });
});

// API ROUTE: Delete Single Contact Submission
app.delete('/api/contacts/:id', async (req, res) => {
  const subId = req.params.id;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('contact_submissions').delete().eq('id', subId);
    } catch (err) {
      console.warn('Supabase delete contact error:', err);
    }
  }

  const contacts = readJsonFile<any[]>(CONTACTS_FILE, []);
  const filtered = contacts.filter((c) => c.id !== subId);
  writeJsonFile(CONTACTS_FILE, filtered);

  res.json({ success: true });
});

// API ROUTE: Clear All Contact Submissions
app.delete('/api/contacts', async (req, res) => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('contact_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (err) {
      console.warn('Supabase clear contacts error:', err);
    }
  }

  writeJsonFile(CONTACTS_FILE, []);
  res.json({ success: true });
});

// =========================================================================
// API ROUTES: ORDERS & OFFICIAL TRUSTPILOT REVIEW VERIFICATION (0 USD FLOW)
// =========================================================================

// POST /api/orders - Process $0.00 USD Free Order for Verified Trustpilot Evaluation
app.post('/api/orders', async (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    country,
    nativeLanguage,
    promoCode = 'TRUSTPILOT100',
    productName = 'General American Accent Diagnostic & Vocal Mastery Starter Kit',
    sku = 'VV-0USD-ACCENT-KIT',
  } = req.body;

  if (!customerName || !customerEmail) {
    return res.status(400).json({
      success: false,
      message: 'Full name and email address are required for order registration and Trustpilot verification.',
    });
  }

  // Generate official reference ID and order number
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const randRef = Math.floor(100000 + Math.random() * 900000);
  const orderNumber = `VV-2026-${randNum}`;
  const referenceId = `VV-ORD-${randRef}-REV`;
  const cleanName = String(customerName).trim();
  const cleanEmail = String(customerEmail).trim().toLowerCase();

  const trustpilotReviewUrl = `https://www.trustpilot.com/evaluate/vocalvantage.online?email=${encodeURIComponent(cleanEmail)}&name=${encodeURIComponent(cleanName)}&referenceId=${encodeURIComponent(referenceId)}`;

  const newOrder = {
    id: `ord-${Date.now()}`,
    orderNumber,
    referenceId,
    customerName: cleanName,
    customerEmail: cleanEmail,
    customerPhone: customerPhone ? String(customerPhone).trim() : '',
    country: country ? String(country).trim() : 'International',
    nativeLanguage: nativeLanguage ? String(nativeLanguage).trim() : 'English / Non-Native ESL',
    productName: String(productName).trim(),
    sku: String(sku).trim(),
    originalPrice: 49.00,
    discountAmount: 49.00,
    finalAmount: 0.00,
    currency: 'USD',
    promoCode: String(promoCode).trim(),
    status: 'Completed',
    createdAt: new Date().toISOString(),
    trustpilotAfsTriggered: true,
    trustpilotReviewUrl,
    trustpilotInvitationSent: true,
  };

  // Optional: record in Supabase if an orders table exists
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('orders').insert([
        {
          id: newOrder.id,
          order_number: newOrder.orderNumber,
          reference_id: newOrder.referenceId,
          customer_name: newOrder.customerName,
          customer_email: newOrder.customerEmail,
          product_name: newOrder.productName,
          final_amount: 0.00,
          created_at: newOrder.createdAt,
        },
      ]);
    } catch {
      // Supabase table may not exist, local JSON fallback is primary
    }
  }

  const orders = readJsonFile<any[]>(ORDERS_FILE, []);
  orders.unshift(newOrder);
  writeJsonFile(ORDERS_FILE, orders);

  return res.json({
    success: true,
    order: newOrder,
    message: 'Order confirmed and verified for official Trustpilot review.',
  });
});

// GET /api/orders - Fetch all orders
app.get('/api/orders', (req, res) => {
  const orders = readJsonFile<any[]>(ORDERS_FILE, []);
  res.json({ success: true, count: orders.length, orders });
});

// GET /api/orders/:identifier - Verify order by orderNumber, referenceId or id
app.get('/api/orders/:identifier', (req, res) => {
  const { identifier } = req.params;
  const cleanId = String(identifier).trim().toUpperCase();
  const orders = readJsonFile<any[]>(ORDERS_FILE, []);

  const found = orders.find(
    (o) =>
      o.id.toUpperCase() === cleanId ||
      o.orderNumber.toUpperCase() === cleanId ||
      o.referenceId.toUpperCase() === cleanId
  );

  if (!found) {
    return res.status(404).json({ success: false, message: 'Order reference not found' });
  }

  res.json({ success: true, verified: true, order: found });
});

// API ROUTE: Fetch Assignments (Merges Supabase & Server File Store)
app.get('/api/assignments', async (req, res) => {
  const { studentIdCode, instructor, instructorName } = req.query;
  const isMahaOnly =
    (typeof instructor === 'string' && (instructor.toUpperCase() === 'MAHA' || instructor === '123123')) ||
    (typeof instructorName === 'string' && instructorName.toLowerCase().includes('maha'));

  const supabase = getSupabaseClient();
  let supabaseAssignments: any[] = [];
  let isSupabaseActive = false;

  if (supabase) {
    try {
      const { data: asgData, error: asgError } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!asgError && asgData) {
        isSupabaseActive = true;
        const { data: subData } = await supabase.from('submissions').select('*');
        const subMap: Record<string, any> = {};
        if (subData) {
          subData.forEach((sub) => {
            subMap[sub.assignment_id] = {
              name: sub.file_name,
              size: sub.file_size,
              type: sub.file_type,
              date: sub.submission_date,
              dataUrl: sub.data_url,
              studentIdCode: sub.student_id_code,
              studentName:
                sub.student_id_code === '690H'
                  ? 'Hafsa Ghumman'
                  : sub.student_id_code === '625H'
                  ? 'Abdul REHMAN'
                  : sub.student_id_code,
            };
          });
        }

        supabaseAssignments = asgData.map((row) => ({
          id: row.id,
          studentIdCode: row.student_id_code || 'ALL',
          targetStudentName:
            row.student_id_code === '690H'
              ? 'Hafsa Ghumman'
              : row.student_id_code === '625H'
              ? 'Abdul REHMAN'
              : row.student_id_code === 'ALL'
              ? 'All Students'
              : row.student_id_code,
          title: row.title,
          instructions: row.instructions,
          assignedDate: row.assigned_date,
          dueDate: row.due_date,
          dueDateTimeMs: row.due_date_time_ms ? Number(row.due_date_time_ms) : undefined,
          imageUrl: row.image_url || undefined,
          status: row.status,
          submittedFile: subMap[row.id] || undefined,
        }));
      } else {
        if (asgError) console.error('Supabase fetch assignments error:', asgError);
      }
    } catch (err) {
      console.warn('Supabase fetch assignments warning:', err);
    }
  }

  let finalAssignments = isSupabaseActive
    ? supabaseAssignments
    : readJsonFile<any[]>(ASSIGNMENTS_FILE, []);

  // Isolate assignments for Miss Maha: ONLY Abdul Rehman (625H)
  if (isMahaOnly) {
    finalAssignments = finalAssignments.filter((a) => a.studentIdCode === '625H');
  } else if (typeof studentIdCode === 'string' && studentIdCode.trim()) {
    const code = studentIdCode.trim().toUpperCase();
    finalAssignments = finalAssignments.filter((a) => a.studentIdCode === code || a.studentIdCode === 'ALL');
  }

  res.json({
    success: true,
    assignments: finalAssignments,
    supabaseConnected: isSupabaseActive,
    source: isSupabaseActive ? 'supabase-cloud' : 'local-fallback',
  });
});

// API ROUTE: Create Assignment
app.post('/api/assignments', async (req, res) => {
  const { assignment, studentIdCode = '690H' } = req.body;
  if (!assignment || !assignment.id) {
    return res.status(400).json({ success: false, message: 'Assignment payload required' });
  }

  const targetCode = studentIdCode || assignment.studentIdCode || 'ALL';
  const targetName =
    targetCode === '690H'
      ? 'Hafsa Ghumman'
      : targetCode === '625H'
      ? 'Abdul REHMAN'
      : 'All Students';

  const assignmentWithTarget = {
    ...assignment,
    studentIdCode: targetCode,
    targetStudentName: targetName,
  };

  let savedToSupabase = false;
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const payload = {
        id: assignment.id,
        student_id_code: targetCode,
        title: assignment.title,
        instructions: assignment.instructions,
        assigned_date: assignment.assignedDate,
        due_date: assignment.dueDate,
        due_date_time_ms: assignment.dueDateTimeMs ? Number(assignment.dueDateTimeMs) : null,
        image_url: assignment.imageUrl || null,
        status: assignment.status || 'Pending',
      };
      const { error } = await supabase.from('assignments').upsert([payload], { onConflict: 'id' });
      if (!error) {
        savedToSupabase = true;
      } else {
        console.error('Supabase assignment creation error:', error);
      }
    } catch (err) {
      console.error('Supabase assignment creation exception:', err);
    }
  }

  // Always save to server JSON file
  const localAssignments = readJsonFile<any[]>(ASSIGNMENTS_FILE, []);
  const filtered = localAssignments.filter((a) => a.id !== assignment.id);
  filtered.unshift(assignmentWithTarget);
  writeJsonFile(ASSIGNMENTS_FILE, filtered);

  res.json({ success: true, savedToSupabase, assignment: assignmentWithTarget });
});

// API ROUTE: Submit Assignment File
app.post('/api/assignments/submit', async (req, res) => {
  const { assignmentId, studentIdCode = '690H', submittedFile } = req.body;
  if (!assignmentId || !submittedFile) {
    return res.status(400).json({ success: false, message: 'Missing submission parameters' });
  }

  let savedToSupabase = false;
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error: subErr } = await supabase.from('submissions').insert([
        {
          assignment_id: assignmentId,
          student_id_code: studentIdCode || '690H',
          file_name: submittedFile.name,
          file_size: submittedFile.size,
          file_type: submittedFile.type,
          submission_date: submittedFile.date,
          data_url: submittedFile.dataUrl || null,
        },
      ]);

      const { error: updErr } = await supabase
        .from('assignments')
        .update({ status: 'Submitted' })
        .eq('id', assignmentId);

      if (!subErr && !updErr) {
        savedToSupabase = true;
      } else {
        if (subErr) console.error('Supabase submission insert error:', subErr);
        if (updErr) console.error('Supabase assignment status update error:', updErr);
      }
    } catch (err) {
      console.error('Supabase submit assignment error:', err);
    }
  }

  // Update server JSON file
  const localAssignments = readJsonFile<any[]>(ASSIGNMENTS_FILE, []);
  const updated = localAssignments.map((a) => {
    if (a.id === assignmentId) {
      return {
        ...a,
        status: 'Submitted',
        submittedFile: {
          ...submittedFile,
          studentIdCode,
          studentName:
            studentIdCode === '690H'
              ? 'Hafsa Ghumman'
              : studentIdCode === '625H'
              ? 'Abdul REHMAN'
              : studentIdCode,
        },
      };
    }
    return a;
  });
  writeJsonFile(ASSIGNMENTS_FILE, updated);

  res.json({ success: true, savedToSupabase });
});

// API ROUTE: Delete Single Assignment
app.delete('/api/assignments/:id', async (req, res) => {
  const asgId = req.params.id;
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      await supabase.from('submissions').delete().eq('assignment_id', asgId);
      await supabase.from('assignments').delete().eq('id', asgId);
    } catch (err) {
      console.error('Supabase delete error:', err);
    }
  }

  const localAssignments = readJsonFile<any[]>(ASSIGNMENTS_FILE, []);
  const filtered = localAssignments.filter((a) => a.id !== asgId);
  writeJsonFile(ASSIGNMENTS_FILE, filtered);

  res.json({ success: true });
});

// API ROUTE: Clear All Assignments
app.delete('/api/assignments', async (req, res) => {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      await supabase.from('submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (err) {
      console.error('Supabase clear all error:', err);
    }
  }

  writeJsonFile(ASSIGNMENTS_FILE, []);
  res.json({ success: true });
});

// ==========================================
// API ROUTES: Study Materials & Resources (Dual Supabase & File Store)
// ==========================================

// GET /api/resources - Fetch learning resources (filtered by studentIdCode or instructor)
app.get('/api/resources', async (req, res) => {
  const { studentIdCode, instructor, instructorName } = req.query;
  const isMahaOnly =
    (typeof instructor === 'string' && (instructor.toUpperCase() === 'MAHA' || instructor === '123123')) ||
    (typeof instructorName === 'string' && instructorName.toLowerCase().includes('maha'));

  const supabase = getSupabaseClient();
  let supabaseResources: any[] = [];
  let isSupabaseActive = false;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        isSupabaseActive = true;
        supabaseResources = data.map((row) => ({
          id: row.id,
          studentIdCode: row.student_id_code || '625H',
          targetStudentName: row.target_student_name || 'Abdul REHMAN',
          instructorName: row.instructor_name || 'Miss Maha',
          title: row.title,
          description: row.description || '',
          category: row.category || 'Phonetics & Pronunciation',
          uploadedAt: row.uploaded_at || new Date().toISOString(),
          file: row.file_name
            ? {
                name: row.file_name,
                size: row.file_size || '',
                type: row.file_type || 'application/octet-stream',
                dataUrl: row.data_url || undefined,
              }
            : undefined,
          linkUrl: row.link_url || undefined,
        }));
      }
    } catch (err) {
      console.warn('Supabase resources fetch warning:', err);
    }
  }

  let finalResources = isSupabaseActive
    ? supabaseResources
    : readJsonFile<any[]>(RESOURCES_FILE, []);

  // Filter for Miss Maha or specific Student ID
  if (isMahaOnly) {
    finalResources = finalResources.filter(
      (r) => r.studentIdCode === '625H' || (r.instructorName && r.instructorName.toLowerCase().includes('maha'))
    );
  } else if (typeof studentIdCode === 'string' && studentIdCode.trim()) {
    const code = studentIdCode.trim().toUpperCase();
    finalResources = finalResources.filter(
      (r) => r.studentIdCode === code || r.studentIdCode === 'ALL'
    );
  }

  res.json({
    success: true,
    resources: finalResources,
    supabaseConnected: isSupabaseActive,
    source: isSupabaseActive ? 'supabase-cloud' : 'local-fallback',
  });
});

// POST /api/resources - Upload / Add a new resource
app.post('/api/resources', async (req, res) => {
  const { resource } = req.body;
  if (!resource || !resource.title) {
    return res.status(400).json({ success: false, message: 'Resource title and payload required' });
  }

  const resId = resource.id || `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const studentIdCode = resource.studentIdCode || '625H';
  const targetStudentName = resource.targetStudentName || (studentIdCode === '625H' ? 'Abdul REHMAN' : studentIdCode);
  const instructorName = resource.instructorName || 'Miss Maha';
  const title = resource.title;
  const description = resource.description || '';
  const category = resource.category || 'Phonetics & Pronunciation';
  const uploadedAt = resource.uploadedAt || new Date().toISOString();
  const file = resource.file;
  const linkUrl = resource.linkUrl || null;

  const newResource = {
    id: resId,
    studentIdCode,
    targetStudentName,
    instructorName,
    title,
    description,
    category,
    uploadedAt,
    file,
    linkUrl: linkUrl || undefined,
  };

  let savedToSupabase = false;
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('resources').upsert({
        id: resId,
        student_id_code: studentIdCode,
        target_student_name: targetStudentName,
        instructor_name: instructorName,
        title: title,
        description: description,
        category: category,
        uploaded_at: uploadedAt,
        file_name: file ? file.name : null,
        file_size: file ? file.size : null,
        file_type: file ? file.type : null,
        data_url: file ? file.dataUrl : null,
        link_url: linkUrl,
      });

      if (!error) {
        savedToSupabase = true;
      } else {
        console.warn('Supabase resource insert error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase resource save exception:', err);
    }
  }

  // Always sync to local JSON file
  const localResources = readJsonFile<any[]>(RESOURCES_FILE, []);
  const existingIdx = localResources.findIndex((r) => r.id === resId);
  if (existingIdx >= 0) {
    localResources[existingIdx] = newResource;
  } else {
    localResources.unshift(newResource);
  }
  writeJsonFile(RESOURCES_FILE, localResources);

  res.json({
    success: true,
    resource: newResource,
    savedToSupabase,
  });
});

// DELETE /api/resources/:id - Delete a resource
app.delete('/api/resources/:id', async (req, res) => {
  const resId = req.params.id;
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      await supabase.from('resources').delete().eq('id', resId);
    } catch (err) {
      console.error('Supabase delete resource error:', err);
    }
  }

  const localResources = readJsonFile<any[]>(RESOURCES_FILE, []);
  const filtered = localResources.filter((r) => r.id !== resId);
  writeJsonFile(RESOURCES_FILE, filtered);

  res.json({ success: true });
});

// VITE MIDDLEWARE / STATIC SERVING SETUP
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

start();
