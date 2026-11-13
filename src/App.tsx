import { useEffect, useMemo, useState } from 'react';
import { Printer, ArrowDown } from 'lucide-react';
import {
  DEFAULT_SLIP_CONFIG,
  PageExtractionMetadata,
  SAMPLE_VOTERS,
  SlipConfig,
  VoterRecord,
} from './types';
import { UploadOcrView } from './components/UploadOcrView';
import { VoterTableView } from './components/VoterTableView';
import { SlipSettingsView } from './components/SlipSettingsView';
import { SlipPreviewView } from './components/SlipPreviewView';
import { VoterSlipCard } from './components/VoterSlipCard';

const VOTERS_STORAGE_KEY = 'matdata_slip_voters_v1';
const CONFIG_STORAGE_KEY = 'matdata_slip_config_v1';

function loadInitialVoters(): VoterRecord[] {
  try {
    const raw = localStorage.getItem(VOTERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore malformed storage
  }
  return SAMPLE_VOTERS;
}

function loadInitialConfig(): SlipConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_SLIP_CONFIG, ...parsed };
      }
    }
  } catch {
    // Ignore malformed storage
  }
  return DEFAULT_SLIP_CONFIG;
}

function scrollToSection(sectionId: string) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export default function App() {
  const [voters, setVoters] = useState<VoterRecord[]>(loadInitialVoters);
  const [config, setConfig] = useState<SlipConfig>(loadInitialConfig);

  useEffect(() => {
    try {
      localStorage.setItem(VOTERS_STORAGE_KEY, JSON.stringify(voters));
    } catch {
      // Ignore storage quota errors
    }
  }, [voters]);

  useEffect(() => {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Ignore storage quota errors
    }
  }, [config]);

  const selectedVoters = useMemo(
    () => voters.filter((v) => v.selected),
    [voters]
  );

  const printPages = useMemo(() => {
    const chunkSize = config.slipsPerPage;
    const chunks: VoterRecord[][] = [];
    for (let i = 0; i < selectedVoters.length; i += chunkSize) {
      chunks.push(selectedVoters.slice(i, i + chunkSize));
    }
    return chunks;
  }, [selectedVoters, config.slipsPerPage]);

  const handleAddExtractedVoters = (
    newVoters: VoterRecord[],
    metadata?: PageExtractionMetadata,
    replaceExisting = false
  ) => {
    setVoters((prev) => (replaceExisting ? newVoters : [...prev, ...newVoters]));

    if (metadata) {
      setConfig((prev) => ({
        ...prev,
        panchayatSamiti: metadata.panchayatSamiti?.trim() || prev.panchayatSamiti,
        gramPanchayat: metadata.gramPanchayat?.trim() || prev.gramPanchayat,
        defaultWardNo: metadata.wardNo?.trim() || prev.defaultWardNo,
        defaultPartNo: metadata.partNo?.trim() || prev.defaultPartNo,
        pollingStation: metadata.pollingStation?.trim() || prev.pollingStation,
        roomNumber: metadata.roomNo?.trim() || prev.roomNumber,
      }));
    }
  };

  const handleLoadSampleData = () => {
    setVoters(SAMPLE_VOTERS);
    setConfig(DEFAULT_SLIP_CONFIG);
    scrollToSection('slip-preview');
  };

  const handleUpdateVoter = (updated: VoterRecord) => {
    setVoters((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  };

  const handleAddVoter = (newVoter: VoterRecord) => {
    setVoters((prev) => [...prev, newVoter]);
  };

  const handleDeleteVoter = (id: string) => {
    setVoters((prev) => prev.filter((v) => v.id !== id));
  };

  const handleToggleSelect = (id: string) => {
    setVoters((prev) =>
      prev.map((v) => (v.id === id ? { ...v, selected: !v.selected } : v))
    );
  };

  const handleSelectAllFiltered = (ids: string[], selected: boolean) => {
    const idSet = new Set(ids);
    setVoters((prev) =>
      prev.map((v) => (idSet.has(v.id) ? { ...v, selected } : v))
    );
  };

  const handleClearAll = () => {
    setVoters([]);
  };

  const handlePrint = () => {
    if (selectedVoters.length === 0) {
      scrollToSection('voter-list');
      return;
    }
    window.print();
  };

  return (
    <>
      <div className="no-print min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        {/* Top Web Navigation Bar */}
        <header className="md:sticky md:top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-3.5">
            {/* Zone 1: Brand Wordmark */}
            <a
              href="#top"
              className="font-display text-lg font-bold tracking-tight text-slate-950 whitespace-nowrap shrink-0"
            >
              Matdata Slip Studio
            </a>

            {/* Zone 2: Clean Anchor Navigation Links */}
            <nav
              aria-label="Page sections"
              className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
            >
              <a
                href="#upload"
                className="py-1 transition-colors hover:text-slate-950 whitespace-nowrap shrink-0"
              >
                PDF अपलोड
              </a>
              <a
                href="#booth-settings"
                className="py-1 transition-colors hover:text-slate-950 whitespace-nowrap shrink-0"
              >
                मतदान केंद्र
              </a>
              <a
                href="#voter-list"
                className="py-1 transition-colors hover:text-slate-950 whitespace-nowrap shrink-0"
              >
                मतदाता सूची
              </a>
              <a
                href="#slip-preview"
                className="py-1 transition-colors hover:text-slate-950 whitespace-nowrap shrink-0"
              >
                2-कॉलम पर्ची
              </a>
            </nav>

            {/* Zone 3: Primary CTA */}
            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Single-Page Website Content */}
        <main id="top" className="flex-1">
          {/* Hero Banner */}
          <section className="border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-6 py-10 lg:py-12">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <p className="text-xs font-medium text-slate-500">
                    Hindi + English Voter List OCR · 2-Column A4 Voter Slip Generator
                  </p>
                  <h1
                    style={{ fontSize: 'clamp(2rem, 3.6vw, 3rem)', textWrap: 'balance' }}
                    className="mt-2 font-display font-bold leading-[1.18] tracking-tight text-slate-950"
                  >
                    Voter List PDF से 2-कॉलम मतदाता पर्ची तुरंत तैयार करें
                  </h1>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
                    डिजिटल या स्कैन की गई मतदाता सूची PDF अपलोड करें, Hindi व English OCR से मतदाता जानकारी निकालें, विवरण एडिट करें, मतदान केंद्र व समय सेट करें और A4 शीट पर 2 कॉलम में प्रिंट या Save as PDF करें।
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <a
                      href="#upload"
                      className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0"
                    >
                      <span>PDF अपलोड करें</span>
                      <ArrowDown className="h-4 w-4" />
                    </a>
                    <a
                      href="#slip-preview"
                      className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
                    >
                      <span>2-कॉलम स्लिप देखें ({selectedVoters.length})</span>
                    </a>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="tabular-nums">{voters.length} मतदाता रिकॉर्ड</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{selectedVoters.length} चयनित</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {printPages.length} A4 शीट (प्रति पेज {config.slipsPerPage} पर्ची)
                    </span>
                  </div>
                </div>

                {/* Right: Live Mini Slip Showcase */}
                <div className="lg:col-span-5">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2.5 flex items-center justify-between text-xs text-slate-500">
                      <span>लाइव पर्ची फ़ॉर्मेट उदाहरण</span>
                      <span>2-कॉलम A4 प्रिंट लेआउट</span>
                    </div>
                    <VoterSlipCard
                      voter={selectedVoters[0] || SAMPLE_VOTERS[0]}
                      config={config}
                      compact={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 01: Upload PDF & Hindi + English OCR */}
          <section id="upload" className="border-b border-slate-200 py-10 px-4 sm:px-6">
            <div className="mx-auto max-w-7xl mb-5">
              <h2 className="font-display text-xl font-bold text-slate-950">
                01. Voter List PDF अपलोड व स्कैन OCR
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                PDF या स्कैन पेज से नाम, पिता/पति का नाम, EPIC नंबर, मकान नंबर, आयु और लिंग निकालें।
              </p>
            </div>
            <UploadOcrView
              votersCount={voters.length}
              config={config}
              onAddExtractedVoters={handleAddExtractedVoters}
              onLoadSampleData={handleLoadSampleData}
              onNavigateToRecords={() => scrollToSection('voter-list')}
              onNavigateToPreview={() => scrollToSection('slip-preview')}
            />
          </section>

          {/* Section 02: Polling Booth, Room, Date & Time Settings */}
          <section
            id="booth-settings"
            className="border-b border-slate-200 bg-white py-10 px-4 sm:px-6"
          >
            <div className="mx-auto max-w-7xl mb-5">
              <h2 className="font-display text-xl font-bold text-slate-950">
                02. मतदान केंद्र, कमरा नंबर, दिनांक व समय सेट करें
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                चुनाव शीर्षक, पंचायत/वार्ड विवरण, मतदान केंद्र, कमरा नंबर और मतदान तिथि-समय यहाँ से बदलें।
              </p>
            </div>
            <SlipSettingsView
              config={config}
              sampleVoter={selectedVoters[0] || voters[0]}
              onChangeConfig={setConfig}
              onNavigateToPreview={() => scrollToSection('slip-preview')}
            />
          </section>

          {/* Section 03: Editable Voter List Table */}
          <section id="voter-list" className="border-b border-slate-200 py-10 px-4 sm:px-6">
            <div className="mx-auto max-w-7xl mb-5">
              <h2 className="font-display text-xl font-bold text-slate-950">
                03. मतदाता सूची व रिकॉर्ड एडिट
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                किसी भी मतदाता की जानकारी एडिट करें, नया मतदाता जोड़ें या प्रिंट के लिए मतदाता चुनें।
              </p>
            </div>
            <VoterTableView
              voters={voters}
              config={config}
              onUpdateVoter={handleUpdateVoter}
              onAddVoter={handleAddVoter}
              onDeleteVoter={handleDeleteVoter}
              onToggleSelect={handleToggleSelect}
              onSelectAllFiltered={handleSelectAllFiltered}
              onClearAll={handleClearAll}
              onNavigateToUpload={() => scrollToSection('upload')}
              onNavigateToPreview={() => scrollToSection('slip-preview')}
            />
          </section>

          {/* Section 04: 2-Column A4 Voter Slip Sheet & Print / Save PDF */}
          <section
            id="slip-preview"
            className="bg-slate-100/70 py-10 px-4 sm:px-6"
          >
            <div className="mx-auto max-w-7xl mb-5">
              <h2 className="font-display text-xl font-bold text-slate-950">
                04. 2-कॉलम Voter Slip शीट — Print व Save as PDF
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                A4 पेपर पर 2 कॉलम में तैयार पर्चियाँ जांचें और सीधे प्रिंट या PDF के रूप में सेव करें।
              </p>
            </div>
            <SlipPreviewView
              voters={voters}
              config={config}
              onPrint={handlePrint}
              onNavigateToSettings={() => scrollToSection('booth-settings')}
              onNavigateToRecords={() => scrollToSection('voter-list')}
            />
          </section>
        </main>

        {/* Quiet Web Page Footer */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-slate-600">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display font-semibold text-slate-900">
                Matdata Slip Studio
              </span>
              <span aria-hidden="true">·</span>
              <span>
                प्रिंट टिप: ब्राउज़र प्रिंट डायलॉग में Paper Size: A4 और Destination: Save as PDF चुनें।
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <a href="#upload" className="hover:text-slate-950">
                PDF अपलोड
              </a>
              <a href="#booth-settings" className="hover:text-slate-950">
                मतदान केंद्र
              </a>
              <a href="#voter-list" className="hover:text-slate-950">
                मतदाता सूची
              </a>
              <a href="#slip-preview" className="hover:text-slate-950">
                2-कॉलम पर्ची
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Hidden Print-Only Container: Renders exact A4 2-column sheets when printing or saving as PDF */}
      <div className="print-only-container hidden">
        {printPages.map((pageVoters, pageIdx) => (
          <section key={pageIdx} className="a4-sheet">
            <div className="slip-grid">
              {pageVoters.map((voter) => (
                <VoterSlipCard
                  key={voter.id}
                  voter={voter}
                  config={config}
                  compact={config.slipsPerPage === 10}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
