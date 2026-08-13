import React, { useState, useEffect } from 'react';
import { StudentProfile, Assignment, ContactSubmissionRecord } from '../types';
import { ABDUL_REHMAN_STUDENT, LOGO_URL } from '../data';
import { isSupabaseConfigured, initSupabaseFromBackend, SUPABASE_SETUP_SQL } from '../lib/supabase';
import {
  authenticateUser,
  fetchAssignmentsFromStore,
  createAssignmentInStore,
  submitAssignmentInStore,
  deleteAssignmentInStore,
  clearAllAssignmentsInStore,
  checkDatabaseStatus,
  fetchContactSubmissions,
  deleteContactSubmission,
  clearAllContactSubmissions,
  updateContactStatus,
} from '../services/lmsService';
import {
  Upload,
  FileCheck,
  CheckCircle2,
  Lock,
  Mail,
  LogOut,
  ArrowLeft,
  Clock,
  User,
  BookOpen,
  FileText,
  Music,
  Video,
  File,
  PlusCircle,
  Image as ImageIcon,
  Download,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Database,
  Code,
  Copy,
  Check,
  ClipboardList,
  Trash2,
  FileSpreadsheet,
  Search,
  Filter,
  RefreshCw,
  Eye,
  PhoneCall,
  MessageSquare,
  X,
} from 'lucide-react';

interface LMSPortalProps {
  onBackToHome: () => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
  currentStudent: StudentProfile;
  setCurrentStudent: React.Dispatch<React.SetStateAction<StudentProfile>>;
  initialLoginMode?: 'student' | 'instructor';
}

const STORAGE_KEY = 'vocalvantage_shared_assignments_v2';

