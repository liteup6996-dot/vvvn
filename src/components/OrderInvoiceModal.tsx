import React from 'react';
import { OrderRecord } from '../types';
import { LOGO_URL } from '../data';
import { Printer, CheckCircle2, ShieldCheck, X, FileText } from 'lucide-react';

interface OrderInvoiceModalProps {
  order: OrderRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-8 print:shadow-none print:border-none print:my-0 print:rounded-none"
        id="order-invoice-printable-container"
      >
        {/* Top Header Actions (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
            <FileText className="w-4 h-4 text-[#7A1B28]" />
            <span>Official Order Invoice & Proof of Purchase</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
              id="print-invoice-btn"
            >
              <Printer className="w-3.5 h-3.5 text-[#7A1B28]" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close Invoice"
              id="close-invoice-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* INVOICE BODY */}
        <div className="p-8 sm:p-10 space-y-8 bg-white text-gray-900">
          
          {/* Company Branding & Invoice Meta */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-gray-200 pb-8">
            <div className="space-y-2">
              <img
                src={LOGO_URL}
                alt="Vocal Vantage Logo"
                className="h-10 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <p className="text-xs text-gray-500 font-medium">
                Vocal Vantage Online Academy • vocalvantage.online
              </p>
              <p className="text-xs text-gray-500">
                Official Accent Training & Communication Excellence
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                PAID & VERIFIED (0.00 USD)
              </span>
              <p className="text-xl font-bold font-serif text-gray-900 tracking-tight">
                INVOICE #{order.orderNumber}
              </p>
              <p className="text-xs text-gray-500">
                Date: <strong className="text-gray-800">{formattedDate}</strong>
              </p>
            </div>
          </div>

          {/* Reference IDs & Trustpilot Verification Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Billed To (Customer):
              </span>
              <p className="font-bold text-gray-900 text-sm">{order.customerName}</p>
              <p className="text-gray-600">{order.customerEmail}</p>
              {order.customerPhone && <p className="text-gray-600">Phone: {order.customerPhone}</p>}
              <p className="text-gray-600">Region: {order.country || 'International'}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Trustpilot Verification Reference:
              </span>
              <p className="font-mono font-bold text-[#7A1B28] text-sm">{order.referenceId}</p>
              <p className="text-gray-600 mt-0.5">Order Status: <strong className="text-emerald-700 font-semibold">Completed & Recorded</strong></p>
              <p className="text-gray-500 text-[11px] mt-1">
                Merchant Domain: <strong>vocalvantage.online</strong>
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Item & Description</th>
                  <th className="py-3 px-4 text-center">SKU</th>
                  <th className="py-3 px-4 text-right">Qty</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                <tr>
                  <td className="py-4 px-4 font-medium">
                    <p className="font-bold text-gray-900">{order.productName}</p>
                    <p className="text-gray-500 text-[11px]">
                      Instant Digital Access • 42-Page Phonetic Guidebook + Audio Diagnostic Tracks + 1-on-1 Faculty Evaluation Invitation
                    </p>
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-gray-600">{order.sku}</td>
                  <td className="py-4 px-4 text-right">1</td>
                  <td className="py-4 px-4 text-right line-through text-gray-400">$49.00</td>
                  <td className="py-4 px-4 text-right font-semibold text-gray-900">$0.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pricing Calculation Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
            <div className="space-y-1 text-xs text-gray-600 max-w-sm">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Commercial Experience Guarantee</span>
              </div>
              <p className="text-[11px] text-gray-500">
                This official receipt confirms a legitimate order registered with Vocal Vantage Academy. Acceptable as primary proof of customer experience under Trustpilot User Guidelines.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>$49.00 USD</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Promo ({order.promoCode}):</span>
                <span>-$49.00 USD</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold text-gray-900">
                <span>Total Paid:</span>
                <span className="text-[#7A1B28]">$0.00 USD</span>
              </div>
            </div>
          </div>

          {/* Official Verification Stamp */}
          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-gray-900">Authentic Transaction Recorded</p>
                <p className="text-gray-500">
                  Trustpilot Automatic Feedback Service (AFS) Order ID: {order.referenceId}
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right text-[11px] text-gray-400">
              <p className="font-serif italic">Vocal Vantage Registrar & Accounting Office</p>
              <p>support@vocalvantage.online</p>
            </div>
          </div>

        </div>

        {/* Footer info (print view) */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center text-[10px] text-gray-400">
          This receipt is generated automatically by Vocal Vantage Academy for transaction record keeping and review compliance verification.
        </div>
      </div>
    </div>
  );
};
