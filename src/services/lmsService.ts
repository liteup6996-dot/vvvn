import { getSupabase, isSupabaseConfigured, initSupabaseFromBackend } from '../lib/supabase';
import { Assignment, StudentProfile } from '../types';
import { ABDUL_REHMAN_STUDENT } from '../data';
import {
  submitContactFormLogic,
  fetchContactFormSubmissionsLogic,
  subscribeToContactFormSubmissions,
  ContactSubmissionRecord,
} from './formLogic';

export {
  submitContactFormLogic as submitContactForm,
  fetchContactFormSubmissionsLogic as fetchContactSubmissions,
  subscribeToContactFormSubmissions,
};
export type { ContactSubmissionRecord };

export interface UserAuthResult {
  success: boolean;
  role?: 'student' | 'instructor' | 'admin';
  studentProfile?: StudentProfile;
  instructorInfo?: {
    id: string;
    name: string;
    email: string;
  };
  adminInfo?: {
    id: string;
    name: string;
    email: string;
  };
  errorMessage?: string;
  source: 'supabase' | 'server-local' | 'local';
}

/**
 * Authenticate student, teacher, or admin via Express Server (or Supabase/Local Fallback)
 */
export async function authenticateUser(
  role: 'student' | 'instructor' | 'admin',
  identifier: string,
  pass: string
): Promise<UserAuthResult> {
  const cleanId = identifier.trim();
  const cleanPass = pass.trim();

  // Admin explicit local check (username: 123123, passcode: 1122)
  if (role === 'admin' && cleanId === '123123' && cleanPass === '1122') {
    return {
      success: true,
      role: 'admin',
      adminInfo: {
        id: '123123',
        name: 'Vocal Vantage Administrator',
        email: 'admin@vocalvantage.online',
      },
      source: 'local',
    };
  }

  // 1. Try Express Server Auth Endpoint
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, identifier: cleanId, password: cleanPass }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          success: true,
          role: data.role,
          studentProfile: data.studentProfile,
          instructorInfo: data.instructorInfo,
          adminInfo: data.adminInfo,
          source: data.source || 'server-local',
        };
      } else {
        return {
          success: false,
          errorMessage: data.errorMessage || 'Invalid credentials.',
          source: 'server-local',
        };
      }
    }
  } catch (err) {
    console.warn('Backend auth endpoint unreachable, attempting client fallback:', err);
  }

  // 2. Direct Supabase Auth/DB if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .ilike('user_id_code', cleanId)
          .eq('role', role)
          .single();

        if (data && !error) {
          if (data.password === cleanPass) {
            if (role === 'student') {
              return {
                success: true,
                role: 'student',
                studentProfile: {
                  id: data.id || 'student-1',
                  studentId: data.user_id_code,
                  email: data.email || 'abdulrehman@vocalvantage.edu',
                  name: data.name || 'Abdul REHMAN',
                  instructorName: data.instructor_name || 'Mr. Abdulleh Hashmi',
                  courseProgram: (data.course_program as any) || 'American Accent Program',
                  accentType: (data.accent_type as any) || 'American Accent',
                  activeAssignments: [],
                  previousAssignments: [],
                },
                source: 'supabase',
              };
            } else {
              return {
                success: true,
                role: 'instructor',
                instructorInfo: {
                  id: data.user_id_code,
                  name: data.name || 'Mr. Abdulleh Hashmi',
                  email: data.email || 'abdulleh.hashmi@vocalvantage.edu',
                },
                source: 'supabase',
              };
            }
          } else {
            return {
              success: false,
              errorMessage: 'Invalid password for this account.',
              source: 'supabase',
            };
          }
        }
      } catch (err) {
        console.warn('Supabase profile query issue:', err);
      }
    }
  }

  // 3. Fallback to local credential validation
  if (role === 'student') {
    if (cleanId.toUpperCase() === '625H' && cleanPass === '162111') {
      return {
        success: true,
        role: 'student',
        studentProfile: ABDUL_REHMAN_STUDENT,
        source: 'local',
      };
    } else {
      return {
        success: false,
        errorMessage: 'Invalid Student ID or password.',
        source: 'local',
      };
    }
  } else {
    if (cleanId === '123123' && cleanPass === '1122') {
      return {
        success: true,
        role: 'instructor',
        instructorInfo: {
          id: '123123',
          name: 'Mr. Abdulleh Hashmi',
          email: 'abdulleh.hashmi@vocalvantage.edu',
        },
        source: 'local',
      };
    } else {
      return {
        success: false,
        errorMessage: 'Invalid Instructor ID or password.',
        source: 'local',
      };
    }
  }
}

export async function checkDatabaseStatus(): Promise<{ serverConnected: boolean; supabaseConnected: boolean }> {
  await initSupabaseFromBackend();
  let serverConnected = false;
  let supabaseConnected = isSupabaseConfigured();

  try {
    const res = await fetch('/api/assignments');
    if (res.ok) {
      serverConnected = true;
      const data = await res.json();
      if (data.supabaseConnected) {
        supabaseConnected = true;
      }
    }
  } catch {
    serverConnected = false;
  }

  return { serverConnected, supabaseConnected };
}

/**
 * Fetch assignments strictly from Supabase Cloud DB when available
 */
