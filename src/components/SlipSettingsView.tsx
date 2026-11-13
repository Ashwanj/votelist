import React from 'react';
import { RotateCcw, ArrowRight } from 'lucide-react';
import { DEFAULT_SLIP_CONFIG, SAMPLE_VOTERS, SlipConfig, VoterRecord } from '../types';
import { VoterSlipCard } from './VoterSlipCard';

interface SlipSettingsViewProps {
  config: SlipConfig;
  sampleVoter?: VoterRecord;
  onChangeConfig: (next: SlipConfig) => void;
  onNavigateToPreview: () => void;
}

export const SlipSettingsView: React.FC<SlipSettingsViewProps> = ({
  config,
  sampleVoter,
  onChangeConfig,
  onNavigateToPreview,
}) => {
  const previewVoter = sampleVoter || SAMPLE_VOTERS[0];

  const updateField = <K extends keyof SlipConfig>(key: K, value: SlipConfig[K]) => {
    onChangeConfig({ ...config, [key]: value });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Election & Polling Station Form */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                मतदान केंद्र, कमरा नंबर, दिनांक व समय सेटिंग्स
              </h2>
              <p className="mt-0.5 text-xs text-slate-600">
                यहाँ की गई सेटिंग्स सभी चयनित Voter Slips पर तुरंत लागू होती हैं।
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChangeConfig({ ...DEFAULT_SLIP_CONFIG })}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              डिफ़ॉल्ट रीसेट
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700">
                चुनाव शीर्षक (Slip Header Title)
              </label>
              <input
                type="text"
                value={config.electionTitle}
                onChange={(e) => updateField('electionTitle', e.target.value)}
                placeholder="सरपंच चुनाव 2026"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  बायां क्षेत्र लेबल (उदा. पंचायत समिति / विधानसभा)
                </label>
                <input
                  type="text"
                  value={config.panchayatSamitiLabel}
                  onChange={(e) => updateField('panchayatSamitiLabel', e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  पंचायत समिति / क्षेत्र नाम
                </label>
                <input
                  type="text"
                  value={config.panchayatSamiti}
                  onChange={(e) => updateField('panchayatSamiti', e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  दायां क्षेत्र लेबल (उदा. ग्राम पंचायत / वार्ड)
                </label>
                <input
                  type="text"
                  value={config.gramPanchayatLabel}
                  onChange={(e) => updateField('gramPanchayatLabel', e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  ग्राम पंचायत / नगर नाम
                </label>
                <input
                  type="text"
                  value={config.gramPanchayat}
                  onChange={(e) => updateField('gramPanchayat', e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  डिफ़ॉल्ट वार्ड नं.
                </label>
                <input
                  type="text"
                  value={config.defaultWardNo}
                  onChange={(e) => updateField('defaultWardNo', e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm tabular-nums focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  जि.प. (ZP No.)
                </label>
                <input
                  type="text"
                  value={config.zpNo}
                  onChange={(e) => updateField('zpNo', e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm tabular-nums focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  पं.स. (PS No.)
                </label>
                <input
                  type="text"
                  value={config.psNo}
                  onChange={(e) => updateField('psNo', e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm tabular-nums focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  भाग संख्या
                </label>
                <input
                  type="text"
                  value={config.defaultPartNo}
                  onChange={(e) => updateField('defaultPartNo', e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm tabular-nums focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <label className="block text-xs font-medium text-slate-700">
                मतदान केंद्र (Polling Station Name &amp; Number)
              </label>
              <input
                type="text"
                value={config.pollingStation}
                onChange={(e) => updateField('pollingStation', e.target.value)}
                placeholder="1 — GOVERNMENT SENIOR SECONDARY SCHOOL, MASINA"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  कमरा नंबर (Room Number)
                </label>
                <input
                  type="text"
                  value={config.roomNumber}
                  onChange={(e) => updateField('roomNumber', e.target.value)}
                  placeholder="ROOM NUMBER 3"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  मतदान दिनांक (Polling Date)
                </label>
                <input
                  type="text"
                  value={config.pollingDate}
                  onChange={(e) => updateField('pollingDate', e.target.value)}
                  placeholder="16-11-2026 (सोमवार)"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  मतदान समय (Polling Time)
                </label>
                <input
                  type="text"
                  value={config.pollingTime}
                  onChange={(e) => updateField('pollingTime', e.target.value)}
                  placeholder="सुबह 7:00 से शाम 6:00 बजे तक"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4">
              <div className="flex items-center gap-4">
                <div>
                  <span className="block text-xs font-medium text-slate-700">
                    प्रति A4 पेज पर्चियां (2 कॉलम)
                  </span>
                  <div className="mt-1 flex items-center gap-1 rounded-md bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => updateField('slipsPerPage', 10)}
                      className={`rounded px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        config.slipsPerPage === 10
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      10 पर्ची (2×5)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('slipsPerPage', 8)}
                      className={`rounded px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        config.slipsPerPage === 8
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      8 पर्ची (2×4)
                    </button>
                  </div>
                </div>

                <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={config.showFooterDateTime}
                    onChange={(e) =>
                      updateField('showFooterDateTime', e.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                  />
                  <span>दिनांक व समय फ़ुटर दिखाएं</span>
                </label>
              </div>

              <button
                type="button"
                onClick={onNavigateToPreview}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
              >
                <span>2-कॉलम शीट देखें</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Slip Preview */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 rounded-lg border border-slate-200 bg-white p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                लाइव पर्ची प्रीव्यू (1 Slip)
              </h3>
              <span className="text-xs text-slate-500">
                2-कॉलम प्रिंट फ़ॉर्मेट
              </span>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-100 p-4">
              <VoterSlipCard
                voter={previewVoter}
                config={config}
                compact={config.slipsPerPage === 10}
              />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              नोट: प्रिंट करते समय A4 पेपर साइज़ पर हर पृष्ठ में 2 कॉलम में {config.slipsPerPage} पर्चियां बिल्कुल इसी फ़ॉर्मेट में प्रिंट होंगी।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
