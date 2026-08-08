import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { Assignment, StudentProfile } from '../types';
import { ABDUL_REHMAN_STUDENT } from '../data';

export interface UserAuthResult {
  success: boolean;
  role?: 'student' | 'instructor';
  studentProfile?: StudentProfile;
  instructorInfo?: {
    id: string;
    name: string;
    email: string;
  };
  errorMessage?: string;
  source: 'supabase' | 'server-local' | 'local';
}

/**
 * Authenticate student or teacher via Express Server (or Supabase/Local Fallback)
 */
export async function authenticateUser(
  role: 'student' | 'instructor',
  identifier: string,
  pass: string
): Promise<UserAuthResult> {
  const cleanId = identifier.trim();
  const cleanPass = pass.trim();

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

/**
 * Fetch assignments from Express Server (or Supabase/LocalStorage fallback)
 */
export async function fetchAssignmentsFromStore(storageKey: string): Promise<Assignment[]> {
  // 1. Try Express Server API
  try {
    const res = await fetch('/api/assignments');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.assignments)) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(data.assignments));
        } catch {
          // ignore
        }
        return data.assignments;
      }
    }
  } catch (err) {
    console.warn('Express /api/assignments unreachable, trying fallback:', err);
  }

  // 2. Try Supabase directly if configured
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

          const parsedList: Assignment[] = asgData.map((row) => ({
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

          return parsedList;
        }
      } catch (err) {
        console.warn('Failed to load assignments from Supabase:', err);
      }
    }
  }

  // 3. Fallback to localStorage
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return [];
}

/**
 * Save new assignment to Express Server DB (and Supabase/LocalStorage)
 */
export async function createAssignmentInStore(
  asg: Assignment,
  studentIdCode: string = '625H'
): Promise<boolean> {
  let saved = false;

  // 1. Express Server API
  try {
    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignment: asg, studentIdCode }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        saved = true;
      }
    }
  } catch (err) {
    console.error('Express /api/assignments POST error:', err);
  }

  // 2. Direct Supabase call if configured
  if (!saved && isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('assignments').insert([
          {
            id: asg.id,
            student_id_code: studentIdCode,
            title: asg.title,
            instructions: asg.instructions,
            assigned_date: asg.assignedDate,
            due_date: asg.dueDate,
            due_date_time_ms: asg.dueDateTimeMs || null,
            image_url: asg.imageUrl || null,
            status: asg.status || 'Pending',
          },
        ]);

        if (!error) {
          saved = true;
        }
      } catch (err) {
        console.error('Failed to create assignment in Supabase:', err);
      }
    }
  }

  return saved;
}

/**
 * Submit assignment file to Express Server DB (and Supabase/LocalStorage)
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
  let saved = false;

  // 1. Express Server API
  try {
    const res = await fetch('/api/assignments/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentId: asgId, studentIdCode, submittedFile }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        saved = true;
      }
    }
  } catch (err) {
    console.error('Express /api/assignments/submit error:', err);
  }

  // 2. Direct Supabase call if configured
  if (!saved && isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error: subError } = await supabase.from('submissions').insert([
          {
            assignment_id: asgId,
            student_id_code: studentIdCode,
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
          saved = true;
        }
      } catch (err) {
        console.error('Failed to submit assignment in Supabase:', err);
      }
    }
  }

  return saved;
}

/**
 * Delete single assignment from Express Server DB and LocalStorage
 */
export async function deleteAssignmentInStore(asgId: string, storageKey: string): Promise<boolean> {
  try {
    await fetch(`/api/assignments/${asgId}`, { method: 'DELETE' });
  } catch (err) {
    console.error('Failed to delete assignment on server:', err);
  }

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
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed: Assignment[] = JSON.parse(saved);
      const filtered = parsed.filter((a) => a.id !== asgId);
      localStorage.setItem(storageKey, JSON.stringify(filtered));
    }
  } catch {
    // ignore
  }

  return true;
}

/**
 * Clear ALL assignments from Express Server DB and LocalStorage
 */
export async function clearAllAssignmentsInStore(storageKey: string): Promise<boolean> {
  try {
    await fetch('/api/assignments', { method: 'DELETE' });
  } catch (err) {
    console.error('Failed to clear assignments on server:', err);
  }

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
    localStorage.removeItem(storageKey);
  } catch {
    // ignore
  }

  return true;
}
