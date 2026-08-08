import React, { useState } from 'react';
import { ContactInfo, AccentType } from '../types';
import { Mail, Phone, Instagram, Send, CheckCircle2, Edit3, Save, X } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    interestedIn: selectedCoursePref || ('American Accent' as AccentType),
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editableInfo, setEditableInfo] = useState<ContactInfo>(contactInfo);

  // Sync selected course preference if updated from prop
  React.useEffect(() => {
    if (selectedCoursePref) {
      setFormData((prev) => ({ ...prev, interestedIn: selectedCoursePref }));
    }
  }, [selectedCoursePref]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const saveContactEdit = () => {
    if (onUpdateContactInfo) {
      onUpdateContactInfo(editableInfo);
    }
    setIsEditingContact(false);
  };

  return (
    <section id="contact" className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: Contact Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-[#7A1B28]">
                Get In Touch
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 tracking-tight">
                Contact Vocal Vantage
              </h2>
              <p className="text-gray-600 font-light text-base">
                Have questions about our American or British accent programs? Speak with our admissions advisors today.
              </p>
            </div>

            {/* Editable Contact Info Container */}
            <div className="bg-gray-50/80 rounded-xl p-6 sm:p-8 border border-gray-200/80 space-y-6 relative">
              
              <div className="flex justify-between items-center border-b border-gray-200/60 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Direct Contact Details
                </span>
                {onUpdateContactInfo && !isEditingContact && (
                  <button
                    onClick={() => setIsEditingContact(true)}
                    className="text-xs font-medium text-gray-500 hover:text-[#7A1B28] inline-flex items-center gap-1"
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
                      className="px-3.5 py-1.5 bg-[#7A1B28] text-white rounded-md font-semibold text-xs inline-flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditableInfo(contactInfo);
                        setIsEditingContact(false);
                      }}
                      className="px-3.5 py-1.5 bg-gray-200 text-gray-700 rounded-md font-semibold text-xs inline-flex items-center gap-1"
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
          </div>

          {/* RIGHT COLUMN: Simple Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 p-8 sm:p-10 shadow-xs">
            {submitted ? (
              <div className="py-12 text-center space-y-4" id="contact-success-msg">
                <div className="inline-flex p-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-serif text-gray-900">
                  Query Submitted
                </h3>
                <p className="text-gray-600 font-medium text-base max-w-md mx-auto leading-relaxed">
                  Thank you for contacting Vocal Vantage. Our team will be with you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" id="vocal-vantage-contact-form">
                <div>
                  <h3 className="text-xl font-bold font-serif text-gray-900 mb-1">
                    Send an Inquiry
                  </h3>
                  <p className="text-xs text-gray-500">
                    Fill in your details below and an instructor will reply within 24 hours.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7A1B28]/20 focus:border-[#7A1B28]"
                      id="input-full-name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7A1B28]/20 focus:border-[#7A1B28]"
                      id="input-email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Phone / WhatsApp */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7A1B28]/20 focus:border-[#7A1B28]"
                      id="input-phone"
                    />
                  </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Interested In Accent */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                      Interested Accent *
                    </label>
                    <select
                      value={formData.interestedIn}
                      onChange={(e) => setFormData({ ...formData, interestedIn: e.target.value as AccentType })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7A1B28]/20 focus:border-[#7A1B28] bg-white"
                      id="select-interested-in"
                    >
                      <option value="American Accent">American Accent</option>
                      <option value="British Accent">British Accent</option>
                    </select>
                  </div>

                  {/* Preferred Session Format */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                      Preferred Session Format *
                    </label>
                    <select
                      defaultValue="Both Options (Group & 1-on-1)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7A1B28]/20 focus:border-[#7A1B28] bg-white"
                      id="select-session-format"
                    >
                      <option value="Group Session">Group Session</option>
                      <option value="One-on-One Session">One-on-One Session (1-on-1)</option>
                      <option value="Both Options (Group & 1-on-1)">Both Options (Group & 1-on-1)</option>
                    </select>
                  </div>
                </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your current communication goals or speaking requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7A1B28]/20 focus:border-[#7A1B28]"
                    id="input-message"
                  />
                </div>

                {/* Submit Query Button */}
                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-[#7A1B28] text-white font-semibold text-base uppercase tracking-wider rounded-md hover:bg-[#621520] transition-colors shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer"
                  id="btn-submit-query"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Query</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