export async function fetchAssignmentsFromStore(storageKey: string): Promise<Assignment[]> {
  await initSupabaseFromBackend();

  // 1. Try Direct Client Supabase first
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: asgData, error: asgError } = await supabase
          .from('assignments')
          .select('*')
          .order('created_at', { ascending: false });

        if (!asgError && asgData) {
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

          const cloudList: Assignment[] = asgData.map((row) => ({
            id: row.id,
            title: row.title,
            instructions: row.instructions,
            assignedDate: row.assigned_date,
            dueDate: row.due_date,
            dueDateTimeMs: row.due_date_time_ms ? Number(row.due_date_time_ms) : undefined,
            imageUrl: row.image_url || undefined,
            status: row.status as 'Pending' | 'Submitted' | 'Closed',
            submittedFile: subMap[row.id] || undefined,
          }));

          try {
            localStorage.setItem(storageKey, JSON.stringify(cloudList));
          } catch {}

          return cloudList;
        }
      } catch (err) {
        console.warn('Failed direct client Supabase fetch:', err);
      }
    }
  }

  // 2. Try Express Server API
  try {
    const res = await fetch('/api/assignments');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.assignments)) {
        if (data.source === 'supabase-cloud') {
          try {
            localStorage.setItem(storageKey, JSON.stringify(data.assignments));
          } catch {}
          return data.assignments;
        }
        return data.assignments;
      }
    }
  } catch (err) {
    console.warn('Express /api/assignments fetch warning:', err);
  }

  // 3. Fallback to localStorage ONLY if completely offline / disconnected
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}

  return [];
}

/**
 * Save new assignment to BOTH Express Server DB AND Supabase
 */
export async function createAssignmentInStore(
  asg: Assignment,
  studentIdCode: string = '625H'
): Promise<boolean> {
  await initSupabaseFromBackend();
  let savedSupabase = false;

  const payload = {
    id: asg.id,
    student_id_code: studentIdCode || '625H',
    title: asg.title,
    instructions: asg.instructions,
    assigned_date: asg.assignedDate,
    due_date: asg.dueDate,
    due_date_time_ms: asg.dueDateTimeMs ? Number(asg.dueDateTimeMs) : null,
    image_url: asg.imageUrl || null,
    status: asg.status || 'Pending',
  };

  // 1. Direct Supabase call if configured on client
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('assignments').upsert([payload], { onConflict: 'id' });
        if (!error) {
          savedSupabase = true;
        } else {
          console.error('Supabase assignment upsert error:', error);
        }
      } catch (err) {
        console.error('Failed to create assignment in Supabase:', err);
      }
    }
  }

  // 2. Express Server API call
  try {
    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignment: asg, studentIdCode }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.savedToSupabase) {
        savedSupabase = true;
      }
    }
  } catch (err) {
    console.error('Express /api/assignments POST error:', err);
  }

  return savedSupabase;
}

/**
 * Submit assignment file to BOTH Express Server DB AND Supabase
 */
export async function submitAssignmentInStore(
  asgId: string,
  studentIdCode: string,
  submittedFile: {
    name: string;
    size: string;
    type: string;
    date: string;
    dataUrl?: string;
  }
): Promise<boolean> {
  await initSupabaseFromBackend();
  let savedSupabase = false;

  // 1. Direct Supabase call if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error: subError } = await supabase.from('submissions').insert([
          {
            assignment_id: asgId,
            student_id_code: studentIdCode || '625H',
            file_name: submittedFile.name,
            file_size: submittedFile.size,
            file_type: submittedFile.type,
            submission_date: submittedFile.date,
            data_url: submittedFile.dataUrl || null,
          },
        ]);

        const { error: updateError } = await supabase
          .from('assignments')
          .update({ status: 'Submitted' })
          .eq('id', asgId);

        if (!subError && !updateError) {
          savedSupabase = true;
        } else {
          if (subError) console.error('Supabase submission error:', subError);
          if (updateError) console.error('Supabase status update error:', updateError);
        }
      } catch (err) {
        console.error('Failed to submit assignment in Supabase:', err);
      }
    }
  }

  // 2. Express Server API call
  try {
    const res = await fetch('/api/assignments/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentId: asgId, studentIdCode, submittedFile }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.savedToSupabase) {
        savedSupabase = true;
      }
    }
  } catch (err) {
    console.error('Express /api/assignments/submit error:', err);
  }

  return savedSupabase;
}

/**
 * Delete single assignment from BOTH Express Server DB and Supabase
 */
export async function deleteAssignmentInStore(asgId: string, storageKey: string): Promise<boolean> {
  await initSupabaseFromBackend();
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('submissions').delete().eq('assignment_id', asgId);
        await supabase.from('assignments').delete().eq('id', asgId);
      } catch (err) {
        console.error('Failed to delete assignment in Supabase:', err);
      }
    }
  }

  try {
    await fetch(`/api/assignments/${asgId}`, { method: 'DELETE' });
  } catch (err) {
    console.error('Failed to delete assignment on server:', err);
  }

  try {
    localStorage.removeItem(storageKey);
  } catch {}

  return true;
}

/**
 * Clear ALL assignments from Express Server DB and Supabase
 */
export async function clearAllAssignmentsInStore(storageKey: string): Promise<boolean> {
  await initSupabaseFromBackend();
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err) {
        console.error('Failed to clear assignments in Supabase:', err);
      }
    }
  }

  try {
    await fetch('/api/assignments', { method: 'DELETE' });
  } catch (err) {
    console.error('Failed to clear assignments on server:', err);
  }

  try {
    localStorage.removeItem(storageKey);
  } catch {}

  return true;
}

/**
 * Delete single contact submission from database
 */
export async function deleteContactSubmission(subId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/contacts/${subId}`, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.error('Delete contact submission error:', err);
    return false;
  }
}

/**
 * Clear all contact submissions from database
 */
export async function clearAllContactSubmissions(): Promise<boolean> {
  try {
    const res = await fetch('/api/contacts', { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.error('Clear contact submissions error:', err);
    return false;
  }
}

/**
 * Update contact submission status
 */
export async function updateContactStatus(subId: string, status: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/contacts/${subId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch (err) {
    console.error('Update contact status error:', err);
    return false;
  }
}
