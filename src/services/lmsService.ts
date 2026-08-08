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
  source: 'supabase' | 'local';
}

/**
 * Authenticate student or teacher via Supabase DB profiles or fallback
 */
export async function authenticateUser(
  role: 'student' | 'instructor',
  identifier: string,
  pass: string
): Promise<UserAuthResult> {
  const cleanId = identifier.trim();
  const cleanPass = pass.trim();

  // Try Supabase Auth/DB if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        // Query profiles table by user_id_code and role
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
        console.warn('Supabase profile query issue, falling back to credentials check:', err);
      }
    }
  }

  // Fallback to local credential validation
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
 * Fetch assignments (including submissions) from Supabase or LocalStorage
 */
export async function fetchAssignmentsFromStore(storageKey: string): Promise<Assignment[]> {
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
        console.warn('Failed to load assignments from Supabase, loading from localStorage:', err);
      }
    }
  }

  // Fallback to localStorage
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
 * Save new assignment to Supabase DB and LocalStorage
 */
export async function createAssignmentInStore(
  asg: Assignment,
  studentIdCode: string = '625H'
): Promise<boolean> {
  let savedToSupabase = false;

  if (isSupabaseConfigured()) {
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
          savedToSupabase = true;
        } else {
          console.error('Supabase insert assignment error:', error);
        }
      } catch (err) {
        console.error('Failed to create assignment in Supabase:', err);
      }
    }
  }

  return savedToSupabase;
}

/**
 * Submit assignment file to Supabase DB and LocalStorage
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
  let savedToSupabase = false;

  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        // Insert into submissions table
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

        // Update status in assignments table
        const { error: updateError } = await supabase
          .from('assignments')
          .update({ status: 'Submitted' })
          .eq('id', asgId);

        if (!subError && !updateError) {
          savedToSupabase = true;
        } else {
          console.error('Supabase submit assignment error:', subError || updateError);
        }
      } catch (err) {
        console.error('Failed to submit assignment in Supabase:', err);
      }
    }
  }

  return savedToSupabase;
}
