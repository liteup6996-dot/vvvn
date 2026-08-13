import { getSupabase } from '../lib/supabase';

export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  interestedIn: string;
  sessionFormat?: string;
  message: string;
}

export interface ContactSubmissionRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  interestedIn: string;
  sessionFormat: string;
  message: string;
  submittedAt: string;
  status: string;
}

/**
 * High-reliability Contact Form Submission Service
 * Handles dual-sync posting across the Express backend and direct Supabase database.
 */
export async function submitContactFormLogic(data: ContactFormData): Promise<{
  success: boolean;
  submission?: ContactSubmissionRecord;
  error?: string;
}> {
  let submission: ContactSubmissionRecord | undefined = undefined;

  // 1. Submit via Express API endpoint
  try {
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const result = await res.json();
      if (result.success && result.submission) {
        submission = result.submission;
      }
    }
  } catch (err) {
    console.warn('Form Logic Express POST notice:', err);
  }

  // 2. Direct Supabase write dual-insurance
  const supabase = getSupabase();
  if (supabase) {
    try {
      const subId = submission?.id || `sub-${Date.now()}`;
      const now = submission?.submittedAt || new Date().toISOString();
      await supabase.from('contact_submissions').upsert([
        {
          id: subId,
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          interested_in: data.interestedIn,
          session_format: data.sessionFormat || 'Both Options (Group & 1-on-1)',
          message: data.message,
          submitted_at: now,
          status: 'New',
        },
      ]);
      if (!submission) {
        submission = {
          id: subId,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          interestedIn: data.interestedIn,
          sessionFormat: data.sessionFormat || 'Both Options (Group & 1-on-1)',
          message: data.message,
          submittedAt: now,
          status: 'New',
        };
      }
    } catch (err) {
      console.warn('Form Logic Supabase direct write notice:', err);
    }
  }

  if (submission) {
    return { success: true, submission };
  }

  return { success: false, error: 'Failed to record contact inquiry.' };
}

/**
 * Fetch all contact submissions merged from both backend API & Supabase database
 */
export async function fetchContactFormSubmissionsLogic(): Promise<ContactSubmissionRecord[]> {
  const contactsMap = new Map<string, ContactSubmissionRecord>();

  // 1. Fetch from Express API
  try {
    const res = await fetch('/api/contacts');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.contacts)) {
        data.contacts.forEach((c: ContactSubmissionRecord) => {
          if (c && c.id) contactsMap.set(c.id, c);
        });
      }
    }
  } catch (err) {
    console.warn('Form Logic fetch Express API notice:', err);
  }

  // 2. Direct Supabase query
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        data.forEach((row) => {
          const rec: ContactSubmissionRecord = {
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
          if (rec.id) contactsMap.set(rec.id, rec);
        });
      }
    } catch (err) {
      console.warn('Form Logic fetch Supabase notice:', err);
    }
  }

  return Array.from(contactsMap.values()).sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

/**
 * Live Auto-refresh Listener for Admin Portal
 */
export function subscribeToContactFormSubmissions(
  callback: (submissions: ContactSubmissionRecord[]) => void,
  intervalMs = 5000
): () => void {
  let active = true;

  const poll = async () => {
    if (!active) return;
    const data = await fetchContactFormSubmissionsLogic();
    if (active) {
      callback(data);
    }
  };

  poll();
  const timer = setInterval(poll, intervalMs);

  return () => {
    active = false;
    clearInterval(timer);
  };
}