export const LMSPortal: React.FC<LMSPortalProps> = ({
  onBackToHome,
  isLoggedIn,
  setIsLoggedIn,
  currentStudent,
  setCurrentStudent,
  initialLoginMode = 'student',
}) => {
  // Login Role & Form State
  const [loginRole, setLoginRole] = useState<'student' | 'instructor'>(initialLoginMode);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isInstructorLoggedIn, setIsInstructorLoggedIn] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Admin Login & Contact Submissions Dashboard State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [isAdminAuthenticating, setIsAdminAuthenticating] = useState(false);

  const [contactsList, setContactsList] = useState<ContactSubmissionRecord[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactsSearchTerm, setContactsSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedCsv, setCopiedCsv] = useState(false);
  const [selectedContactModal, setSelectedContactModal] = useState<ContactSubmissionRecord | null>(null);
  const [adminTab, setAdminTab] = useState<'submissions' | 'assignments'>('submissions');

  // Database Config State
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(isSupabaseConfigured());
  const [serverConnected, setServerConnected] = useState<boolean>(true);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Shared Assignments State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);

  // Instructor Create Assignment Form State
  const [newTitle, setNewTitle] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDueTime, setNewDueTime] = useState('23:59');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [createMsg, setCreateMsg] = useState('');

  // Student File Upload State per assignment ID
  const [selectedFiles, setSelectedFiles] = useState<{ [asgId: string]: File | null }>({});
  const [dragActive, setDragActive] = useState<{ [asgId: string]: boolean }>({});
  const [submittingAsgId, setSubmittingAsgId] = useState<string | null>(null);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  // Student Active vs Submitted Tab ('active' | 'submitted')
  const [studentTab, setStudentTab] = useState<'active' | 'submitted'>('active');

  // Load assignments from Central DB or localStorage on mount
  const loadAssignments = async (showSpinner = false) => {
    if (showSpinner) setIsLoadingAssignments(true);
    await initSupabaseFromBackend();
    const list = await fetchAssignmentsFromStore(STORAGE_KEY);
    setAssignments(list);
    if (showSpinner) setIsLoadingAssignments(false);

    const dbStatus = await checkDatabaseStatus();
    setServerConnected(dbStatus.serverConnected);
    setSupabaseConnected(dbStatus.supabaseConnected);
  };

  useEffect(() => {
    loadAssignments(true);

    // Auto-refresh assignments every 3 seconds for real-time multi-device sync
    const interval = setInterval(() => {
      loadAssignments(false);
    }, 3000);

    const handleFocus = () => {
      loadAssignments(false);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Load contact form submissions from Central DB
  const loadContacts = async () => {
    setIsLoadingContacts(true);
    const data = await fetchContactSubmissions();
    setContactsList(data);
    setIsLoadingContacts(false);
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadContacts();
      const interval = setInterval(loadContacts, 5000);
      return () => clearInterval(interval);
    }
  }, [isAdminLoggedIn]);

  // Handle Admin Login Submission (Username: 123123, Passcode: 1122)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    setIsAdminAuthenticating(true);

    const cleanUser = adminUsername.trim();
    const cleanPass = adminPasscode.trim();

    if (cleanUser === '123123' && cleanPass === '1122') {
      setIsAdminLoggedIn(true);
      setIsLoggedIn(true);
      setIsInstructorLoggedIn(false);
      setIsAdminAuthenticating(false);
      loadContacts();
      return;
    }

    try {
      const res = await authenticateUser('admin', cleanUser, cleanPass);
      if (res.success && res.role === 'admin') {
        setIsAdminLoggedIn(true);
        setIsLoggedIn(true);
        setIsInstructorLoggedIn(false);
        loadContacts();
      } else {
        setAdminLoginError('Invalid username or passcode.');
      }
    } catch {
      setAdminLoginError('Authentication error. Please try again.');
    } finally {
      setIsAdminAuthenticating(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    await updateContactStatus(id, newStatus);
    setContactsList((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm('Delete this form submission from the database permanently?')) {
      await deleteContactSubmission(id);
      setContactsList((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleClearAllContacts = async () => {
    if (window.confirm('Are you sure you want to PERMANENTLY CLEAR all form submissions from the database?')) {
      await clearAllContactSubmissions();
      setContactsList([]);
    }
  };

  const exportToCsv = () => {
    if (contactsList.length === 0) {
      alert('No form submissions available in database to export.');
      return;
    }
    const headers = ['ID', 'Date & Time', 'Full Name', 'Email', 'Phone / WhatsApp', 'Interested Accent', 'Session Format', 'Message', 'Status'];
    const rows = contactsList.map((c) => [
      c.id,
      new Date(c.submittedAt).toLocaleString(),
      `"${(c.fullName || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.interestedIn || '').replace(/"/g, '""')}"`,
      `"${(c.sessionFormat || '').replace(/"/g, '""')}"`,
      `"${(c.message || '').replace(/"/g, '""')}"`,
      c.status || 'New',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vocal_Vantage_Form_Submissions_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyCsvToClipboard = () => {
    if (contactsList.length === 0) {
      alert('No form submissions available in database to copy.');
      return;
    }
    const headers = ['ID', 'Date & Time', 'Full Name', 'Email', 'Phone / WhatsApp', 'Interested Accent', 'Session Format', 'Message', 'Status'];
    const rows = contactsList.map((c) => [
      c.id,
      new Date(c.submittedAt).toLocaleString(),
      c.fullName,
      c.email,
      c.phone,
      c.interestedIn,
      c.sessionFormat || '',
      c.message || '',
      c.status || 'New',
    ]);
    const csvText = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(csvText);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 3000);
  };

  // Synchronize assignments to localStorage as local fallback backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch {
      // ignore
    }
  }, [assignments]);

  // Handle Login submission via Supabase / Local Service
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanIdentifier = loginIdentifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setLoginError(`Please enter both ${loginRole === 'student' ? 'Student ID' : 'Instructor ID'} and Password.`);
      return;
    }

    setIsAuthenticating(true);

    try {
      const res = await authenticateUser(loginRole, cleanIdentifier, cleanPassword);

      if (res.success) {
        if (res.role === 'student' && res.studentProfile) {
          setCurrentStudent(res.studentProfile);
          setIsLoggedIn(true);
          setIsInstructorLoggedIn(false);
        } else if (res.role === 'instructor') {
          setIsInstructorLoggedIn(true);
          setIsLoggedIn(true);
        }
      } else {
        setLoginError(res.errorMessage || 'Invalid credentials. Please verify your details.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('An error occurred during authentication. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Convert image file to base64 data URL for assignment attachment
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Instructor Action: Create & Publish Assignment to Supabase DB & Local State
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newInstructions.trim() || !newDueDate) {
      alert('Please fill in Assignment Title, Task Description, and Due Date.');
      return;
    }

    const dueDateTimeStr = `${newDueDate}T${newDueTime || '23:59'}`;
    const dueTimestamp = new Date(dueDateTimeStr).getTime();

    const formattedDueDate = new Date(dueTimestamp).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }) + ` at ${newDueTime || '23:59'}`;

    const newAsg: Assignment = {
      id: `asg-${Date.now()}`,
      title: newTitle.trim(),
      assignedDate: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      dueDate: formattedDueDate,
      dueDateTimeMs: dueTimestamp,
      instructions: newInstructions.trim(),
      imageUrl: attachedImage || undefined,
      status: 'Pending',
    };

    // Save to Supabase DB
    const isSavedToSupabase = await createAssignmentInStore(newAsg, '625H');

    setAssignments((prev) => [newAsg, ...prev]);

    // Reset Form
    setNewTitle('');
    setNewInstructions('');
    setNewDueDate('');
    setNewDueTime('23:59');
    setAttachedImage(null);
    setCreateMsg(
      isSavedToSupabase
        ? 'Assignment saved to database & published for Abdul REHMAN!'
        : 'Assignment published for Abdul REHMAN!'
    );
    setTimeout(() => setCreateMsg(''), 4000);
  };

  // Instructor Action: Clear All Assignments from store
  const handleClearAllAssignments = async () => {
    if (window.confirm('Are you sure you want to clear ALL assignments from database and storage?')) {
      await clearAllAssignmentsInStore(STORAGE_KEY);
      setAssignments([]);
    }
  };

  // Instructor Action: Delete single assignment
  const handleDeleteSingleAssignment = async (asgId: string) => {
    if (window.confirm('Are you sure you want to delete this assignment permanently?')) {
      await deleteAssignmentInStore(asgId, STORAGE_KEY);
      setAssignments((prev) => prev.filter((a) => a.id !== asgId));
    }
  };

  // File selection for Student submission
  const handleFileChange = (asgId: string, file: File | null) => {
    setSelectedFiles((prev) => ({ ...prev, [asgId]: file }));
  };

  const handleDragOver = (e: React.DragEvent, asgId: string) => {
    e.preventDefault();
    setDragActive((prev) => ({ ...prev, [asgId]: true }));
  };

  const handleDragLeave = (e: React.DragEvent, asgId: string) => {
    e.preventDefault();
    setDragActive((prev) => ({ ...prev, [asgId]: false }));
  };

  const handleDrop = (e: React.DragEvent, asgId: string) => {
    e.preventDefault();
    setDragActive((prev) => ({ ...prev, [asgId]: false }));
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(asgId, e.dataTransfer.files[0]);
    }
  };

  // Student Action: Submit Assignment
  const handleSubmitAssignment = (asg: Assignment) => {
    const file = selectedFiles[asg.id];
    if (!file) return;

    setSubmittingAsgId(asg.id);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const todayStr = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }) + ` at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      const submittedFileObj = {
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type: file.type || 'application/octet-stream',
        date: todayStr,
        dataUrl: dataUrl,
      };

      // Save submission to Supabase
      await submitAssignmentInStore(asg.id, currentStudent.studentId || '625H', submittedFileObj);

      setAssignments((prev) =>
        prev.map((item) => {
          if (item.id === asg.id) {
            return {
              ...item,
              status: 'Submitted',
              submittedFile: submittedFileObj,
            };
          }
          return item;
        })
      );

      setSelectedFiles((prev) => ({ ...prev, [asg.id]: null }));
      setSubmittingAsgId(null);
      setSubmitSuccessMsg('Assignment submitted successfully! Moved to Submitted Assignments tab.');
      setStudentTab('submitted');
      setTimeout(() => setSubmitSuccessMsg(null), 5000);
    };

    reader.readAsDataURL(file);
  };

  // Helper to trigger download of submitted student file
  const handleDownloadFile = (submittedFile: { name: string; dataUrl?: string }) => {
    if (!submittedFile.dataUrl) {
      alert(`File "${submittedFile.name}" is attached.`);
      return;
    }
    const link = document.createElement('a');
    link.href = submittedFile.dataUrl;
    link.download = submittedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for file type icon
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('audio') || fileType.includes('mp3') || fileType.includes('wav')) {
      return <Music className="w-5 h-5 text-[#7A1B28]" />;
    }
    if (fileType.includes('video') || fileType.includes('mp4')) {
      return <Video className="w-5 h-5 text-[#D97706]" />;
    }
    if (fileType.includes('pdf') || fileType.includes('doc')) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // ==========================================
  // VIEW: UNAUTHENTICATED LOGIN SCREEN
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
        
        {/* Back to Home Button */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-[#7A1B28] transition-colors"
            id="lms-back-home-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Vocal Vantage Website</span>
          </button>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo */}
          <div className="flex justify-center">
            <img
              src={LOGO_URL}
              alt="Vocal Vantage Logo"
              className="h-14 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="mt-4 text-center text-2xl font-bold font-serif text-gray-900 tracking-tight">
            Vocal Vantage Portal
          </h2>
          <p className="mt-1 text-center text-xs text-gray-500">
            Accent Training & LMS Management Portal
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="bg-white py-8 px-6 shadow-sm rounded-xl border border-gray-200 sm:px-10 space-y-6">
            
            {/* Role Switcher Tabs */}
            <div className="flex rounded-lg bg-gray-100 p-1 border border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setLoginRole('student');
                  setLoginError('');
                }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  loginRole === 'student'
                    ? 'bg-white text-[#7A1B28] shadow-2xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                id="tab-student-login"
              >
                Student Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginRole('instructor');
                  setLoginError('');
                }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  loginRole === 'instructor'
                    ? 'bg-white text-[#D97706] shadow-2xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                id="tab-instructor-login"
              >
                Instructor Login
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-5" id="lms-login-form">
              {loginError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-md border border-red-200 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  {loginRole === 'student' ? 'Student ID' : 'Instructor ID'}
                </label>
                <div className="relative rounded-md shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={loginRole === 'student' ? 'e.g. XXXH' : 'e.g. 1001'}
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7A1B28]/20 focus:border-[#7A1B28]"
                    id="lms-login-id-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative rounded-md shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7A1B28]/20 focus:border-[#7A1B28]"
                    id="lms-login-password-input"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className={`w-full py-3 px-4 text-white font-semibold text-sm uppercase tracking-wider rounded-md transition-colors shadow-xs cursor-pointer disabled:opacity-50 ${
                    loginRole === 'student'
                      ? 'bg-[#7A1B28] hover:bg-[#621520]'
                      : 'bg-[#D97706] hover:bg-[#b46204]'
                  }`}
                  id="lms-login-submit-btn"
                >
                  {isAuthenticating
                    ? 'Authenticating...'
                    : loginRole === 'student'
                    ? 'Login to Student Portal'
                    : 'Login to Instructor Portal'}
                </button>
              </div>
            </form>

          </div>

          {/* OUTSIDE & BELOW THE SWITCHING WINDOW: SMALL GREY TEXT LINK FOR ADMIN ACCESS */}
          <div className="mt-8 text-center pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setShowAdminForm(!showAdminForm);
                setAdminLoginError('');
              }}
              className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer inline-flex items-center gap-1.5 font-medium"
              id="toggle-admin-login-btn"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
              <span>Admin Login</span>
            </button>

            {showAdminForm && (
              <div className="mt-3 bg-white p-5 rounded-xl border border-gray-200 shadow-lg max-w-sm mx-auto text-left space-y-3.5 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#7A1B28]" />
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider font-serif">
                      Admin Portal
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAdminForm(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-3" id="admin-login-form">
                  {adminLoginError && (
                    <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-md border border-rose-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{adminLoginError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter admin username"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7A1B28]/20 focus:border-[#7A1B28]"
                      id="admin-username-input"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Passcode
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter passcode"
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7A1B28]/20 focus:border-[#7A1B28]"
                      id="admin-passcode-input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAdminAuthenticating}
                    className="w-full py-2.5 px-4 bg-[#7A1B28] hover:bg-[#621520] text-white font-semibold text-xs uppercase tracking-wider rounded-md transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                    id="admin-login-submit-btn"
                  >
                    {isAdminAuthenticating ? 'Authenticating...' : 'Sign In'}
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // VIEW: ADMIN CONTROL PANEL DASHBOARD
  // ==========================================
  if (isAdminLoggedIn) {
    const filteredContacts = contactsList.filter((c) => {
      const matchesSearch =
        c.fullName.toLowerCase().includes(contactsSearchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(contactsSearchTerm.toLowerCase()) ||
        c.phone.toLowerCase().includes(contactsSearchTerm.toLowerCase()) ||
        c.interestedIn.toLowerCase().includes(contactsSearchTerm.toLowerCase()) ||
        (c.message || '').toLowerCase().includes(contactsSearchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 pb-20 font-sans">
        {/* Admin Header */}
        <header className="bg-gray-950 border-b border-gray-800 sticky top-0 z-20 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={LOGO_URL}
                alt="Vocal Vantage Logo"
                className="h-10 w-auto object-contain cursor-pointer brightness-110"
                onClick={onBackToHome}
                referrerPolicy="no-referrer"
              />
              <div className="h-6 w-px bg-gray-800 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-bold uppercase tracking-wider text-white font-serif">
                  Admin Control Panel
                </span>
                <span className="bg-amber-950 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-800">
                  Universal Database
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* DB Status Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-800/80 rounded-full text-xs text-emerald-400 font-mono">
                <Database className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>DB Connected</span>
              </div>

              <button
                onClick={() => {
                  setIsAdminLoggedIn(false);
                  setIsLoggedIn(false);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold uppercase tracking-wider rounded-md border border-gray-700 transition-colors cursor-pointer"
                id="admin-logout-btn"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Top Banner & Quick Controls */}
          <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 rounded-2xl p-6 border border-gray-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">
                  System Administration
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-xs text-gray-400 font-mono">Admin Session Active</span>
              </div>
              <h1 className="text-2xl font-bold font-serif text-white tracking-tight">
                Universal Form Submissions & Data Repository
              </h1>
              <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                All form fillings submitted across Vocal Vantage are stored directly in the central database (`data/contact_submissions.json` & Supabase Cloud).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={exportToCsv}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-gray-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                id="admin-export-csv-btn"
              >
                <Download className="w-4 h-4" />
                <span>Export to CSV</span>
              </button>

              <button
                onClick={copyCsvToClipboard}
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-amber-400 border border-amber-800/60 font-semibold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer"
                id="admin-copy-sheets-btn"
              >
                {copiedCsv ? <Check className="w-4 h-4 text-emerald-400" /> : <FileSpreadsheet className="w-4 h-4" />}
                <span>{copiedCsv ? 'Copied for Google Sheets!' : 'Copy for Google Sheets'}</span>
              </button>

              <button
                onClick={loadContacts}
                className="px-3 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                title="Refresh from Database"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingContacts ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-800 space-x-2">
            <button
              onClick={() => setAdminTab('submissions')}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                adminTab === 'submissions'
                  ? 'border-amber-500 text-amber-400 bg-amber-950/30'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Contact Form Submissions ({contactsList.length})</span>
            </button>

            <button
              onClick={() => setAdminTab('assignments')}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                adminTab === 'assignments'
                  ? 'border-amber-500 text-amber-400 bg-amber-950/30'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>LMS Student Assignments ({assignments.length})</span>
            </button>
          </div>

          {/* TAB 1: FORM SUBMISSIONS TABLE */}
          {adminTab === 'submissions' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-950 p-4 rounded-xl border border-gray-800">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search name, email, phone, accent..."
                    value={contactsSearchTerm}
                    onChange={(e) => setContactsSearchTerm(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 pl-9 pr-3 py-2 text-xs text-gray-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Filter & Clear */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Filter className="w-3.5 h-3.5 text-amber-500" />
                    <span>Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-gray-900 border border-gray-800 text-gray-200 rounded-md px-2.5 py-1 text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="all">All Submissions</option>
                      <option value="New">New Only</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Enrolled">Enrolled</option>
                    </select>
                  </div>

                  {contactsList.length > 0 && (
                    <button
                      onClick={handleClearAllContacts}
                      className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 bg-rose-950/40 border border-rose-900/60 px-2.5 py-1 rounded-md cursor-pointer"
                      title="Clear All Submissions"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Inbuilt Table View */}
              <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-gray-900/90 text-gray-400 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-800">
                      <tr>
                        <th className="py-3.5 px-4">Date & Time</th>
                        <th className="py-3.5 px-4">Full Name</th>
                        <th className="py-3.5 px-4">Contact Info</th>
                        <th className="py-3.5 px-4">Program & Format</th>
                        <th className="py-3.5 px-4">Message</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {filteredContacts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-gray-500 text-xs">
                            No form submissions found matching your search criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredContacts.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-900/50 transition-colors">
                            {/* Date */}
                            <td className="py-3.5 px-4 whitespace-nowrap text-gray-400 font-mono text-[11px]">
                              {new Date(item.submittedAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                              <div className="text-[10px] text-gray-500">
                                {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>

                            {/* Full Name */}
                            <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                              {item.fullName}
                            </td>

                            {/* Contact Info */}
                            <td className="py-3.5 px-4 space-y-1">
                              <div className="flex items-center gap-1.5 text-gray-300">
                                <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <a href={`mailto:${item.email}`} className="hover:underline hover:text-amber-400">
                                  {item.email}
                                </a>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[11px]">
                                <PhoneCall className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <a
                                  href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline hover:text-emerald-400"
                                >
                                  {item.phone}
                                </a>
                              </div>
                            </td>

                            {/* Program & Format */}
                            <td className="py-3.5 px-4 space-y-1">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                item.interestedIn.includes('British')
                                  ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                                  : 'bg-rose-950/60 text-rose-300 border-rose-800'
                              }`}>
                                {item.interestedIn}
                              </span>
                              {item.sessionFormat && (
                                <div className="text-[11px] text-gray-400">
                                  {item.sessionFormat}
                                </div>
                              )}
                            </td>

                            {/* Message Preview */}
                            <td className="py-3.5 px-4 max-w-xs">
                              <p className="line-clamp-2 text-gray-300 text-xs">
                                {item.message || <span className="text-gray-600 italic">No message provided</span>}
                              </p>
                            </td>

                            {/* Status Selector */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <select
                                value={item.status || 'New'}
                                onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                                className={`text-[11px] font-bold rounded px-2 py-1 border focus:outline-none cursor-pointer ${
                                  item.status === 'Enrolled'
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                    : item.status === 'Contacted'
                                    ? 'bg-blue-950 text-blue-300 border-blue-800'
                                    : 'bg-amber-950 text-amber-300 border-amber-800'
                                }`}
                              >
                                <option value="New">New Inquiry</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Enrolled">Enrolled Student</option>
                              </select>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                              <button
                                onClick={() => setSelectedContactModal(item)}
                                className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors inline-flex items-center cursor-pointer"
                                title="View Full Submission"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteContact(item.id)}
                                className="p-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 rounded transition-colors inline-flex items-center cursor-pointer"
                                title="Delete Submission"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENT ASSIGNMENTS OVERVIEW */}
          {adminTab === 'assignments' && (
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white font-serif">
                    LMS Student Submitted Assignments
                  </h3>
                  <p className="text-xs text-gray-400">
                    Live submissions uploaded by enrolled students (e.g., Abdul REHMAN 625H)
                  </p>
                </div>
                <button
                  onClick={() => loadAssignments(true)}
                  className="px-3 py-1.5 bg-gray-800 text-gray-300 text-xs font-semibold rounded hover:bg-gray-700 cursor-pointer"
                >
                  Sync LMS Database
                </button>
              </div>

              <div className="space-y-3">
                {assignments.length === 0 ? (
                  <p className="text-xs text-gray-500 py-6 text-center">
                    No active student assignments found in database.
                  </p>
                ) : (
                  assignments.map((asg) => (
                    <div
                      key={asg.id}
                      className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{asg.title}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              asg.status === 'Submitted'
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                : 'bg-amber-950 text-amber-400 border-amber-800'
                            }`}
                          >
                            {asg.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{asg.instructions}</p>
                        <p className="text-[11px] text-gray-500 font-mono">
                          Assigned: {asg.assignedDate} | Due: {asg.dueDate}
                        </p>
                      </div>

                      {asg.submittedFile && (
                        <div className="bg-gray-950 border border-gray-800 p-3 rounded-lg flex items-center gap-3">
                          <FileText className="w-5 h-5 text-amber-400" />
                          <div className="text-xs">
                            <p className="font-semibold text-gray-200">{asg.submittedFile.name}</p>
                            <p className="text-[10px] text-gray-500">{asg.submittedFile.size} • {asg.submittedFile.date}</p>
                          </div>
                          {asg.submittedFile.dataUrl && (
                            <button
                              onClick={() => handleDownloadFile(asg.submittedFile!)}
                              className="p-1.5 bg-amber-600 hover:bg-amber-500 text-gray-950 rounded font-bold text-xs cursor-pointer"
                              title="Download Student Submission"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>

        {/* Modal: Full Submission Details */}
        {selectedContactModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-gray-950 border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-white font-serif">Inquiry Details</h3>
                </div>
                <button
                  onClick={() => setSelectedContactModal(null)}
                  className="p-1 text-gray-400 hover:text-white rounded-md cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-gray-300">
                <div>
                  <span className="text-gray-500 uppercase tracking-wider font-semibold text-[10px] block">Full Name</span>
                  <p className="text-sm font-bold text-white">{selectedContactModal.fullName}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-500 uppercase tracking-wider font-semibold text-[10px] block">Email Address</span>
                    <p className="text-amber-400">{selectedContactModal.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 uppercase tracking-wider font-semibold text-[10px] block">Phone / WhatsApp</span>
                    <p className="text-emerald-400 font-mono">{selectedContactModal.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-500 uppercase tracking-wider font-semibold text-[10px] block">Accent Preference</span>
                    <p className="font-semibold">{selectedContactModal.interestedIn}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 uppercase tracking-wider font-semibold text-[10px] block">Session Format</span>
                    <p className="font-semibold">{selectedContactModal.sessionFormat || 'Not specified'}</p>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 uppercase tracking-wider font-semibold text-[10px] block">Submission Timestamp</span>
                  <p className="font-mono text-gray-400">{new Date(selectedContactModal.submittedAt).toLocaleString()}</p>
                </div>

                <div>
                  <span className="text-gray-500 uppercase tracking-wider font-semibold text-[10px] block mb-1">Inquiry Message</span>
                  <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {selectedContactModal.message || 'No additional message was included.'}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-800">
                <a
                  href={`https://wa.me/${selectedContactModal.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Contact on WhatsApp</span>
                </a>
                <button
                  onClick={() => setSelectedContactModal(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: INSTRUCTOR PORTAL DASHBOARD
  // ==========================================
  if (isInstructorLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50/60 pb-20">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-2xs">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={LOGO_URL}
                alt="Vocal Vantage Logo"
                className="h-9 w-auto object-contain cursor-pointer"
                onClick={onBackToHome}
                referrerPolicy="no-referrer"
              />
              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#D97706] hidden sm:block">
                Faculty Instructor Portal
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                supabaseConnected || serverConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <Database className="w-3 h-3 text-emerald-600" />
                <span>
                  {supabaseConnected
                    ? 'Supabase Cloud DB Active'
                    : serverConnected
                    ? 'Central Database Active'
                    : 'Offline Cache Mode'}
                </span>
              </span>

              <button
                onClick={onBackToHome}
                className="px-3.5 py-1.5 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
                id="instructor-website-btn"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Main Website</span>
              </button>

              <button
                onClick={() => {
                  setIsInstructorLoggedIn(false);
                  setIsLoggedIn(false);
                }}
                className="px-3.5 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold hover:bg-red-50 hover:text-red-600 transition-colors inline-flex items-center gap-1.5"
                id="instructor-logout-btn"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
          
          {/* Welcome Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D97706]" />
                <h1 className="text-2xl font-bold font-serif text-gray-900">
                  Welcome, Mr. Abdulleh Hashmi
                </h1>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                American Accent Senior Instructor • Student Portal Management
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-[#D97706] border border-amber-200 text-xs font-bold rounded-md">
              <UserCheck className="w-4 h-4" />
              <span>Assigned Student: Abdul REHMAN</span>
            </span>
          </div>

          {/* CREATE ASSIGNMENT FORM */}
          <section className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-900 font-serif text-lg font-bold">
                <PlusCircle className="w-5 h-5 text-[#7A1B28]" />
                <h2>Create New Assignment for Abdul REHMAN</h2>
              </div>
              <span className="text-xs text-gray-400 font-medium">Student ID: 625H</span>
            </div>

            {createMsg && (
              <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-md flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{createMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateAssignment} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flap T & American Vowel Shift Practice"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7A1B28]/20 focus:border-[#7A1B28]"
                  id="inst-asg-title"
                />
              </div>

              {/* Task Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Task Description & Instructions *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write clear instructions for Abdul REHMAN regarding phonetics, vocal exercises, or reading materials..."
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7A1B28]/20 focus:border-[#7A1B28]"
                  id="inst-asg-instructions"
                />
              </div>

              {/* Attachment Image & Deadline Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Deadline Date */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Deadline Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7A1B28]/20 focus:border-[#7A1B28] bg-white"
                    id="inst-asg-date"
                  />
                </div>

                {/* Deadline Time */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Deadline Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={newDueTime}
                    onChange={(e) => setNewDueTime(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7A1B28]/20 focus:border-[#7A1B28] bg-white"
                    id="inst-asg-time"
                  />
                </div>

                {/* Attachment Image */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Attach Image (Optional)
                  </label>
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 cursor-pointer">
                    <ImageIcon className="w-4 h-4 text-gray-500" />
                    <span>{attachedImage ? 'Image Attached ✓' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="inst-asg-img-input"
                    />
                  </label>
                </div>

              </div>

              {/* Image Preview */}
              {attachedImage && (
                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 inline-block relative">
                  <p className="text-[11px] font-semibold text-gray-500 mb-2">Image Preview:</p>
                  <img src={attachedImage} alt="Attachment Preview" className="h-28 rounded-md object-cover" />
                  <button
                    type="button"
                    onClick={() => setAttachedImage(null)}
                    className="mt-2 text-xs text-red-600 font-semibold hover:underline block"
                  >
                    Remove Image
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#7A1B28] text-white font-semibold text-xs uppercase tracking-wider rounded-md hover:bg-[#621520] transition-colors shadow-2xs"
                  id="btn-publish-assignment"
                >
                  Publish Assignment for Abdul REHMAN
                </button>
              </div>
            </form>
          </section>

          {/* VIEW ASSIGNMENTS & STUDENT SUBMISSIONS */}
          <section className="space-y-6">
            <h2 className="text-lg font-bold font-serif text-gray-900 border-b border-gray-200 pb-3 flex items-center justify-between">
              <span>CREATED ASSIGNMENTS & STUDENT SUBMISSIONS</span>
              <div className="flex items-center gap-3">
                {assignments.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllAssignments}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {assignments.length} Total
                </span>
              </div>
            </h2>

            {isLoadingAssignments ? (
              <div className="p-8 text-center text-xs text-gray-500">Loading assignments...</div>
            ) : assignments.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-2">
                <FileText className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-gray-900 font-semibold text-base">No Assignments Created Yet</p>
                <p className="text-xs text-gray-500">
                  Use the form above to assign a new task to Abdul REHMAN.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {assignments.map((asg) => {
                  const isClosed = asg.dueDateTimeMs ? Date.now() > asg.dueDateTimeMs : false;
                  const isSubmitted = asg.status === 'Submitted';

                  return (
                    <div key={asg.id} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 shadow-2xs">
                      
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-gray-100 pb-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A1B28] bg-[#7A1B28]/10 px-2.5 py-0.5 rounded-full inline-block">
                            Assignment Task
                          </span>
                          <h3 className="text-xl font-bold font-serif text-gray-900">{asg.title}</h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 pt-0.5">
                            <span>Assigned: <strong className="text-gray-700 font-medium">{asg.assignedDate}</strong></span>
                            <span>•</span>
                            <span>Deadline: <strong className={`font-semibold ${isClosed ? 'text-gray-500' : 'text-red-700'}`}>{asg.dueDate}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isSubmitted ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-md">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Student Submitted</span>
                            </span>
                          ) : isClosed ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded-md">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Assignment Due & Closed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-md">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pending Submission</span>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteSingleAssignment(asg.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Delete Assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Instructions / Description Box */}
                      <div className="bg-slate-50/90 border-l-4 border-l-[#7A1B28] border border-slate-200/80 rounded-r-xl p-4 sm:p-5 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200/60 pb-2">
                          <ClipboardList className="w-4 h-4 text-[#7A1B28]" />
                          <span>Task Description & Instructions</span>
                        </div>
                        <div className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                          {asg.instructions}
                        </div>

                        {/* Image Preview if instructor attached image */}
                        {asg.imageUrl && (
                          <div className="pt-2 border-t border-slate-200/60 mt-3">
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                              <span>Attached Reference Image:</span>
                            </p>
                            <img src={asg.imageUrl} alt="Task visual" className="max-h-56 rounded-lg object-cover border border-slate-200 shadow-2xs" />
                          </div>
                        )}
                      </div>

                      {/* Student Submission Card */}
                      {asg.submittedFile && (
                        <div className="mt-4 p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                              Student Submission Received
                            </span>
                            <p className="text-sm font-bold text-gray-900">
                              Abdul REHMAN
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              {getFileIcon(asg.submittedFile.type)}
                              <span className="font-semibold">{asg.submittedFile.name}</span>
                              <span>({asg.submittedFile.size})</span>
                              <span className="text-gray-400">• {asg.submittedFile.date}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDownloadFile(asg.submittedFile!)}
                            className="px-4 py-2 bg-[#7A1B28] text-white rounded-md text-xs font-semibold hover:bg-[#621520] transition-colors inline-flex items-center gap-2 shrink-0 shadow-2xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Submission</span>
                          </button>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </main>
      </div>
    );
  }

  // ==========================================
  // VIEW: LOGGED IN STUDENT DASHBOARD (Abdul REHMAN)
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50/60 pb-20">
      
      {/* STUDENT DASHBOARD HEADER */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-4">
              <img
                src={LOGO_URL}
                alt="Vocal Vantage Logo"
                className="h-9 w-auto object-contain cursor-pointer"
                onClick={onBackToHome}
                referrerPolicy="no-referrer"
              />
              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 hidden sm:block">
                Student LMS Portal
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                supabaseConnected || serverConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <Database className="w-3 h-3 text-emerald-600" />
                <span>
                  {supabaseConnected
                    ? 'Supabase Cloud DB Active'
                    : serverConnected
                    ? 'Central Database Active'
                    : 'Offline Cache Mode'}
                </span>
              </span>

              <button
                onClick={onBackToHome}
                className="px-3.5 py-1.5 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
                id="lms-header-website-btn"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Main Website</span>
              </button>

              <button
                onClick={() => setIsLoggedIn(false)}
                className="px-3.5 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold hover:bg-red-50 hover:text-red-600 transition-colors inline-flex items-center gap-1.5"
                id="lms-header-logout-btn"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Student Welcome Banner */}
          <div className="mt-6 bg-white rounded-lg p-5 border border-gray-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-gray-900">
                Welcome, {currentStudent.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-600">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>Instructor: <strong className="text-gray-900">{currentStudent.instructorName}</strong></span>
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                  <span>Course: <strong className="text-gray-900">{currentStudent.courseProgram}</strong></span>
                </span>
              </div>
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#7A1B28]/10 text-[#7A1B28]">
                {currentStudent.accentType}
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* DASHBOARD BODY */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        
        {submitSuccessMsg && (
          <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-md flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{submitSuccessMsg}</span>
          </div>
        )}

        {/* STUDENT ASSIGNMENTS TABS & SECTION */}
        <section className="space-y-6">
          {/* Tab Navigation Bar */}
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 pb-3">
            <button
              type="button"
              onClick={() => setStudentTab('active')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                studentTab === 'active'
                  ? 'bg-[#7A1B28] text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Active Assignments ({assignments.filter((a) => a.status !== 'Submitted').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setStudentTab('submitted')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                studentTab === 'submitted'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submitted Assignments Bar ({assignments.filter((a) => a.status === 'Submitted').length})</span>
            </button>
          </div>

          {isLoadingAssignments ? (
            <div className="p-8 text-center text-xs text-gray-500">Loading assignments from store...</div>
          ) : studentTab === 'active' ? (
            /* ACTIVE ASSIGNMENTS TAB CONTENT */
            assignments.filter((a) => a.status !== 'Submitted').length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-gray-900 font-semibold text-base">All Caught Up!</p>
                <p className="text-xs text-gray-500">
                  You have no active pending assignments right now. Check back after your next session.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {assignments
                  .filter((a) => a.status !== 'Submitted')
                  .map((assignment) => {
                    const isClosed = assignment.dueDateTimeMs ? Date.now() > assignment.dueDateTimeMs : false;
                    const selectedFile = selectedFiles[assignment.id];
                    const isDrag = dragActive[assignment.id];
                    const isSubmitting = submittingAsgId === assignment.id;

                    return (
                      <div
                        key={assignment.id}
                        className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6"
                        id={`active-assignment-${assignment.id}`}
                      >
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-100 pb-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A1B28] bg-[#7A1B28]/10 px-2.5 py-0.5 rounded-full inline-block">
                              ASSIGNMENT TASK
                            </span>
                            <h3 className="text-xl sm:text-2xl font-bold font-serif text-gray-900">
                              {assignment.title}
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs shrink-0">
                            <div className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md">
                              <span className="text-gray-400 block text-[10px] uppercase font-semibold">Assigned Date</span>
                              <span className="font-semibold text-gray-800">{assignment.assignedDate}</span>
                            </div>
                            <div className="bg-red-50/80 border border-red-200/80 px-3 py-1.5 rounded-md">
                              <span className="text-red-600 block text-[10px] uppercase font-semibold">Deadline</span>
                              <span className={`font-bold flex items-center gap-1 ${isClosed ? 'text-gray-600' : 'text-red-700'}`}>
                                <Clock className="w-3.5 h-3.5" />
                                {assignment.dueDate}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          {isClosed ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 text-xs font-bold shadow-2xs">
                              <Lock className="w-4 h-4" />
                              <span>Assignment Due and Closed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold shadow-2xs">
                              <Clock className="w-4 h-4" />
                              <span>Pending Submission</span>
                            </span>
                          )}
                        </div>

                        {/* Instructions / Description Box */}
                        <div className="bg-slate-50/90 border-l-4 border-l-[#7A1B28] border border-slate-200/80 rounded-r-xl p-5 space-y-3.5 shadow-2xs">
                          <div className="flex items-center gap-2 border-b border-slate-200/70 pb-2.5">
                            <ClipboardList className="w-4.5 h-4.5 text-[#7A1B28]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                              Task Description & Instructions
                            </span>
                          </div>

                          <div className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal whitespace-pre-line pl-0.5">
                            {assignment.instructions}
                          </div>

                          {/* Image Attachment if instructor included one */}
                          {assignment.imageUrl && (
                            <div className="pt-3 border-t border-slate-200/70 mt-3">
                              <p className="text-xs font-semibold text-slate-600 mb-2.5 flex items-center gap-1.5">
                                <ImageIcon className="w-4 h-4 text-[#7A1B28]" />
                                <span>Attached Diagram / Reference Material:</span>
                              </p>
                              <img
                                src={assignment.imageUrl}
                                alt="Task Reference"
                                className="max-h-64 rounded-xl border border-slate-200 object-cover shadow-2xs"
                              />
                            </div>
                          )}
                        </div>

                        {/* SUBMISSION FORM */}
                        {isClosed ? (
                          <div className="p-4 bg-gray-100 border border-gray-200 rounded-lg flex items-center gap-3 text-gray-600 text-xs">
                            <Lock className="w-5 h-5 text-gray-400 shrink-0" />
                            <span>
                              <strong>Assignment Due and Closed: </strong> The deadline for this task has passed. Submissions are no longer accepted.
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-700">
                              Submit Assignment
                            </p>

                            <div
                              onDragOver={(e) => handleDragOver(e, assignment.id)}
                              onDragLeave={(e) => handleDragLeave(e, assignment.id)}
                              onDrop={(e) => handleDrop(e, assignment.id)}
                              className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all ${
                                isDrag
                                  ? 'border-[#7A1B28] bg-[#7A1B28]/5'
                                  : 'border-gray-300 hover:border-gray-400 bg-gray-50/30'
                              }`}
                            >
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Drag and drop your recording or document here
                              </p>
                              <p className="text-xs text-gray-400 mb-4">
                                Supports MP3, M4A, WAV, MP4, PDF, DOCX, and Image files
                              </p>

                              <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 cursor-pointer">
                                <span>Choose File</span>
                                <input
                                  type="file"
                                  accept=".mp3,.m4a,.wav,.mp4,.pdf,.docx,.doc,image/*"
                                  onChange={(e) =>
                                    handleFileChange(
                                      assignment.id,
                                      e.target.files && e.target.files[0] ? e.target.files[0] : null
                                    )
                                  }
                                  className="hidden"
                                />
                              </label>

                              {/* Selected File Feedback */}
                              {selectedFile && (
                                <div className="mt-4 p-3 bg-white border border-emerald-200 rounded-md inline-flex items-center gap-3 text-left">
                                  <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                                  <div className="text-xs">
                                    <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                                    <p className="text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {selectedFile && (
                              <div className="flex justify-end pt-2">
                                <button
                                  type="button"
                                  onClick={() => handleSubmitAssignment(assignment)}
                                  disabled={isSubmitting}
                                  className="px-6 py-2.5 bg-[#7A1B28] text-white rounded-md text-xs font-semibold uppercase tracking-wider hover:bg-[#621520] transition-colors inline-flex items-center gap-2 shadow-2xs disabled:opacity-50 cursor-pointer"
                                >
                                  <Upload className="w-4 h-4" />
                                  <span>{isSubmitting ? 'Submitting File...' : 'Submit Task Recording'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )
          ) : (
            /* SUBMITTED ASSIGNMENTS TAB CONTENT */
            assignments.filter((a) => a.status === 'Submitted').length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-2">
                <FileText className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-gray-900 font-semibold text-base">No Submitted Assignments Yet</p>
                <p className="text-xs text-gray-500">
                  When you submit work for an active task, it will be safely listed here in your submitted bar.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {assignments
                  .filter((a) => a.status === 'Submitted')
                  .map((assignment) => (
                    <div
                      key={assignment.id}
                      className="bg-white rounded-xl border border-emerald-200 p-6 sm:p-8 shadow-xs space-y-6"
                    >
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-100 pb-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block">
                            SUBMITTED TASK
                          </span>
                          <h3 className="text-xl sm:text-2xl font-bold font-serif text-gray-900">
                            {assignment.title}
                          </h3>
                        </div>

                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Submitted & Cloud Saved</span>
                        </span>
                      </div>

                      {/* Instructions / Description Box */}
                      <div className="bg-slate-50/90 border-l-4 border-l-emerald-600 border border-slate-200/80 rounded-r-xl p-5 space-y-3.5 shadow-2xs">
                        <div className="flex items-center gap-2 border-b border-slate-200/70 pb-2.5">
                          <ClipboardList className="w-4.5 h-4.5 text-emerald-700" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                            Task Description & Instructions
                          </span>
                        </div>

                        <div className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal whitespace-pre-line pl-0.5">
                          {assignment.instructions}
                        </div>

                        {assignment.imageUrl && (
                          <div className="pt-3 border-t border-slate-200/70 mt-3">
                            <p className="text-xs font-semibold text-slate-600 mb-2.5 flex items-center gap-1.5">
                              <ImageIcon className="w-4 h-4 text-emerald-700" />
                              <span>Attached Diagram / Reference Material:</span>
                            </p>
                            <img
                              src={assignment.imageUrl}
                              alt="Task Reference"
                              className="max-h-64 rounded-xl border border-slate-200 object-cover shadow-2xs"
                            />
                          </div>
                        )}
                      </div>

                      {/* Submitted File Details Card */}
                      <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                            <FileCheck className="w-4 h-4 text-emerald-600" />
                            <span>Submitted Task File</span>
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {assignment.submittedFile?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Size: {assignment.submittedFile?.size} • Submitted on {assignment.submittedFile?.date}
                          </p>
                        </div>

                        {assignment.submittedFile?.dataUrl && (
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(assignment.submittedFile!)}
                            className="px-4 py-2 bg-[#7A1B28] text-white rounded-md text-xs font-semibold hover:bg-[#621520] transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Submission</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )
          )}
        </section>

      </main>
    </div>
  );
};
