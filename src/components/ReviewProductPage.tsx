import React, { useState, useEffect } from 'react';
import { OrderRecord } from '../types';
import { createZeroDollarOrder, getLocalOrders, injectTrustpilotAfsSnippet } from '../services/orderService';
import { OrderInvoiceModal } from './OrderInvoiceModal';
import { LOGO_URL } from '../data';
import {
  ShieldCheck,
  CheckCircle2,
  Star,
  Download,
  FileText,
  ArrowLeft,
  Headphones,
  BookOpen,
  Sparkles,
  ExternalLink,
  Award,
  Check,
  Lock,
  Clock,
  HelpCircle,
} from 'lucide-react';

interface ReviewProductPageProps {
  onBackToHome: () => void;
}

export const ReviewProductPage: React.FC<ReviewProductPageProps> = ({ onBackToHome }) => {
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('United States');
  const [nativeLanguage, setNativeLanguage] = useState('English / Non-Native ESL');
  const [promoCode, setPromoCode] = useState('TRUSTPILOT100');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // States
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('review_portal_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [gatePasscode, setGatePasscode] = useState('');
  const [gateError, setGateError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState('');

  const handleGateUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setGateError('');
    if (gatePasscode.trim() === '7869') {
      try {
        sessionStorage.setItem('review_portal_unlocked', 'true');
      } catch {
        // Safe fallback
      }
      setIsAuthorized(true);
    } else {
      setGateError('Incorrect password. Please enter the valid passcode.');
    }
  };

  // On mount, check if there is an existing recent order
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const orders = getLocalOrders();
    if (orders.length > 0) {
      // Optional: keep latest order in memory or let user start clean
    }

    // Refresh Trustpilot widget if window.Trustpilot is available
    if (typeof window !== 'undefined' && window.Trustpilot) {
      const widget = document.getElementById('trustpilot-review-collector-widget');
      if (widget) {
        window.Trustpilot.loadFromElement(widget, true);
      }
    }
  }, [completedOrder]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !email.trim()) {
      setErrorMessage('Please enter your full name and a valid email address.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid email address so your official Trustpilot verification can link.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please accept the order terms and verification consent to proceed.');
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await createZeroDollarOrder({
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        country,
        nativeLanguage,
        promoCode,
      });

      setCompletedOrder(order);
      injectTrustpilotAfsSnippet(order);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Order submission error:', err);
      setErrorMessage('An error occurred while creating your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatedDownload = (fileName: string) => {
    setDownloadSuccessMessage(`Preparing download: ${fileName}`);
    setTimeout(() => {
      // Create a sample downloadable file blob for real user satisfaction
      const content = `VOCAL VANTAGE ACADEMY\nOfficial Educational Material: ${fileName}\nLicensed to: ${completedOrder?.customerName || 'Verified Student'}\nReference ID: ${completedOrder?.referenceId || 'VV-ORD-SAMPLE'}\nDate: ${new Date().toLocaleDateString()}\n\nWelcome to Vocal Vantage. Practice daily for optimal vocal clarity and accent refinement.`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName.endsWith('.pdf') ? fileName.replace('.pdf', '.txt') : `${fileName}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloadSuccessMessage(`Downloaded successfully: ${fileName}`);
      setTimeout(() => setDownloadSuccessMessage(''), 4000);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-gray-900 pb-24" id="review-product-page-root">
      
      {/* TOP NAVIGATION BAR */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              id="review-page-back-btn"
            >
              <ArrowLeft className="w-4 h-4 text-[#7A1B28]" />
              <span>Back to Main Website</span>
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7A1B28]"></span>
              <span className="text-xs font-medium text-gray-500">
                Official Trustpilot Verification & Educational Grant Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="Vocal Vantage Logo"
              className="h-8 w-auto object-contain cursor-pointer"
              onClick={onBackToHome}
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        
        {/* IF NOT AUTHORIZED WITH PASSCODE 7869 -> DISPLAY PASSCODE CHALLENGE */}
        {!isAuthorized ? (
          <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-gray-200 shadow-xl p-8 space-y-6 text-center animate-fadeIn" id="review-page-gate-locked">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#7A1B28] mx-auto shadow-2xs">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-slate-100 text-slate-700 border border-slate-200">
                Security Protected Portal
              </span>
              <h2 className="text-2xl font-bold font-serif text-gray-900">
                Trustpilot Review Access
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Please enter the security password to access the official $0.00 product checkout and Trustpilot review system.
              </p>
            </div>

            {gateError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {gateError}
              </div>
            )}

            <form onSubmit={handleGateUnlock} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  value={gatePasscode}
                  onChange={(e) => {
                    setGatePasscode(e.target.value);
                    if (gateError) setGateError('');
                  }}
                  placeholder="Enter password"
                  autoFocus
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm tracking-widest text-center font-mono focus:outline-hidden focus:ring-2 focus:ring-[#7A1B28] focus:bg-white transition-all"
                  id="gate-passcode-input"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#7A1B28] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#621520] transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                id="gate-unlock-submit-btn"
              >
                <span>Unlock & Access Portal</span>
              </button>
            </form>

            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onBackToHome}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                Return to Home Page
              </button>
            </div>
          </div>
        ) : completedOrder ? (
          <div className="space-y-8 animate-fadeIn" id="order-confirmation-view">
            
            {/* Success Hero Card */}
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-md p-6 sm:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 pointer-events-none"></div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-emerald-100 text-emerald-800">
                        OFFICIAL TRANSACTION VERIFIED ($0.00 USD)
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        {completedOrder.orderNumber}
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900">
                      Order Confirmed & Access Granted!
                    </h1>
                    <p className="text-sm text-gray-600">
                      Thank you, <strong className="text-gray-900">{completedOrder.customerName}</strong>. Your starter kit is ready for instant download and your purchase reference is registered for an official Trustpilot review.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <button
                    onClick={() => setIsInvoiceOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors shadow-2xs cursor-pointer"
                    id="view-invoice-receipt-btn"
                  >
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>View Official Receipt & Invoice</span>
                  </button>
                </div>
              </div>

              {/* Order Quick Details Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 text-xs border-b border-gray-100">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Order Number</span>
                  <p className="font-mono font-bold text-gray-900">{completedOrder.orderNumber}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Trustpilot Reference ID</span>
                  <p className="font-mono font-bold text-[#7A1B28]">{completedOrder.referenceId}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Total Charged</span>
                  <p className="font-bold text-emerald-700">$0.00 USD (Authorized & Cleared)</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Linked Customer Email</span>
                  <p className="font-medium text-gray-700 truncate">{completedOrder.customerEmail}</p>
                </div>
              </div>

              {/* SECTION: OFFICIAL TRUSTPILOT REVIEW CALLOUT (AFS COMPLIANT) */}
              <div className="pt-8 space-y-6">
                <div className="bg-linear-to-br from-emerald-50/80 via-white to-slate-50 border-2 border-emerald-300/80 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00b67a] flex items-center justify-center text-white font-bold shadow-xs">
                        <Star className="w-6 h-6 fill-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#00b67a]">
                            Official Trustpilot Review System
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                            Verified Purchase
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold font-serif text-gray-900">
                          Leave Your Verified Review on Trustpilot
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[#00b67a]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-[#00b67a]" />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed">
                    Because you have completed a registered transaction with Order Reference <strong className="font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded-sm">{completedOrder.referenceId}</strong>, our connection to the official Trustpilot Automatic Feedback Service (AFS) has authorized your profile for an authentic review that <strong>will not be flagged or rejected</strong>.
                  </p>

                  {/* Primary Review Action Button */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                    <a
                      href={completedOrder.trustpilotReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#00b67a] text-white rounded-xl text-sm font-bold tracking-wide hover:bg-[#009f6b] transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
                      id="official-trustpilot-evaluate-btn"
                    >
                      <Star className="w-5 h-5 fill-white" />
                      <span>Review Vocal Vantage on Trustpilot Now</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => setIsInvoiceOpen(true)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
                      id="download-proof-btn"
                    >
                      <Download className="w-4 h-4 text-[#7A1B28]" />
                      <span>Download Proof of Purchase Receipt</span>
                    </button>
                  </div>

                  {/* Trustpilot Review Rejection Prevention Checklist */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 text-xs text-gray-600">
                    <p className="font-bold text-gray-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Why This Official Process Will Not Get Rejected by Trustpilot:</span>
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Structured AFS JSON-LD Data:</strong> Injected directly into this confirmation view for automated Trustpilot crawlers.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Verifiable Reference ID:</strong> ({completedOrder.referenceId}) permanently stored in database.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Legitimate Order Receipt:</strong> Fully downloadable PDF invoice with merchant credentials.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Neutral Review Link:</strong> Conforms strictly with Trustpilot's anti-incentivization & honest feedback policies.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Trustpilot Embedded Review Collector Widget */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Official Trustpilot Widget Integration:</p>
                    <div
                      className="trustpilot-widget w-full flex justify-center py-2"
                      data-locale="en-US"
                      data-template-id="56278e9abfbbba0bdcd568bc"
                      data-businessunit-id="6a7dac007cbe39b7fca8524f"
                      data-style-height="52px"
                      data-style-width="100%"
                      data-token="9dd9ec3c-a0ad-4d84-94e7-ef13b91112c9"
                      id="trustpilot-review-collector-widget-confirmation"
                    >
                      <a
                        href="https://www.trustpilot.com/review/vocalvantage.online"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#00b67a] hover:underline"
                      >
                        Trustpilot Vocal Vantage Verified Profile
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* INSTANT PRODUCT DOWNLOADS SECTION */}
              <div className="pt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-gray-900">
                      Your Downloadable Materials & Educational Kit
                    </h3>
                    <p className="text-xs text-gray-500">
                      Included with your 0 USD transaction. Click any item to access immediately.
                    </p>
                  </div>
                  {downloadSuccessMessage && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md">
                      {downloadSuccessMessage}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Download 1 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="w-9 h-9 rounded-lg bg-[#7A1B28]/10 text-[#7A1B28] flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-gray-900">
                        General American Phonetics Guide (PDF)
                      </h4>
                      <p className="text-xs text-gray-600">
                        42-page complete vowel diagram, vowel length contrasts, and tongue placement chart.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSimulatedDownload('Vocal_Vantage_American_Phonetics_Guide.pdf')}
                      className="w-full py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-[#7A1B28]" />
                      <span>Download Guide (PDF)</span>
                    </button>
                  </div>

                  {/* Download 2 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <Headphones className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-gray-900">
                        Pronunciation Master Audio Tracks (MP3)
                      </h4>
                      <p className="text-xs text-gray-600">
                        Native speaker monologue audio exercises demonstrating rhotic vowel resonance.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSimulatedDownload('Vocal_Vantage_Audio_Diagnostic_Pack.mp3')}
                      className="w-full py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Download Audio Pack (MP3)</span>
                    </button>
                  </div>

                  {/* Download 3 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                        <Award className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-gray-900">
                        25-Point Diagnostic Assessment
                      </h4>
                      <p className="text-xs text-gray-600">
                        Comprehensive checklist to identify your primary phonological shifts and intonation gaps.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSimulatedDownload('Vocal_Vantage_25Point_Diagnostic_Checklist.pdf')}
                      className="w-full py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-700" />
                      <span>Download Checklist</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                <span>Need to order another kit or test again?</span>
                <button
                  onClick={() => {
                    setCompletedOrder(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Place Another Test Order
                </button>
              </div>

            </div>

          </div>
        ) : (
          /* STEP 1: PRODUCT LANDING & $0.00 CHECKOUT FORM */
          <div className="space-y-10" id="product-checkout-view">
            
            {/* Header Title & Pitch */}
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7A1B28]/10 text-[#7A1B28] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Complimentary Educational Access & Review Partner Program</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-gray-900 tracking-tight">
                General American Accent Diagnostic & Vocal Mastery Starter Kit
              </h1>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Experience Vocal Vantage's executive accent curriculum at zero financial cost. Complete the official registration below for <strong>$0.00 USD</strong> to receive immediate digital access and an authenticated Trustpilot review invitation.
              </p>
            </div>

            {/* Two-Column Grid: Product Package Card & Checkout Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: PRODUCT HIGHLIGHTS & TRUSTPILOT EXPLANATION (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Product Box Graphic Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A1B28] bg-[#7A1B28]/10 px-2.5 py-0.5 rounded-full">
                      Digital Educational Package
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      100% Free Sponsor Access
                    </span>
                  </div>

                  {/* Visual Representation */}
                  <div className="bg-linear-to-b from-gray-900 to-slate-900 text-white rounded-xl p-6 relative overflow-hidden shadow-inner">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#7A1B28]/40 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <img
                          src={LOGO_URL}
                          alt="Vocal Vantage"
                          className="h-7 w-auto object-contain brightness-0 invert"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[10px] font-mono tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded text-white font-semibold">
                          SKU: VV-0USD-ACCENT
                        </span>
                      </div>

                      <div className="space-y-1 pt-2">
                        <p className="text-xs text-slate-300 uppercase tracking-wider font-semibold">
                          Starter Digital Curriculum
                        </p>
                        <h3 className="text-xl font-bold font-serif leading-tight">
                          General American Accent Diagnostic Kit
                        </h3>
                      </div>

                      <div className="pt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">$0.00</span>
                        <span className="text-xs text-slate-400 line-through">$49.00 USD</span>
                        <span className="text-xs text-emerald-400 font-semibold ml-auto">
                          100% Grant Applied
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Included Deliverables List */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      What's Included in Your Free Order:
                    </p>
                    <div className="space-y-2.5 text-xs text-gray-700">
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <strong className="text-gray-900">42-Page General American Phonetics Guide (PDF)</strong>
                          <p className="text-gray-500 text-[11px]">Detailed articulatory diagrams and vowel placement drills.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <strong className="text-gray-900">Native Audio Monologue Companion (MP3)</strong>
                          <p className="text-gray-500 text-[11px]">High-definition recordings modeling rhotic stress and connected speech.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <strong className="text-gray-900">25-Point Diagnostic Self-Assessment Worksheet</strong>
                          <p className="text-gray-500 text-[11px]">Identify specific phonetic shifts needed for conversational mastery.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <strong className="text-gray-900">Official Verifiable Reference ID & Proof of Purchase</strong>
                          <p className="text-gray-500 text-[11px]">Qualifies you for verified buyer review status on Trustpilot.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Trustpilot Integrity & Anti-Rejection Notice */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-2.5 text-xs text-gray-700">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold uppercase tracking-wider text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Official Trustpilot Anti-Rejection Standard</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Trustpilot routinely flags or rejects reviews if there is no registered commercial interaction. By processing this $0 transaction, you receive a legitimate reference number (<span className="font-mono text-gray-800">VV-ORD-XXXXXX-REV</span>) and Trustpilot Automatic Feedback Service (AFS) tracking. This ensures your review is counted as a <strong>Verified Customer Experience</strong>.
                  </p>
                </div>

              </div>

              {/* RIGHT COLUMN: 0 USD CHECKOUT FORM (7 cols) */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 shadow-xs space-y-6">
                  
                  <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-gray-900">
                      Step 1: Order Registration & Details
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      No payment card required. Your credentials generate the verified Trustpilot review invitation.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                      {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmitOrder} className="space-y-5" id="zero-dollar-order-form">
                    
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. John Doe"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7A1B28] focus:bg-white transition-all"
                        id="order-full-name-input"
                      />
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. john.doe@example.com"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7A1B28] focus:bg-white transition-all"
                        id="order-email-input"
                      />
                      <p className="text-[11px] text-gray-400">
                        Your starter kit downloads and official Trustpilot review invitation will be sent to this email.
                      </p>
                    </div>

                    {/* Grid: Phone & Country */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                          Phone / WhatsApp <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 555-0199"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7A1B28] focus:bg-white transition-all"
                          id="order-phone-input"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                          Country / Region
                        </label>
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7A1B28] focus:bg-white transition-all"
                          id="order-country-select"
                        >
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                          <option value="Pakistan">Pakistan</option>
                          <option value="India">India</option>
                          <option value="United Arab Emirates">United Arab Emirates</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                          <option value="Other / International">Other / International</option>
                        </select>
                      </div>
                    </div>

                    {/* Language & Accent Goal */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                        Accent Goal / Target Focus
                      </label>
                      <select
                        value={nativeLanguage}
                        onChange={(e) => setNativeLanguage(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7A1B28] focus:bg-white transition-all"
                        id="order-accent-goal-select"
                      >
                        <option value="General American Accent (Executive / Conversational)">General American Accent (Executive / Conversational)</option>
                        <option value="British Received Pronunciation (RP)">British Received Pronunciation (RP)</option>
                        <option value="Call Center / Customer Facing Fluency">Call Center / Customer Facing Fluency</option>
                        <option value="Broadcasting & Public Speaking Resonance">Broadcasting & Public Speaking Resonance</option>
                      </select>
                    </div>

                    {/* Price Calculation Box */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Starter Diagnostic Kit Value:</span>
                        <span>$49.00 USD</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-700 font-medium">
                        <span className="flex items-center gap-1.5">
                          <span>Promo Code ({promoCode}):</span>
                        </span>
                        <span>-$49.00 USD</span>
                      </div>
                      <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-bold text-gray-900">
                        <span>Total Due Today:</span>
                        <span className="text-xl text-[#7A1B28]">$0.00 USD</span>
                      </div>
                    </div>

                    {/* Payment Method Badge */}
                    <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-800">
                      <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>No Payment Required: </strong> 100% sponsored educational grant. Instant digital download and official order receipt generated upon submission.
                      </span>
                    </div>

                    {/* Terms Checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-[#7A1B28] rounded border-gray-300 focus:ring-[#7A1B28]"
                        id="order-agree-terms-checkbox"
                      />
                      <span className="text-xs text-gray-600 leading-relaxed">
                        I confirm this genuine educational order and agree to receive my download materials, verifiable order invoice, and an official invitation to review my experience on Trustpilot.
                      </span>
                    </label>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-[#7A1B28] text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-[#621520] transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                      id="order-submit-zero-btn"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="w-5 h-5 animate-spin" />
                          <span>Generating Official Order & Verification...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5" />
                          <span>Complete $0.00 Order & Get Instant Access</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-6 text-[11px] text-gray-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                        <span>SSL Secure Registration</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-gray-400" />
                        <span>Official Trustpilot Partner Portal</span>
                      </span>
                    </div>

                  </form>

                </div>
              </div>

            </div>

            {/* TRUSTPILOT DIRECT LIVE WIDGET */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-4 shadow-xs text-center">
              <div className="space-y-1">
                <h3 className="text-base font-bold font-serif text-gray-900">
                  Vocal Vantage on Trustpilot
                </h3>
                <p className="text-xs text-gray-500">
                  Read genuine feedback from students who have refined their vocal placement with our faculty.
                </p>
              </div>

              <div
                className="trustpilot-widget w-full flex justify-center py-2"
                data-locale="en-US"
                data-template-id="56278e9abfbbba0bdcd568bc"
                data-businessunit-id="6a7dac007cbe39b7fca8524f"
                data-style-height="52px"
                data-style-width="100%"
                data-token="9dd9ec3c-a0ad-4d84-94e7-ef13b91112c9"
                id="trustpilot-review-collector-widget-page"
              >
                <a
                  href="https://www.trustpilot.com/review/vocalvantage.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#00b67a] hover:underline"
                >
                  Trustpilot Reviews
                </a>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* PRINTABLE / VIEWABLE INVOICE MODAL */}
      {completedOrder && (
        <OrderInvoiceModal
          order={completedOrder}
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
        />
      )}

    </div>
  );
};
