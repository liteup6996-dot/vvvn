import React, { useState, useEffect } from 'react';
import { StudentProfile, Assignment } from '../types';
import { ABDUL_REHMAN_STUDENT, LOGO_URL } from '../data';
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
  UserCheck
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

  // Shared Assignments State (persisted in localStorage for Vercel/Cloud compatibility)
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return [];
  });

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

  // Synchronize assignments to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch {
      // ignore
    }
  }, [assignments]);

  // Handle Login submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanIdentifier = loginIdentifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setLoginError(`Please enter both ${loginRole === 'student' ? 'Student ID' : 'Instructor ID'} and Password.`);
      return;
    }

    if (loginRole === 'student') {
      // Student Strict Check: ID = 625H (case-insensitive) & Password = 162111
      if (cleanIdentifier.toUpperCase() === '625H' && cleanPassword === '162111') {
        setCurrentStudent(ABDUL_REHMAN_STUDENT);
        setIsLoggedIn(true);
        setIsInstructorLoggedIn(false);
      } else {
        setLoginError('Invalid Student ID or password. Please verify your credentials.');
      }
    } else {
      // Instructor Strict Check: ID = 123123 & Password = 1122
      if (cleanIdentifier === '123123' && cleanPassword === '1122') {
        setIsInstructorLoggedIn(true);
        setIsLoggedIn(true);
      } else {
        setLoginError('Invalid Instructor ID or password. Please verify your credentials.');
      }
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

  // Instructor Action: Create & Publish Assignment
  const handleCreateAssignment = (e: React.FormEvent) => {
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

    setAssignments((prev) => [newAsg, ...prev]);

    // Reset Form
    setNewTitle('');
    setNewInstructions('');
    setNewDueDate('');
    setNewDueTime('23:59');
    setAttachedImage(null);
    setCreateMsg('Assignment successfully created and published for Abdul REHMAN!');
    setTimeout(() => setCreateMsg(''), 4000);
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
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const todayStr = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }) + ` at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      setAssignments((prev) =>
        prev.map((item) => {
          if (item.id === asg.id) {
            return {
              ...item,
              status: 'Submitted',
              submittedFile: {
                name: file.name,
                size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                type: file.type || 'application/octet-stream',
                date: todayStr,
                dataUrl: dataUrl,
              },
            };
          }
          return item;
        })
      );

      setSelectedFiles((prev) => ({ ...prev, [asg.id]: null }));
      setSubmittingAsgId(null);
      setSubmitSuccessMsg('Assignment submitted successfully!');
      setTimeout(() => setSubmitSuccessMsg(null), 4000);
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

  // ==========================================
  // VIEW: UNAUTHENTICATED LOGIN SCREEN
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        
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
                    placeholder={loginRole === 'student' ? 'e.g. 111H' : 'e.g. 1001'}
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
                  className={`w-full py-3 px-4 text-white font-semibold text-sm uppercase tracking-wider rounded-md transition-colors shadow-xs cursor-pointer ${
                    loginRole === 'student'
                      ? 'bg-[#7A1B28] hover:bg-[#621520]'
                      : 'bg-[#D97706] hover:bg-[#b46204]'
                  }`}
                  id="lms-login-submit-btn"
                >
                  {loginRole === 'student' ? 'Login to Student Portal' : 'Login to Instructor Portal'}
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
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {assignments.length} Total
              </span>
            </h2>

            {assignments.length === 0 ? (
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
                    <div key={asg.id} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-2xs">
                      
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-gray-100 pb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{asg.title}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">Assigned: {asg.assignedDate} • Deadline: {asg.dueDate}</p>
                        </div>

                        <div>
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
                        </div>
                      </div>

                      {/* Instructions */}
                      <p className="text-xs text-gray-700 font-light leading-relaxed bg-gray-50 p-3 rounded-md">
                        <strong>Task Instructions: </strong>{asg.instructions}
                      </p>

                      {/* Image Preview if instructor attached image */}
                      {asg.imageUrl && (
                        <div>
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Attached Task Image:</p>
                          <img src={asg.imageUrl} alt="Task visual" className="h-32 rounded-lg object-cover border border-gray-200" />
                        </div>
                      )}

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

        {/* ACTIVE ASSIGNMENTS SECTION */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h2 className="text-lg font-bold font-serif text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#7A1B28]" />
              <span>ACTIVE ASSIGNMENTS</span>
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {assignments.filter(a => a.status === 'Pending').length} Pending
            </span>
          </div>

          {assignments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-gray-900 font-semibold text-base">All Caught Up!</p>
              <p className="text-xs text-gray-500">
                You have no active pending home tasks. Check back after your next practice session with Mr. Abdulleh Hashmi.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {assignments.map((assignment) => {
                const isClosed = assignment.dueDateTimeMs ? Date.now() > assignment.dueDateTimeMs : false;
                const isSubmitted = assignment.status === 'Submitted';
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
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-gray-100 pb-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#7A1B28]">
                          ASSIGNMENT TASK
                        </span>
                        <h3 className="text-xl font-bold font-serif text-gray-900 mt-1">
                          {assignment.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4 text-xs shrink-0">
                        <div>
                          <span className="text-gray-400 block">Assigned:</span>
                          <span className="font-medium text-gray-700">{assignment.assignedDate}</span>
                        </div>
                        <div className="pl-4 border-l border-gray-200">
                          <span className="text-gray-400 block">Deadline:</span>
                          <span className={`font-semibold flex items-center gap-1 ${isClosed ? 'text-gray-500' : 'text-red-700'}`}>
                            <Clock className="w-3.5 h-3.5" />
                            {assignment.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {isSubmitted ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Submitted</span>
                        </span>
                      ) : isClosed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
                          <Lock className="w-4 h-4" />
                          <span>Assignment Due and Closed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                          <Clock className="w-4 h-4" />
                          <span>Pending Submission</span>
                        </span>
                      )}
                    </div>

                    {/* Instructions */}
                    <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-100 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Task Instructions:
                      </p>
                      <p className="text-sm text-gray-800 leading-relaxed font-light">
                        {assignment.instructions}
                      </p>

                      {/* Image Attachment if instructor included one */}
                      {assignment.imageUrl && (
                        <div className="pt-2">
                          <p className="text-xs font-semibold text-gray-500 mb-2">Attached Diagram / Reference:</p>
                          <img
                            src={assignment.imageUrl}
                            alt="Task Reference"
                            className="max-h-56 rounded-lg border border-gray-200 object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* SUBMISSION / DUE CLOSED SECTION */}
                    {isSubmitted ? (
                      <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-lg flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                            Submitted Task File
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {assignment.submittedFile?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Submitted on {assignment.submittedFile?.date}
                          </p>
                        </div>
                        {assignment.submittedFile?.dataUrl && (
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(assignment.submittedFile!)}
                            className="px-3.5 py-1.5 bg-[#7A1B28] text-white rounded-md text-xs font-semibold hover:bg-[#621520] transition-colors inline-flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>
                        )}
                      </div>
                    ) : isClosed ? (
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
                            <div className="mt-4 p-3 bg-white border border-emerald-200 rounded-md inline-flex items-center gap-3 text-left max-w-md mx-auto shadow-2xs">
                              <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                              <div className="truncate text-xs">
                                <p className="font-semibold text-gray-900 truncate">
                                  {selectedFile.name}
                                </p>
                                <p className="text-gray-400 text-[11px]">
                                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => handleSubmitAssignment(assignment)}
                            disabled={!selectedFile || isSubmitting}
                            className={`px-6 py-3 rounded-md font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                              selectedFile && !isSubmitting
                                ? 'bg-[#7A1B28] text-white hover:bg-[#621520] shadow-2xs cursor-pointer'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                            id={`btn-submit-assignment-${assignment.id}`}
                          >
                            {isSubmitting ? (
                              <span>Uploading...</span>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                <span>Submit Assignment</span>
                              </>
                            )}
                          </button>
                        </div>

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
};
