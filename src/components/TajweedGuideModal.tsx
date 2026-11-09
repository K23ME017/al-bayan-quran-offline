import React from 'react';
import { TAJWEED_RULES } from '../utils/tajweed';
import { BookOpen, X, Volume2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TajweedGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/20 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-cinzel text-emerald-400">
                Tajweed Rules & Color Coding Guide
              </h2>
              <p className="text-xs text-slate-400">
                Interactive guide to reciting the Holy Quran with precise phonetics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rules List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Tajweed represents the set of pronunciation rules governing how the Quran should be recited with proper rhythm, articulation points (Makharij), and melodic characteristics. Use this key to understand the highlighted letters in the text:
          </p>

          <div className="space-y-3">
            {TAJWEED_RULES.map((rule) => (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border ${rule.bgClass} ${rule.borderClass} transition-all`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${rule.id === 'ghunnah' ? 'bg-emerald-400' : rule.id === 'qalqalah' ? 'bg-rose-400' : rule.id === 'ikhfa' ? 'bg-amber-400' : rule.id === 'idgham' ? 'bg-sky-400' : rule.id === 'madd' ? 'bg-purple-400' : 'bg-teal-400'}`} />
                    <h3 className={`text-sm font-bold ${rule.colorClass}`}>
                      {rule.name}
                    </h3>
                  </div>
                  <span className="font-amiri text-lg font-bold text-slate-300">
                    {rule.arabicName}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                  {rule.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-700/50">
                  <div>
                    <span className="text-slate-400">Governing Letters:</span>{' '}
                    <span className="font-amiri font-semibold text-slate-200">{rule.letters}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Example:</span>{' '}
                    <span className="font-amiri font-semibold text-emerald-300">{rule.example}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
