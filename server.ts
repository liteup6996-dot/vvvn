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
const SUPABASE_CONFIG_FILE = path.join(DATA_DIR, 'supabase_config.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(ASSIGNMENTS_FILE)) {
  fs.writeFileSync(ASSIGNMENTS_FILE, JSON.stringify([]), 'utf-8');
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
          return res.json({
            success: true,
            role: 'student',
            studentProfile: {
              id: data.id || 'student-1',
              studentId: data.user_id_code,
              email: data.email || 'abdulrehman@vocalvantage.edu',
              name: data.name || 'Abdul REHMAN',
              instructorName: data.instructor_name || 'Mr. Abdulleh Hashmi',
              courseProgram: data.course_program || 'American Accent Program',
              accentType: data.accent_type || 'American Accent',
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
              name: data.name || 'Mr. Abdulleh Hashmi',
              email: data.email || 'abdulleh.hashmi@vocalvantage.edu',
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
    if (cleanId.toUpperCase() === '625H' && cleanPass === '162111') {
      return res.json({
        success: true,
        role: 'student',
        studentProfile: {
          id: 'std-625h',
          studentId: '625H',
          email: 'abdul.rehman@vocalvantage.online',
          name: 'Abdul REHMAN',
          instructorName: 'Mr. Abdulleh Hashmi',
          courseProgram: 'American Accent Program',
          accentType: 'American Accent',
          activeAssignments: [],
          previousAssignments: [],
        },
        source: 'server-local',
      });
    }
    return res.status(401).json({ success: false, errorMessage: 'Invalid Student ID or password.' });
  } else {
    if (cleanId === '123123' && cleanPass === '1122') {
      return res.json({
        success: true,
        role: 'instructor',
        instructorInfo: {
          id: '123123',
          name: 'Mr. Abdulleh Hashmi',
          email: 'abdulleh.hashmi@vocalvantage.edu',
        },
        source: 'server-local',
      });
    }
    return res.status(401).json({ success: false, errorMessage: 'Invalid Instructor ID or password.' });
  }
});

// API ROUTE: Fetch Assignments (Merges Supabase & Server File Store)
app.get('/api/assignments', async (req, res) => {
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
            };
          });
        }

        supabaseAssignments = asgData.map((row) => ({
          id: row.id,
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

  if (isSupabaseActive) {
    return res.json({
      success: true,
      assignments: supabaseAssignments,
      supabaseConnected: true,
      source: 'supabase-cloud',
    });
  }

  const localAssignments = readJsonFile<any[]>(ASSIGNMENTS_FILE, []);
  res.json({
    success: true,
    assignments: localAssignments,
    supabaseConnected: Boolean(supabase),
    source: 'local-fallback',
  });
});

// API ROUTE: Create Assignment
app.post('/api/assignments', async (req, res) => {
  const { assignment, studentIdCode = '625H' } = req.body;
  if (!assignment || !assignment.id) {
    return res.status(400).json({ success: false, message: 'Assignment payload required' });
  }

  let savedToSupabase = false;
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const payload = {
        id: assignment.id,
        student_id_code: studentIdCode || '625H',
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
  filtered.unshift(assignment);
  writeJsonFile(ASSIGNMENTS_FILE, filtered);

  res.json({ success: true, savedToSupabase, assignment });
});

// API ROUTE: Submit Assignment File
app.post('/api/assignments/submit', async (req, res) => {
  const { assignmentId, studentIdCode = '625H', submittedFile } = req.body;
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
          student_id_code: studentIdCode || '625H',
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
      return { ...a, status: 'Submitted', submittedFile };
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
