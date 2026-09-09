/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  PhoneCall,
  ShieldCheck,
  HelpCircle,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface PharmacistHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const faqs = [
  {
    q: 'Are generic medicines really as effective as branded ones?',
    a: 'Yes. By law and international pharmaceutical standards (FDA, WHO-GMP, CDSCO), generic drugs must contain the exact same active pharmaceutical ingredient, strength, dosage form, and route of administration as their branded counterpart. They are bioequivalent and perform identically in the body.',
  },
  {
    q: 'Why are generic medicines up to 85% cheaper?',
    a: 'Original brand manufacturers spend hundreds of millions on initial patent research, clinical trials, and heavy marketing/advertising. Once their patent expires, generic manufacturers can produce the exact chemical molecule without incurring those sunk costs, passing the immense savings directly to patients.',
  },
  {
    q: 'Can a pharmacy substitute my brand with a generic automatically?',
    a: 'In most jurisdictions, pharmacists are authorized—and often encouraged—to substitute bioequivalent generic versions of the prescribed active salt, provided the doctor has not stamped "Dispense as Written (DAW)". Our clinical pharmacists verify every substitution.',
  },
  {
    q: 'How does temperature-controlled delivery work?',
    a: 'Sensitive medicines (including insulin, eye drops, or specific suspension antibiotics) are dispatched in insulated cold-chain medical pouches with gel packs to ensure safety and potency during transit.',
  },
];

export const PharmacistHelpModal: React.FC<PharmacistHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [userQuestion, setUserQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState<
    { sender: 'user' | 'pharmacist'; text: string; time: string }[]
  >([
    {
      sender: 'pharmacist',
      text: 'Hello! I am Dr. Emily Vance, Chief Pharmacist. How can I assist you today with generic medicine substitutions, active salt compositions, or delivery questions?',
      time: 'Just now',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;

    const currentQ = userQuestion.trim();
    setUserQuestion('');

    const newMsgs = [
      ...chatMessages,
      {
        sender: 'user' as const,
        text: currentQ,
        time: 'Just now',
      },
    ];
    setChatMessages(newMsgs);
    setIsTyping(true);

    setTimeout(() => {
      let reply =
        'Generic medications are rigorously tested for bioequivalence. The active salt molecule performs identically to the branded version with matching bioavailability.';

      const lower = currentQ.toLowerCase();
      if (lower.includes('lipitor') || lower.includes('atorvastatin') || lower.includes('cholesterol')) {
        reply =
          'Atorvastatin 20mg generic is 100% bioequivalent to Lipitor 20mg. Both inhibit HMG-CoA reductase equally to lower LDL cholesterol. You save over 84% per pack with identical clinical outcomes.';
      } else if (lower.includes('augmentin') || lower.includes('antibiotic') || lower.includes('amoxicillin')) {
        reply =
          'Amoxyclav 625mg contains the exact Amoxicillin (500mg) + Clavulanic Acid (125mg) formulation as Augmentin 625. Make sure to complete the entire course as prescribed.';
      } else if (lower.includes('delivery') || lower.includes('time') || lower.includes('fast')) {
        reply =
          'We offer Express Doorstep Delivery in 45-90 minutes for urgent prescriptions, and same-day evening delivery. All orders are packed in tamper-proof medical pouches.';
      }

      setChatMessages([
        ...newMsgs,
        {
          sender: 'pharmacist' as const,
          text: reply,
          time: 'Just now',
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-zinc-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-white border-2 border-emerald-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Ask a Licensed Pharmacist</h2>
              <p className="text-xs text-emerald-200">
                Dr. Emily Vance (Pharm.D) • Lic. #RPH-849204 • Available 24/7
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-700/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Live Chat with Pharmacist */}
          <div className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50/50 flex flex-col">
            <div className="p-3 bg-zinc-100 border-b border-zinc-200 font-bold text-zinc-800 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Direct Pharmacist Consultation Chat</span>
            </div>

            <div className="p-4 space-y-3 h-52 overflow-y-auto bg-white">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-700 text-white rounded-tr-xs'
                        : 'bg-zinc-100 text-zinc-900 rounded-tl-xs border border-zinc-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
              {isTyping && (
                <div className="text-[11px] text-zinc-400 italic">
                  Dr. Emily is reviewing and typing a response...
                </div>
              )}
            </div>

            <form onSubmit={handleSendQuestion} className="p-2 bg-zinc-50 border-t border-zinc-200 flex gap-2">
              <input
                type="text"
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder="Ask about side effects, generic equivalence, or dosages..."
                className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Frequently Asked Questions */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-600" /> Frequently Asked Questions About Generics
            </h3>

            <div className="space-y-2.5">
              {faqs.map((faq, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-zinc-200 bg-white space-y-1">
                  <h4 className="font-bold text-zinc-900">{faq.q}</h4>
                  <p className="text-zinc-600 text-[11px] leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
