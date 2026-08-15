import React, { useState, useEffect } from 'react';
import { ContactInfo, AccentType } from '../types';
import { Mail, Phone, Instagram, Edit3, Save, X, ExternalLink, Clock, ShieldCheck, Sparkles, MessageSquare } from 'lucide-react';

interface ContactSectionProps {
  contactInfo: ContactInfo;
  onUpdateContactInfo?: (info: ContactInfo) => void;
  selectedCoursePref?: AccentType;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  contactInfo,
  onUpdateContactInfo,
  selectedCoursePref,
}) => {
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editableInfo, setEditableInfo] = useState<ContactInfo>(contactInfo);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Dynamically load Tally embed script for seamless responsive height adjustments
  useEffect(() => {
    const scriptSrc = 'https://tally.so/widgets/embed.js';
    let script = document.querySelector(`script[src="${scriptSrc}"]`) as HTMLScriptElement | null;
    
    if (!script) {
      script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      script.onload = () => {
        if ((window as any).Tally) {
          (window as any).Tally.loadEmbeds();
        }
      };
      document.body.appendChild(script);
    } else if ((window as any).Tally) {
      (window as any).Tally.loadEmbeds();
    }
  }, []);

  const saveContactEdit = () => {
    if (onUpdateContactInfo) {
      onUpdateContactInfo(editableInfo);
    }
    setIsEditingContact(false);
  };

  const tallyEmbedUrl = 'https://tally.so/embed/7ROWlL?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1';
  const tallyDirectUrl = 'https://tally.so/r/7ROWlL';

  return (
    <section id="contact" className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: Contact Details & Fast-Track Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7A1B28]/10 text-[#7A1B28] text-xs font-semibold uppercase tracking-wider">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Get In Touch</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 tracking-tight">
                Contact Vocal Vantage
              </h2>
              <p className="text-gray-600 font-light text-base leading-relaxed">
                Have questions regarding our American or British Accent Mastery programs? Speak with our admissions advisors today.
              </p>
            </div>

            {/* Editable Contact Info Container */}
            <div className="bg-gray-50/80 rounded-xl p-6 sm:p-8 border border-gray-200/80 space-y-6 relative">
              
              <div className="flex justify-between items-center border-b border-gray-200/60 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Direct Contact Channels
                </span>
                {onUpdateContactInfo && !isEditingContact && (
                  <button
                    onClick={() => setIsEditingContact(true)}
                    className="text-xs font-medium text-gray-500 hover:text-[#7A1B28] inline-flex items-center gap-1 cursor-pointer"
                    title="Edit Contact Info"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Info</span>
                  </button>
                )}
              </div>

              {isEditingContact ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editableInfo.email}
                      onChange={(e) => setEditableInfo({ ...editableInfo, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Phone / WhatsApp</label>
                    <input
                      type="text"
                      value={editableInfo.phoneWhatsapp}
                      onChange={(e) => setEditableInfo({ ...editableInfo, phoneWhatsapp: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Instagram Handle</label>
                    <input
                      type="text"
                      value={editableInfo.instagramHandle}
                      onChange={(e) =>
                        setEditableInfo({
                          ...editableInfo,
                          instagramHandle: e.target.value,
                          instagramUrl: `https://instagram.com/${e.target.value.replace('@', '')}`,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={saveContactEdit}
                      className="px-3.5 py-1.5 bg-[#7A1B28] text-white rounded-md font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditableInfo(contactInfo);
                        setIsEditingContact(false);
                      }}
                      className="px-3.5 py-1.5 bg-gray-200 text-gray-700 rounded-md font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-md bg-white text-[#7A1B28] border border-gray-200/80 shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Email</p>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="text-base font-semibold text-gray-900 hover:text-[#7A1B28] transition-colors"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>

                  {/* Phone / WhatsApp */}
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-md bg-white text-[#7A1B28] border border-gray-200/80 shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Phone / WhatsApp</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        {contactInfo.phoneWhatsapp.split('/').map((numStr, index) => {
                          const cleanNum = numStr.replace(/[^0-9]/g, '');
                          const trimmed = numStr.trim();
                          return (
                            <React.Fragment key={index}>
                              {index > 0 && <span className="text-gray-300 hidden sm:inline">|</span>}
                              <a
                                href={`https://wa.me/${cleanNum}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm sm:text-base font-semibold text-gray-900 hover:text-[#7A1B28] transition-colors"
                              >
                                {trimmed}
                              </a>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Instagram Only */}
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-md bg-white text-[#7A1B28] border border-gray-200/80 shrink-0">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Instagram</p>
                      <a
                        href={contactInfo.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-base font-semibold text-gray-900 hover:text-[#7A1B28] transition-colors"
                      >
                        {contactInfo.instagramHandle}
                      </a>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Fast Track Inquiries Assurance Card */}
            <div className="p-6 rounded-xl bg-[#7A1B28]/5 border border-[#7A1B28]/15 space-y-4">
              <div className="flex items-center gap-2 text-[#7A1B28]">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">What Happens After You Inquire</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-gray-700">
                <li className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#7A1B28] shrink-0 mt-0.5" />
                  <span><strong>Fast 24-Hour Review:</strong> Our admissions team reviews your goals within one business day.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#7A1B28] shrink-0 mt-0.5" />
                  <span><strong>Personalized Assessment:</strong> We recommend either the 1-on-1 VIP track or small-group cohort based on your speaking profile.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* RIGHT COLUMN: Official Tally Inquiry Form Embed */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Header with Direct External Link Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                    Official Admissions Form
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-gray-900">
                  Send an Inquiry / Application
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Complete the questionnaire below or open the full form directly.
                </p>
              </div>

              <a
                href={tallyDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#7A1B28] text-white text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-[#621520] transition-colors shadow-xs shrink-0 cursor-pointer"
                id="tally-direct-link-btn"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Embedded Tally Container */}
            <div className="relative min-h-[580px] sm:min-h-[640px] w-full rounded-lg overflow-hidden bg-gray-50/50 border border-gray-100">
              
              {!iframeLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-400 gap-3">
                  <div className="w-8 h-8 border-2 border-[#7A1B28] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-medium text-gray-500">Loading Vocal Vantage Inquiry Form...</p>
                </div>
              )}

              <iframe
                data-tally-src={tallyEmbedUrl}
                src={tallyEmbedUrl}
                loading="lazy"
                width="100%"
                height="620"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                title="Vocal Vantage Inquiry Form"
                className="w-full min-h-[580px] sm:min-h-[640px] border-0"
                id="tally-inquiry-iframe"
                onLoad={() => setIframeLoaded(true)}
              />
            </div>

            {/* Fallback Direct Link Bar */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-2 border-t border-gray-100">
              <span className="text-[11px] text-gray-400">
                Powered by Vocal Vantage Admissions Portal
              </span>
              <a
                href={tallyDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7A1B28] hover:underline inline-flex items-center gap-1 font-medium text-[11px]"
              >
                <span>Having trouble viewing the form? Click here to open Tally directly</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
