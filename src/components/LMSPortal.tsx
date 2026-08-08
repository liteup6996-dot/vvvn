import React, { useState, useEffect } from 'react';
import { StudentProfile, Assignment } from '../types';
import { ABDUL_REHMAN_STUDENT, LOGO_URL } from '../data';
import { isSupabaseConfigured, SUPABASE_SETUP_SQL } from '../lib/supabase';
import {
  authenticateUser,
  fetchAssignmentsFromStore,
  createAssignmentInStore,
  submitAssignmentInStore,
  deleteAssignmentInStore,
  clearAllAssignmentsInStore,
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

  // Supabase Config State & Modal
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(isSupabaseConfigured());
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

  // Load assignments from Supabase DB or localStorage on mount
  const loadAssignments = async () => {
    setIsLoadingAssignments(true);
    const list = await fetchAssignmentsFromStore(STORAGE_KEY);
    setAssignments(list);
    setIsLoadingAssignments(false);
  };

  useEffect(() => {
    loadAssignments();
    setSupabaseConnected(isSupabaseConfigured());

    // Auto-refresh assignments every 5 seconds for real-time multi-device sync
    const interval = setInterval(() => {
      loadAssignments();
    }, 5000);

    const handleFocus = () => {
      loadAssignments();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

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
        </div>

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
                supabaseConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <Database className="w-3 h-3" />
                <span>{supabaseConnected ? 'Supabase Active' : 'Local Mode'}</span>
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
