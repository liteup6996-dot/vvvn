import React, { useState, useEffect, useRef } from 'react';
import { CertificateRecord } from '../types';
import { DEFAULT_CERTIFICATE_AYESHA, CERTIFICATES_DATABASE, LOGO_URL } from '../data';
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  Calendar,
  Sparkles,
  Share2,
  Copy,
  Download,
  Search,
  ExternalLink,
  ChevronRight,
  Eye,
  X,
  FileCheck,
  Check,
  Lock,
  Layers,
  BookOpen,
  Volume2,
  Clock,
  UserCheck,
  Maximize2,
  ZoomIn,
} from 'lucide-react';

interface CertificateVerificationPageProps {
  onBackToHome: () => void;
  onOpenLms: () => void;
  initialCertificateId?: string;
}

export const CertificateVerificationPage: React.FC<CertificateVerificationPageProps> = ({
  onBackToHome,
  onOpenLms,
  initialCertificateId = 'AA-630H',
}) => {
  const [certIdInput, setCertIdInput] = useState(initialCertificateId);
  const [currentCert, setCurrentCert] = useState<CertificateRecord>(() => {
    const clean = initialCertificateId.trim().toUpperCase();
    return CERTIFICATES_DATABASE[clean] || DEFAULT_CERTIFICATE_AYESHA;
  });

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeCurriculumSection, setActiveCurriculumSection] = useState<number | 'all'>('all');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Handle URL changes and extract certificate ID if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const match = path.match(/certify-id-([A-Za-z0-9_-]+)/i);
      if (match && match[1]) {
        const foundId = match[1].toUpperCase();
        if (CERTIFICATES_DATABASE[foundId]) {
          setCurrentCert(CERTIFICATES_DATABASE[foundId]);
          setCertIdInput(foundId);
        }
      }
    }
  }, []);

  // Canonical verification link
  const canonicalVerificationUrl = `https://vocalvantage.online/certify-id-${currentCert.id}`;
  const certificateFileUrl = currentCert.certificateImageUrl || '/certificates/VV-AA-630H.png';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(canonicalVerificationUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyHash = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentCert.verificationHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2500);
    }
  };

  // Direct download of the attached certificate image
  const handleDownloadCertificate = async () => {
    setIsDownloading(true);
    try {
      const fileName = `VocalVantage_Certificate_${currentCert.studentName.replace(/\s+/g, '_')}_${currentCert.id}.png`;
      const response = await fetch(certificateFileUrl);
      if (!response.ok) throw new Error('Network response not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.warn('Fallback to direct link download:', err);
      // Fallback anchor download
      const link = document.createElement('a');
      link.href = certificateFileUrl;
      link.download = `VocalVantage_Certificate_${currentCert.id}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } finally {
      setIsDownloading(false);
    }
  };

  // Add to LinkedIn Certification URL generator
  const getLinkedInAddCertUrl = () => {
    const orgName = 'VocalVantage';
    const certName = `${currentCert.courseTitle} (Certified in American Accent Training)`;
    const certUrl = canonicalVerificationUrl;
    const certId = currentCert.certificateNumber || currentCert.id;
    const issueYear = '2026';
    const issueMonth = '10';

    return `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
      certName
    )}&organizationName=${encodeURIComponent(
      orgName
    )}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(
      certUrl
    )}&certId=${encodeURIComponent(certId)}`;
  };

  const handleSearchCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = certIdInput.trim().toUpperCase();
    if (CERTIFICATES_DATABASE[clean]) {
      setCurrentCert(CERTIFICATES_DATABASE[clean]);
      setSearchError(null);
      if (typeof window !== 'undefined') {
        const targetPath = `/certify-id-${clean}`;
        if (window.location.pathname !== targetPath) {
          window.history.pushState({}, '', targetPath);
        }
      }
    } else {
      setSearchError(`Certificate ID "${certIdInput}" was not found in the public ledger.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 flex flex-col font-sans selection:bg-[#7A1B28]/10 selection:text-[#7A1B28]">
      {/* ======================================================== */}
      {/* 1. COURSERA-STYLE TOP VERIFICATION BAR                  */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-3 text-left group focus:outline-hidden"
              title="Return to VocalVantage Home"
            >
              <img
                src={LOGO_URL}
                alt="Vocal Vantage Logo"
                className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                referrerPolicy="no-referrer"
              />
            </button>
            <div className="h-6 w-px bg-gray-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official Verification Registry</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onBackToHome}
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-600 hover:text-[#7A1B28] px-3 py-2 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={onOpenLms}
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-600 hover:text-[#7A1B28] px-3 py-2 transition-colors cursor-pointer hidden sm:inline-block"
            >
              Student LMS
            </button>
            <button
              onClick={handleDownloadCertificate}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#7A1B28] hover:bg-[#63141F] text-white shadow-xs transition-all cursor-pointer"
              title="Download official high-resolution certificate"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Downloading...' : downloadSuccess ? 'Downloaded!' : 'Download Certificate'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. VERIFIED ACCREDITATION NOTIFICATION BANNER            */}
      {/* ======================================================== */}
      <div className="bg-[#0B3B24] text-white border-b border-emerald-900 py-3.5 px-4 sm:px-6 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-400/30">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <p className="font-semibold text-white flex items-center gap-2">
                <span>VocalVantage Verified Credential</span>
                <span className="bg-emerald-400/20 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 font-mono">
                  ID: {currentCert.certificateNumber || currentCert.id}
                </span>
              </p>
              <p className="text-emerald-100/90 text-xs mt-0.5">
                VocalVantage certifies the authenticity of this certificate, program completion, and verified assessment scores.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <span className="text-[11px] text-emerald-200/80 font-mono hidden md:inline">
              vocalvantage.online/certify-id-{currentCert.id}
            </span>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-700/60 hover:bg-emerald-700 text-white text-xs font-medium transition-colors border border-emerald-500/30 cursor-pointer"
              title="Copy verified certificate URL"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN VERIFICATION BODY                                */}
      {/* ======================================================== */}
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Top Header Card (Coursera Signature Style) */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Certified in American Accent Training • Distinction Score: {currentCert.score}%</span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gray-900 tracking-tight">
                  {currentCert.courseTitle}
                </h1>
                <p className="text-base sm:text-lg text-gray-600 mt-2">
                  Proudly presented to{' '}
                  <span className="font-bold text-gray-900 underline decoration-[#7A1B28]/30 decoration-2 underline-offset-4">
                    {currentCert.studentName}
                  </span>{' '}
                  • Date of Issue:{' '}
                  <span className="font-semibold text-gray-800">{currentCert.completionDate}</span>
                </p>
              </div>

              <p className="text-sm text-gray-500 max-w-3xl leading-relaxed">
                In recognition of the successful completion of the <strong className="text-gray-800 font-medium">24-Day American Accent Program</strong> offered by Vocal Vantage, and the successful passing of the comprehensive program assessment with an overall score of <span className="font-bold text-[#7A1B28]">{currentCert.score}%</span>.
              </p>
            </div>

            {/* Action buttons (Download, LinkedIn, Share) */}
            <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0 print:hidden">
              <button
                onClick={handleDownloadCertificate}
                disabled={isDownloading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#7A1B28] hover:bg-[#63141F] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
                id="download-certificate-action-btn"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Preparing file...' : downloadSuccess ? 'File Downloaded!' : 'Download Certificate Image'}</span>
              </button>

              <a
                href={getLinkedInAddCertUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
                id="add-to-linkedin-btn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span>Add to LinkedIn Profile</span>
              </a>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
                id="copy-verification-url-btn"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-gray-500" />
                    <span>Share / Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
            <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100">
              <span className="text-xs text-gray-500 font-medium block">Assessment Score</span>
              <span className="text-xl sm:text-2xl font-bold text-[#7A1B28]">{currentCert.score}%</span>
              <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">Distinction Passed</span>
            </div>

            <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100">
              <span className="text-xs text-gray-500 font-medium block">Program Structure</span>
              <span className="text-base sm:text-lg font-bold text-gray-800">24 Days / 6 Weeks</span>
              <span className="text-[11px] text-gray-500 block mt-0.5">4 Classes / Week • 1-to-1</span>
            </div>

            <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100">
              <span className="text-xs text-gray-500 font-medium block">Date of Issue</span>
              <span className="text-base sm:text-lg font-bold text-gray-800">{currentCert.completionDate}</span>
              <span className="text-[11px] text-gray-500 block mt-0.5">Verified Authentic</span>
            </div>

            <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100">
              <span className="text-xs text-gray-500 font-medium block">Certificate ID</span>
              <span className="text-base sm:text-lg font-mono font-bold text-gray-900">{currentCert.certificateNumber || currentCert.id}</span>
              <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">Officially Registered</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. OFFICIAL ATTACHED CERTIFICATE DISPLAY                 */}
        {/* ======================================================== */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#7A1B28]" />
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Official Certificate of Completion
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5 text-gray-500" />
                <span>Fullscreen View</span>
              </button>
              <button
                onClick={handleDownloadCertificate}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7A1B28] hover:bg-[#63141F] text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>

          {/* Certificate Frame with High-End Presentation */}
          <div className="relative group bg-white rounded-2xl border border-gray-300 p-3 sm:p-5 shadow-xl overflow-hidden">
            <div
              className="relative w-full rounded-xl overflow-hidden border border-gray-200 shadow-md cursor-pointer bg-amber-50/30"
              onClick={() => setIsLightboxOpen(true)}
              title="Click to view high-resolution full certificate"
            >
              <img
                src={certificateFileUrl}
                alt={`Certificate of Completion for ${currentCert.studentName} - ${currentCert.courseTitle}`}
                className="w-full h-auto object-contain max-h-[820px] transition-transform duration-300 group-hover:scale-[1.008]"
              />

              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-semibold text-sm backdrop-blur-[2px]">
                <ZoomIn className="w-5 h-5" />
                <span>Click to view full screen & inspect high-resolution seals</span>
              </div>
            </div>

            {/* Verification Sub-bar beneath Certificate */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-3 border-t border-gray-100 text-xs text-gray-600 px-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Officially Verified Signatures:</span>
                </div>
                <span><strong>Akhtar Hayat</strong> (Program Manager)</span>
                <span className="text-gray-300">•</span>
                <span><strong>Faizan Muhammad</strong> (CEO)</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-mono">Barcode: VV-AA-630H</span>
                <button
                  onClick={handleDownloadCertificate}
                  className="text-[#7A1B28] font-semibold underline hover:text-[#501019] cursor-pointer ml-2"
                >
                  Download Official Certificate (.png)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 5. COURSE CURRICULUM & SKILLS VERIFIED (FROM ROADMAP)    */}
        {/* ======================================================== */}
        <div className="mb-12 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7A1B28]">
                <BookOpen className="w-4 h-4" />
                <span>Official Course Curriculum & Learning Roadmap</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                24-Day American Accent Program Curriculum
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                24 Days • 6 Weeks • 4 Classes / Week • 1-to-1 Training • 60 Min / Class
              </p>
            </div>

            {/* Section Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveCurriculumSection('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeCurriculumSection === 'all'
                    ? 'bg-[#7A1B28] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Sections (Days 1–24)
              </button>
              <button
                onClick={() => setActiveCurriculumSection(1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeCurriculumSection === 1
                    ? 'bg-[#7A1B28] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Section 1 (Days 1–10)
              </button>
              <button
                onClick={() => setActiveCurriculumSection(2)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeCurriculumSection === 2
                    ? 'bg-[#7A1B28] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Section 2 (Days 11–16)
              </button>
              <button
                onClick={() => setActiveCurriculumSection(3)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeCurriculumSection === 3
                    ? 'bg-[#7A1B28] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Section 3 (Days 17–20)
              </button>
              <button
                onClick={() => setActiveCurriculumSection(4)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeCurriculumSection === 4
                    ? 'bg-[#7A1B28] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Section 4 (Days 21–24)
              </button>
            </div>
          </div>

          {/* Curriculum Sections Grid */}
          <div className="space-y-6">
            {currentCert.curriculumSections?.map((section) => {
              if (activeCurriculumSection !== 'all' && activeCurriculumSection !== section.sectionNumber) {
                return null;
              }

              return (
                <div
                  key={section.sectionNumber}
                  className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden"
                >
                  {/* Section Title Banner */}
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{section.daysRange}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                        {section.sectionTitle}
                      </h3>
                      {section.subtitle && (
                        <p className="text-xs text-gray-300 mt-1">{section.subtitle}</p>
                      )}
                    </div>
                    <span className="shrink-0 self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-emerald-300 border border-white/20">
                      Verified Completed
                    </span>
                  </div>

                  {/* Section Items Table / List */}
                  <div className="divide-y divide-gray-100">
                    {section.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 sm:p-5 hover:bg-gray-50/70 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-3 text-sm"
                      >
                        <div className="flex items-start gap-3.5 max-w-3xl">
                          <div className="w-16 sm:w-20 shrink-0 text-center py-1.5 px-2 bg-gray-100 rounded-lg text-xs font-bold text-[#7A1B28] border border-gray-200">
                            Day {item.days}
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                              <span>{item.focus}</span>
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                              {item.content}
                            </p>
                          </div>
                        </div>

                        {item.score && (
                          <div className="shrink-0 self-end md:self-center flex items-center gap-2">
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Mastered ({item.score}%)</span>
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 60-Minute Class Format & Methodology Card (from Curriculum) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#7A1B28]" />
              <span>Standard 60-Minute 1-to-1 Class Format</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              Every session followed a structured clinical accent acquisition workflow designed for retention and articulatory muscle memory:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-xs font-bold text-[#7A1B28] block">10 min</span>
                <span className="text-xs font-semibold text-gray-800 block mt-1">Review</span>
                <span className="text-[10px] text-gray-500 block mt-0.5">Previous Sound Drill</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-xs font-bold text-[#7A1B28] block">15 min</span>
                <span className="text-xs font-semibold text-gray-800 block mt-1">New Sound / Concept</span>
                <span className="text-[10px] text-gray-500 block mt-0.5">Mouth Placement</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-xs font-bold text-[#7A1B28] block">15 min</span>
                <span className="text-xs font-semibold text-gray-800 block mt-1">Vocabulary + Drills</span>
                <span className="text-[10px] text-gray-500 block mt-0.5">Word to Sentence</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-xs font-bold text-[#7A1B28] block">15 min</span>
                <span className="text-xs font-semibold text-gray-800 block mt-1">Conversation / Shadowing</span>
                <span className="text-[10px] text-gray-500 block mt-0.5">Real-Speech Flow</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 col-span-2 sm:col-span-1">
                <span className="text-xs font-bold text-[#7A1B28] block">5 min</span>
                <span className="text-xs font-semibold text-gray-800 block mt-1">Feedback + Homework</span>
                <span className="text-[10px] text-gray-500 block mt-0.5">Acoustic Audio Correction</span>
              </div>
            </div>
          </div>

          {/* Program Notes & Teaching Style (from Curriculum) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Teaching Style & Delivery Method
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Applied professional phonetic terminology explained simply, moving rapidly into repetitive physical articulatory drills, acoustic imitation, and natural conversational integration.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Selected Listening & Interactive Media Exposure
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Structured interactive practice exposure through curated video and audio clips (Amazon Prime, Netflix, and Tabii) for native listening discrimination and real-time sentence shadowing.
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 6. VERIFICATION AUDIT & RE-QUERY                         */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left 2 Cols: Skills Verified Chips */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7A1B28]/10 flex items-center justify-center text-[#7A1B28]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Summary of Certified Competencies</h3>
                <p className="text-xs text-gray-500">Mastered over the 24-Day American Accent Program</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {currentCert.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-medium text-gray-800 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Right Col: Ledger details and Re-query */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                <Lock className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  Registry Record
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Recipient</span>
                  <span className="font-semibold text-gray-900 text-sm">{currentCert.studentName}</span>
                </div>

                <div>
                  <span className="text-gray-500 block">Certificate Registration ID</span>
                  <span className="font-mono font-bold text-gray-900 text-sm">{currentCert.certificateNumber || currentCert.id}</span>
                </div>

                <div>
                  <span className="text-gray-500 block">Issuing Authority</span>
                  <span className="font-medium text-gray-900">{currentCert.accreditationAuthority}</span>
                </div>

                <div>
                  <span className="text-gray-500 block">Signatories</span>
                  <span className="font-medium text-gray-800 block">Akhtar Hayat (Program Manager)</span>
                  <span className="font-medium text-gray-800 block">Faizan Muhammad (CEO)</span>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] leading-tight">
                      Validated in the VocalVantage public certificate ledger at <strong>vocalvantage.online/certify-id-{currentCert.id}</strong>.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Re-verify another certificate lookup */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
              <h4 className="text-sm font-bold text-gray-900 mb-2">Verify Another Credential</h4>
              <p className="text-xs text-gray-500 mb-4">
                Enter another student credential ID (e.g. AA-630H) to query the ledger.
              </p>

              <form onSubmit={handleSearchCertificate} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={certIdInput}
                    onChange={(e) => {
                      setCertIdInput(e.target.value);
                      setSearchError(null);
                    }}
                    placeholder="e.g. AA-630H"
                    className="w-full px-3.5 py-2 pl-9 text-xs sm:text-sm rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#7A1B28]/20 focus:border-[#7A1B28]"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>

                {searchError && (
                  <p className="text-xs text-rose-600 font-medium">{searchError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                >
                  Verify ID
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Notice for Employers */}
        <div className="bg-gray-100/70 rounded-2xl border border-gray-200/80 p-6 sm:p-8 text-xs text-gray-500 space-y-3">
          <h5 className="font-semibold text-gray-800 uppercase tracking-wider text-xs">
            Notice for Employers, Academic Institutions & Global Clients
          </h5>
          <p className="leading-relaxed">
            Vocal Vantage certificates are issued exclusively to students who have completed rigorous acoustic evaluations, diagnostic vocal phonetics testing, and one-on-one kinematic speech training.
          </p>
          <p className="leading-relaxed">
            For independent institutional verification requests or employer reference checks, email{' '}
            <a href="mailto:info@vocalvantage.online" className="text-[#7A1B28] underline font-medium">
              info@vocalvantage.online
            </a>{' '}
            referencing credential code <strong>{currentCert.certificateNumber || currentCert.id}</strong>.
          </p>
        </div>
      </main>

      {/* Lightbox Modal for Full-Resolution Certificate View */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadCertificate();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7A1B28] text-white text-xs font-semibold hover:bg-[#63141F] transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/40 cursor-pointer"
              title="Close Fullscreen"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <img
            src={certificateFileUrl}
            alt="Full certificate view"
            className="max-h-[92vh] max-w-[95vw] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
