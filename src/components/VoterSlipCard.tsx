import React from 'react';
import { SlipConfig, VoterRecord } from '../types';

interface VoterSlipCardProps {
  voter: VoterRecord;
  config: SlipConfig;
  compact?: boolean;
}

export const VoterSlipCard: React.FC<VoterSlipCardProps> = ({
  voter,
  config,
  compact = config.slipsPerPage === 10,
}) => {
  const wardDisplay = voter.wardNo?.trim() || config.defaultWardNo || '1';
  const partDisplay = voter.partNo?.trim() || config.defaultPartNo || '192';
  const zpDisplay = voter.zpNo?.trim() || config.zpNo || '4';
  const psDisplay = voter.psNo?.trim() || config.psNo || '2';
  const boothDisplay = voter.customPollingStation?.trim() || config.pollingStation;
  const roomDisplay = voter.customRoomNumber?.trim() || config.roomNumber;

  const relationLabel =
    voter.relationType === 'husband'
      ? 'पिता / पति का नाम'
      : voter.relationType === 'mother'
        ? 'माता का नाम'
        : 'पिता / पति का नाम';

  return (
    <article
      className={`slip-card slip-font flex flex-col justify-between bg-white text-slate-900 ${
        compact ? 'min-h-[52.5mm]' : 'min-h-[65mm]'
      }`}
    >
      {/* Top Election Title */}
      <div className="border-b border-slate-400 px-2 py-1 text-center">
        <div
          className={`font-bold tracking-tight text-slate-950 ${
            compact ? 'text-[12.5px] leading-tight' : 'text-[14px] leading-tight'
          }`}
        >
          {config.electionTitle || 'सरपंच चुनाव 2026'}
        </div>
      </div>

      {/* Panchayat Samiti / Gram Panchayat Row */}
      <div
        className={`flex items-center justify-between gap-2 border-b border-slate-300 px-2 ${
          compact ? 'py-0.5 text-[9.5px]' : 'py-1 text-[10.5px]'
        }`}
      >
        <div className="truncate">
          <span className="text-slate-700">{config.panchayatSamitiLabel} : </span>
          <span className="font-semibold text-slate-950">{config.panchayatSamiti}</span>
        </div>
        <div className="truncate text-right">
          <span className="text-slate-700">{config.gramPanchayatLabel} : </span>
          <span className="font-semibold text-slate-950">{config.gramPanchayat}</span>
        </div>
      </div>

      {/* Boxed Serial / Ward / ZP / PS Strip */}
      <div
        className={`flex items-center justify-between gap-1 border-b border-slate-300 px-2 ${
          compact ? 'py-1 text-[9.5px]' : 'py-1.5 text-[10.5px]'
        }`}
      >
        <div className="flex items-center gap-1">
          <span className="text-slate-800">वार्ड नं. :</span>
          <span className="inline-flex min-w-[20px] items-center justify-center border border-slate-600 px-1 py-0.2 font-bold leading-tight text-slate-950 tabular-nums">
            {wardDisplay}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-800">क्रम संख्या :</span>
          <span className="inline-flex min-w-[22px] items-center justify-center border border-slate-600 px-1 py-0.2 font-bold leading-tight text-slate-950 tabular-nums">
            {voter.serialNo || '—'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-800">जि.प. :</span>
          <span className="inline-flex min-w-[20px] items-center justify-center border border-slate-600 px-1 py-0.2 font-bold leading-tight text-slate-950 tabular-nums">
            {zpDisplay}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-800">पं.स. :</span>
          <span className="inline-flex min-w-[20px] items-center justify-center border border-slate-600 px-1 py-0.2 font-bold leading-tight text-slate-950 tabular-nums">
            {psDisplay}
          </span>
        </div>
      </div>

      {/* Main Voter Information 2-Column Body */}
      <div
        className={`grid grid-cols-[1.55fr_0.95fr] gap-x-2 px-2 ${
          compact ? 'py-1.5 text-[10px] leading-[1.35]' : 'py-2 text-[11px] leading-[1.45]'
        }`}
      >
        {/* Left Column: Name, Relative, EPIC, Address */}
        <div className="min-w-0 space-y-0.5">
          <div className="truncate">
            <span className="text-slate-800">मतदाता का नाम : </span>
            <span className="font-bold text-slate-950">{voter.name || '—'}</span>
          </div>
          <div className="truncate">
            <span className="text-slate-800">{relationLabel} : </span>
            <span className="font-bold text-slate-950">
              {voter.fatherOrHusbandName || '—'}
            </span>
          </div>
          <div className="truncate">
            <span className="font-semibold text-slate-800">EPIC : </span>
            <span className="font-mono-tabular font-bold text-slate-950">
              {voter.epic || '—'}
            </span>
          </div>
          <div className="line-clamp-2 text-[8.5px] leading-[1.25] text-slate-800">
            <span>पता : </span>
            <span className="uppercase">{voter.address || '—'}</span>
          </div>
        </div>

        {/* Right Column: Gender, Age, House No, Part No */}
        <div className="min-w-0 space-y-0.5 pl-1">
          <div className="truncate">
            <span className="text-slate-800">लिंग : </span>
            <span className="font-bold text-slate-950">{voter.gender || '—'}</span>
          </div>
          <div className="truncate">
            <span className="text-slate-800">आयु : </span>
            <span className="font-bold tabular-nums text-slate-950">
              {voter.age || '—'}
            </span>
          </div>
          <div className="truncate">
            <span className="text-slate-800">मकान नं. : </span>
            <span className="font-bold tabular-nums text-slate-950">
              {voter.houseNo || '—'}
            </span>
          </div>
          <div className="truncate">
            <span className="text-slate-800">भाग संख्या : </span>
            <span className="font-bold tabular-nums text-slate-950">{partDisplay}</span>
          </div>
        </div>
      </div>

      {/* Polling Booth & Room Strip */}
      <div
        className={`border-t border-slate-400 px-2 ${
          compact ? 'py-1 text-[9px] leading-[1.25]' : 'py-1.5 text-[10px] leading-[1.35]'
        }`}
      >
        <div className="font-bold text-slate-950">
          मतदान केंद्र : {boothDisplay || '—'}
        </div>
        {roomDisplay ? (
          <div className="font-bold uppercase text-slate-900">{roomDisplay}</div>
        ) : null}
      </div>

      {/* Footer Date & Time */}
      {config.showFooterDateTime ? (
        <div
          className={`border-t border-slate-300 px-2 text-center font-medium text-slate-900 ${
            compact ? 'py-0.5 text-[9px]' : 'py-1 text-[10px]'
          }`}
        >
          मतदान दिनांक {config.pollingDate} {config.pollingTime}
        </div>
      ) : null}
    </article>
  );
};
