import React, { useRef, useState } from 'react';
import {
  FileUp,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';
import {
  ExtractionProgress,
  PageExtractionMetadata,
  SlipConfig,
  VoterRecord,
} from '../types';
import {
  extractPdfPageText,
  fileToImageDataUrl,
  LoadedPdfInfo,
  loadPdfFile,
  renderPdfPageToDataUrl,
} from '../utils/pdfProcessor';

interface UploadOcrViewProps {
  votersCount: number;
  config: SlipConfig;
  onAddExtractedVoters: (
    newVoters: VoterRecord[],
    metadata?: PageExtractionMetadata,
    replaceExisting?: boolean
  ) => void;
  onLoadSampleData: () => void;
  onNavigateToRecords: () => void;
  onNavigateToPreview: () => void;
}

export const UploadOcrView: React.FC<UploadOcrViewProps> = ({
  votersCount,
  onAddExtractedVoters,
  onLoadSampleData,
  onNavigateToRecords,
  onNavigateToPreview,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<boolean>(false);

  const [isDragging, setIsDragging] = useState(false);
  const [loadedPdf, setLoadedPdf] = useState<LoadedPdfInfo | null>(null);
  const [loadedImage, setLoadedImage] = useState<{
    dataUrl: string;
    fileName: string;
    sizeBytes: number;
  } | null>(null);

  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [applyPageMetadata, setApplyPageMetadata] = useState(true);

  const [progress, setProgress] = useState<ExtractionProgress>({
    status: 'idle',
    currentPage: 0,
    totalPages: 0,
    extractedCount: 0,
  });

  const handleFileSelection = async (file: File) => {
    setProgress({ status: 'idle', currentPage: 0, totalPages: 0, extractedCount: 0 });
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      setProgress({
        status: 'error',
        currentPage: 0,
        totalPages: 0,
        extractedCount: 0,
        errorMessage: 'कृपया Voter List PDF (.pdf) या स्कैन पेज इमेज (.png, .jpg) अपलोड करें।',
      });
      return;
    }

    try {
      if (isPdf) {
        setLoadedImage(null);
        setProgress({
          status: 'reading-pdf',
          currentPage: 0,
          totalPages: 0,
          extractedCount: 0,
        });
        const info = await loadPdfFile(file);
        setLoadedPdf(info);
        setStartPage(1);
        setEndPage(info.numPages);
        setProgress({
          status: 'idle',
          currentPage: 0,
          totalPages: info.numPages,
          extractedCount: 0,
        });
      } else {
        setLoadedPdf(null);
        const dataUrl = await fileToImageDataUrl(file);
        setLoadedImage({
          dataUrl,
          fileName: file.name,
          sizeBytes: file.size,
        });
        setProgress({
          status: 'idle',
          currentPage: 0,
          totalPages: 1,
          extractedCount: 0,
        });
      }
    } catch (err) {
      setProgress({
        status: 'error',
        currentPage: 0,
        totalPages: 0,
        extractedCount: 0,
        errorMessage:
          err instanceof Error
            ? err.message
            : 'PDF पढ़ने में त्रुटि हुई। कृपया फ़ाइल जांचें।',
      });
    }
  };

  const normalizeGender = (raw?: string): 'पुरुष' | 'महिला' | 'अन्य' => {
    const val = (raw || '').trim().toLowerCase();
    if (
      val.includes('महिला') ||
      val.includes('स्त्री') ||
      val === 'f' ||
      val.includes('female') ||
      val === 'म'
    ) {
      return 'महिला';
    }
    if (val.includes('अन्य') || val.includes('other') || val === 'o' || val === 't') {
      return 'अन्य';
    }
    return 'पुरुष';
  };

  const normalizeRelation = (
    raw?: string
  ): 'father' | 'husband' | 'mother' | 'other' => {
    const val = (raw || '').trim().toLowerCase();
    if (val.includes('husband') || val.includes('पति') || val === 'w/o' || val === 'h/o') {
      return 'husband';
    }
    if (val.includes('mother') || val.includes('माता') || val === 'm/o') {
      return 'mother';
    }
    if (val.includes('other') || val.includes('अन्य')) {
      return 'other';
    }
    return 'father';
  };

  const mapServerVoters = (
    rawVoters: Array<Record<string, string>>,
    meta: PageExtractionMetadata,
    pageNum: number
  ): VoterRecord[] => {
    return rawVoters.map((v, idx) => ({
      id: `ocr-${Date.now()}-${pageNum}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      selected: true,
      serialNo: (v.serialNo || '').toString().trim(),
      name: (v.name || '').toString().trim(),
      fatherOrHusbandName: (v.fatherOrHusbandName || '').toString().trim(),
      relationType: normalizeRelation(v.relationType),
      epic: (v.epic || '').toString().trim().toUpperCase(),
      houseNo: (v.houseNo || '').toString().trim(),
      age: (v.age || '').toString().trim(),
      gender: normalizeGender(v.gender),
      address: (v.address || meta.defaultAddress || '').toString().trim(),
      wardNo: (v.wardNo || meta.wardNo || '').toString().trim(),
      partNo: (v.partNo || meta.partNo || '').toString().trim(),
    }));
  };

  const runExtraction = async () => {
    abortRef.current = false;

    if (loadedImage) {
      setProgress({
        status: 'processing',
        currentPage: 1,
        totalPages: 1,
        extractedCount: 0,
      });

      try {
        const res = await fetch('/api/extract-voters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: loadedImage.dataUrl,
            mimeType: loadedImage.dataUrl.startsWith('data:image/png')
              ? 'image/png'
              : 'image/jpeg',
            pageNumber: 1,
            totalPages: 1,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'OCR request failed.');
        }

        const mapped = mapServerVoters(data.voters || [], data.pageMetadata || {}, 1);
        onAddExtractedVoters(
          mapped,
          applyPageMetadata ? data.pageMetadata : undefined,
          replaceExisting
        );
        setProgress({
          status: 'done',
          currentPage: 1,
          totalPages: 1,
          extractedCount: mapped.length,
        });
      } catch (err) {
        setProgress({
          status: 'error',
          currentPage: 1,
          totalPages: 1,
          extractedCount: 0,
          errorMessage: err instanceof Error ? err.message : 'OCR त्रुटि हुई।',
        });
      }
      return;
    }

    if (!loadedPdf) return;

    const safeStart = Math.max(1, Math.min(startPage, loadedPdf.numPages));
    const safeEnd = Math.max(safeStart, Math.min(endPage, loadedPdf.numPages));
    const totalToProcess = safeEnd - safeStart + 1;

    let runningCount = 0;
    let firstReplace = replaceExisting;

    for (let pageNum = safeStart; pageNum <= safeEnd; pageNum++) {
      if (abortRef.current) {
        setProgress({
          status: 'done',
          currentPage: pageNum - safeStart,
          totalPages: totalToProcess,
          extractedCount: runningCount,
        });
        return;
      }

      setProgress({
        status: 'processing',
        currentPage: pageNum - safeStart + 1,
        totalPages: totalToProcess,
        extractedCount: runningCount,
      });

      try {
        const [imageDataUrl, textLayer] = await Promise.all([
          renderPdfPageToDataUrl(loadedPdf.doc, pageNum, 2.0),
          extractPdfPageText(loadedPdf.doc, pageNum),
        ]);

        const res = await fetch('/api/extract-voters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: imageDataUrl,
            mimeType: 'image/jpeg',
            extractedText: textLayer,
            pageNumber: pageNum,
            totalPages: loadedPdf.numPages,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Page ${pageNum} extraction failed.`);
        }

        const mapped = mapServerVoters(
          data.voters || [],
          data.pageMetadata || {},
          pageNum
        );
        runningCount += mapped.length;
        onAddExtractedVoters(
          mapped,
          applyPageMetadata ? data.pageMetadata : undefined,
          firstReplace
        );
        firstReplace = false;
      } catch (err) {
        setProgress({
          status: 'error',
          currentPage: pageNum - safeStart + 1,
          totalPages: totalToProcess,
          extractedCount: runningCount,
          errorMessage:
            err instanceof Error
              ? `पेज ${pageNum}: ${err.message}`
              : `पेज ${pageNum} पर OCR त्रुटि हुई।`,
        });
        return;
      }
    }

    setProgress({
      status: 'done',
      currentPage: totalToProcess,
      totalPages: totalToProcess,
      extractedCount: runningCount,
    });
  };

  const clearSelectedFile = () => {
    abortRef.current = true;
    setLoadedPdf(null);
    setLoadedImage(null);
    setProgress({ status: 'idle', currentPage: 0, totalPages: 0, extractedCount: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Upload Dropzone & Page Range */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Voter List PDF अपलोड व Hindi + English OCR
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  डिजिटल या स्कैन की गई मतदाता सूची PDF अपलोड करें। सिस्टम नाम, पिता/पति का नाम, EPIC, मकान नं., आयु और लिंग स्वतः निकालेगा।
                </p>
              </div>
              {votersCount > 0 ? (
                <span className="shrink-0 text-xs font-medium text-slate-600 tabular-nums">
                  {votersCount} रिकॉर्ड लोड हैं
                </span>
              ) : null}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf,image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelection(file);
              }}
            />

            {!loadedPdf && !loadedImage ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileSelection(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    fileInputRef.current?.click();
                  }
                }}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-600 bg-blue-50/60'
                    : 'border-slate-300 bg-slate-50/70 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-700">
                  <FileUp className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  Voter List PDF या स्कैन पेज यहाँ ड्रॉप करें या ब्राउज़ करें
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  सपोर्टेड फ़ॉर्मेट: PDF (.pdf) · PNG / JPG स्कैन पृष्ठ · Hindi Devanagari + English OCR
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-4 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0"
                >
                  PDF / इमेज चुनें
                </button>
              </div>
            ) : (
              <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-blue-700">
                      {loadedPdf ? (
                        <FileText className="h-5 w-5" />
                      ) : (
                        <ImageIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {loadedPdf ? loadedPdf.fileName : loadedImage?.fileName}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-600 tabular-nums">
                        {loadedPdf
                          ? `${loadedPdf.numPages} पृष्ठ · ${(
                              loadedPdf.fileSizeBytes /
                              (1024 * 1024)
                            ).toFixed(2)} MB`
                          : `स्कैन इमेज · ${((loadedImage?.sizeBytes || 0) / 1024).toFixed(
                              0
                            )} KB`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    disabled={progress.status === 'processing'}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 whitespace-nowrap shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                    हटाएं
                  </button>
                </div>

                {/* Page Range & Extraction Options */}
                {loadedPdf ? (
                  <div className="grid grid-cols-1 gap-3 border-t border-slate-200 pt-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700">
                        शुरुआती पृष्ठ (From Page)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={loadedPdf.numPages}
                        value={startPage}
                        onChange={(e) => setStartPage(Number(e.target.value) || 1)}
                        disabled={progress.status === 'processing'}
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 tabular-nums focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700">
                        अंतिम पृष्ठ (To Page)
                      </label>
                      <input
                        type="number"
                        min={startPage}
                        max={loadedPdf.numPages}
                        value={endPage}
                        onChange={(e) =>
                          setEndPage(Number(e.target.value) || loadedPdf.numPages)
                        }
                        disabled={progress.status === 'processing'}
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 tabular-nums focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-200 pt-3 text-xs text-slate-700">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={replaceExisting}
                      onChange={(e) => setReplaceExisting(e.target.checked)}
                      disabled={progress.status === 'processing'}
                      className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                    />
                    <span>मौजूदा मतदाता सूची बदलें (नहीं तो जोड़ें)</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={applyPageMetadata}
                      onChange={(e) => setApplyPageMetadata(e.target.checked)}
                      disabled={progress.status === 'processing'}
                      className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                    />
                    <span>PDF हेडर से पंचायत/वार्ड/केंद्र स्वतः भरें</span>
                  </label>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
                  {progress.status === 'processing' ? (
                    <div className="flex flex-1 items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="tabular-nums">
                          Hindi + English OCR चल रहा है: पृष्ठ {progress.currentPage} /{' '}
                          {progress.totalPages} ({progress.extractedCount} मतदाता मिले)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          abortRef.current = true;
                        }}
                        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap shrink-0"
                      >
                        रोकें
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs text-slate-500">
                        स्कैन किए गए पृष्ठों के लिए उच्च-सटीकता देवनागरी + EPIC OCR सक्षम है
                      </span>
                      <button
                        type="button"
                        onClick={runExtraction}
                        className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>मतदाता जानकारी निकालें (Start OCR)</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Status / Result Alerts */}
            {progress.status === 'reading-pdf' ? (
              <div className="mt-4 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <Loader2 className="h-4 w-4 animate-spin text-blue-700" />
                <span>PDF फ़ाइल पढ़ी जा रही है...</span>
              </div>
            ) : null}

            {progress.status === 'error' && progress.errorMessage ? (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <span>{progress.errorMessage}</span>
              </div>
            ) : null}

            {progress.status === 'done' ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
                  <span className="tabular-nums">
                    OCR पूर्ण: {progress.extractedCount} मतदाता रिकॉर्ड सफलतापूर्वक निकाले गए।
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onNavigateToRecords}
                    className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 whitespace-nowrap shrink-0"
                  >
                    रिकॉर्ड देखें / एडिट करें
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={onNavigateToPreview}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 whitespace-nowrap shrink-0"
                  >
                    2-कॉलम स्लिप प्रीव्यू
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Quick Demo Loader Card */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-6 py-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                तुरंत टेस्ट करने के लिए सैंपल मतदाता सूची लोड करें
              </h3>
              <p className="mt-0.5 text-xs text-slate-600">
                बिना PDF अपलोड किए 10 मतदाताओं का उदाहरण डेटा लोड करें और 2-कॉलम स्लिप लेआउट व एडिटिंग जांचें।
              </p>
            </div>
            <button
              type="button"
              onClick={onLoadSampleData}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              सैंपल डेटा लोड करें (10 मतदाता)
            </button>
          </div>
        </div>

        {/* Right: First Page Preview or Extraction Guide */}
        <div className="lg:col-span-5">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-900">
              {loadedPdf || loadedImage
                ? 'चयनित फ़ाइल प्रीव्यू (Page 1)'
                : 'ऑटो-स्लिप वर्कफ़्लो'}
            </h3>
            {loadedPdf || loadedImage ? (
              <div className="mt-3 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                <img
                  src={loadedPdf ? loadedPdf.previewDataUrl : loadedImage?.dataUrl}
                  alt="Uploaded Voter List Page 1 Preview"
                  referrerPolicy="no-referrer"
                  className="max-h-[460px] w-full object-contain bg-white"
                />
              </div>
            ) : (
              <ol className="mt-4 space-y-4 text-sm text-slate-700">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 tabular-nums">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">
                      Voter List PDF या स्कैन पेज अपलोड करें
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      अंतिम मतदाता सूची (ECI / राज्य निर्वाचन आयोग / ग्राम पंचायत PDF) के डिजिटल और स्कैन दोनों पृष्ठ सपोर्टेड हैं।
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 tabular-nums">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">
                      Hindi + English OCR से डेटा एक्सट्रैक्ट
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      प्रत्येक मतदाता का नाम, पिता/पति का नाम, EPIC नंबर, मकान नं., आयु, लिंग, वार्ड और भाग संख्या निकाली जाती है।
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 tabular-nums">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">
                      रिकॉर्ड एडिट व मतदान केंद्र सेट करें
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      किसी भी मतदाता की स्पेलिंग/विवरण सुधारें और मतदान केंद्र, कमरा नंबर, दिनांक व समय एक जगह सेट करें।
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 tabular-nums">
                    4
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">
                      2-कॉलम A4 पर्ची प्रिंट व Save as PDF
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      हर A4 पेज पर 2 कॉलम में 10 सटीक पर्चियां तैयार होती हैं जिन्हें सीधे प्रिंट या PDF में सेव किया जा सकता है।
                    </p>
                  </div>
                </li>
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
