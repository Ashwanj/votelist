import React, { useMemo, useState } from 'react';
import {
  Printer,
  FileDown,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { SlipConfig, VoterRecord } from '../types';
import { VoterSlipCard } from './VoterSlipCard';

interface SlipPreviewViewProps {
  voters: VoterRecord[];
  config: SlipConfig;
  onPrint: () => void;
  onNavigateToSettings: () => void;
  onNavigateToRecords: () => void;
}

export const SlipPreviewView: React.FC<SlipPreviewViewProps> = ({
  voters,
  config,
  onPrint,
  onNavigateToSettings,
  onNavigateToRecords,
}) => {
  const [zoomScale, setZoomScale] = useState<'fit' | 'actual'>('fit');
  const [activePageIndex, setActivePageIndex] = useState<number | 'all'>('all');

  const selectedVoters = useMemo(
    () => voters.filter((v) => v.selected),
    [voters]
  );

  const pages = useMemo(() => {
    const chunkSize = config.slipsPerPage;
    const chunks: VoterRecord[][] = [];
    for (let i = 0; i < selectedVoters.length; i += chunkSize) {
      chunks.push(selectedVoters.slice(i, i + chunkSize));
    }
    return chunks;
  }, [selectedVoters, config.slipsPerPage]);

  const visiblePages = useMemo(() => {
    if (activePageIndex === 'all') {
      return pages.map((items, idx) => ({ items, pageNumber: idx + 1 }));
    }
    const target = pages[activePageIndex];
    return target ? [{ items: target, pageNumber: activePageIndex + 1 }] : [];
  }, [pages, activePageIndex]);

  if (selectedVoters.length === 0) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
          <Users className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">
          प्रिंट के लिए कोई मतदाता चयनित नहीं है
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
          Voter List अपलोड करें या मतदाता सूची टैब से कम से कम एक मतदाता चुनें।
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onNavigateToRecords}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
          >
            मतदाता सूची खोलें
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
          <span className="font-semibold text-slate-900 tabular-nums">
            {selectedVoters.length} चयनित मतदाता
          </span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span className="tabular-nums">
            {pages.length} A4 पृष्ठ (2 कॉलम × {config.slipsPerPage / 2} पंक्तियाँ)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Page Filter */}
          {pages.length > 1 ? (
            <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs">
              <button
                type="button"
                onClick={() =>
                  setActivePageIndex((prev) =>
                    prev === 'all' ? 0 : Math.max(0, prev - 1)
                  )
                }
                className="rounded p-1 text-slate-600 hover:bg-white hover:text-slate-900"
                title="पिछला पृष्ठ"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActivePageIndex('all')}
                className={`rounded px-2 py-1 font-medium whitespace-nowrap shrink-0 ${
                  activePageIndex === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                सभी पृष्ठ ({pages.length})
              </button>
              {activePageIndex !== 'all' ? (
                <span className="px-1.5 font-medium text-slate-800 tabular-nums">
                  पृष्ठ {activePageIndex + 1} / {pages.length}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() =>
                  setActivePageIndex((prev) =>
                    prev === 'all'
                      ? 0
                      : Math.min(pages.length - 1, prev + 1)
                  )
                }
                className="rounded p-1 text-slate-600 hover:bg-white hover:text-slate-900"
                title="अगला पृष्ठ"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setZoomScale((z) => (z === 'fit' ? 'actual' : 'fit'))}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            {zoomScale === 'fit' ? (
              <>
                <ZoomIn className="h-3.5 w-3.5" />
                100% A4
              </>
            ) : (
              <>
                <ZoomOut className="h-3.5 w-3.5" />
                फ़िट व्यू
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onNavigateToSettings}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            केंद्र / समय बदलें
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <FileDown className="h-3.5 w-3.5" />
            Save as PDF
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Slips
          </button>
        </div>
      </div>

      {/* Screen Preview Sheets */}
      <div className="space-y-8 overflow-x-auto pb-8">
        {visiblePages.map(({ items, pageNumber }) => (
          <div key={pageNumber} className="flex flex-col items-center">
            <div className="mb-2 flex w-full max-w-[210mm] items-center justify-between text-xs text-slate-500">
              <span className="tabular-nums">
                A4 Sheet {pageNumber} of {pages.length}
              </span>
              <span className="tabular-nums">{items.length} Slips</span>
            </div>
            <div
              className={`a4-sheet border border-slate-300 shadow-sm transition-transform origin-top ${
                zoomScale === 'fit' ? 'max-w-full scale-[0.95] sm:scale-100' : ''
              }`}
            >
              <div className="slip-grid">
                {items.map((voter) => (
                  <VoterSlipCard
                    key={voter.id}
                    voter={voter}
                    config={config}
                    compact={config.slipsPerPage === 10}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
