import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Download,
  CheckSquare,
  Square,
  X,
  ArrowRight,
  Users,
} from 'lucide-react';
import { GenderOption, RelationType, SlipConfig, VoterRecord } from '../types';

interface VoterTableViewProps {
  voters: VoterRecord[];
  config: SlipConfig;
  onUpdateVoter: (updated: VoterRecord) => void;
  onAddVoter: (newVoter: VoterRecord) => void;
  onDeleteVoter: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onSelectAllFiltered: (ids: string[], selected: boolean) => void;
  onClearAll: () => void;
  onNavigateToUpload: () => void;
  onNavigateToPreview: () => void;
}

const emptyDraft = (config: SlipConfig, nextSerial: string): VoterRecord => ({
  id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  selected: true,
  serialNo: nextSerial,
  name: '',
  fatherOrHusbandName: '',
  relationType: 'father',
  epic: '',
  houseNo: '',
  age: '',
  gender: 'पुरुष',
  address: '',
  wardNo: config.defaultWardNo || '1',
  partNo: config.defaultPartNo || '192',
});

export const VoterTableView: React.FC<VoterTableViewProps> = ({
  voters,
  config,
  onUpdateVoter,
  onAddVoter,
  onDeleteVoter,
  onToggleSelect,
  onSelectAllFiltered,
  onClearAll,
  onNavigateToUpload,
  onNavigateToPreview,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | GenderOption>('all');
  const [selectionFilter, setSelectionFilter] = useState<'all' | 'selected'>('all');

  const [editingVoter, setEditingVoter] = useState<VoterRecord | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const filteredVoters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return voters.filter((v) => {
      if (genderFilter !== 'all' && v.gender !== genderFilter) return false;
      if (selectionFilter === 'selected' && !v.selected) return false;
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) ||
        v.fatherOrHusbandName.toLowerCase().includes(q) ||
        v.epic.toLowerCase().includes(q) ||
        v.houseNo.toLowerCase().includes(q) ||
        v.serialNo.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q)
      );
    });
  }, [voters, searchQuery, genderFilter, selectionFilter]);

  const selectedCount = useMemo(
    () => voters.filter((v) => v.selected).length,
    [voters]
  );

  const allFilteredSelected =
    filteredVoters.length > 0 && filteredVoters.every((v) => v.selected);

  const openAddModal = () => {
    setIsNewRecord(true);
    setEditingVoter(emptyDraft(config, String(voters.length + 1)));
  };

  const openEditModal = (voter: VoterRecord) => {
    setIsNewRecord(false);
    setEditingVoter({ ...voter });
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoter) return;
    if (isNewRecord) {
      onAddVoter(editingVoter);
    } else {
      onUpdateVoter(editingVoter);
    }
    setEditingVoter(null);
  };

  const handleExportCsv = () => {
    const headers = [
      'Serial No',
      'Name',
      'Father/Husband Name',
      'Relation',
      'EPIC',
      'House No',
      'Age',
      'Gender',
      'Ward No',
      'Part No',
      'Address',
    ];
    const escape = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
    const rows = voters.map((v) =>
      [
        v.serialNo,
        v.name,
        v.fatherOrHusbandName,
        v.relationType,
        v.epic,
        v.houseNo,
        v.age,
        v.gender,
        v.wardNo || config.defaultWardNo,
        v.partNo || config.defaultPartNo,
        v.address,
      ]
        .map(escape)
        .join(',')
    );
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voter-list-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (voters.length === 0) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
          <Users className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">
          अभी कोई मतदाता रिकॉर्ड उपलब्ध नहीं है
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
          Voter List PDF अपलोड करके OCR चलाएं या सीधे नया मतदाता जोड़ें।
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onNavigateToUpload}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
          >
            PDF अपलोड करें
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" />
            मैन्युअल मतदाता जोड़ें
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      {/* Toolbar */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: Search & Filters */}
          <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[260px]">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="नाम, पिता/पति, EPIC, मकान नं. से खोजें..."
                className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 rounded-md bg-slate-100 p-1">
              {(['all', 'पुरुष', 'महिला'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenderFilter(g)}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    genderFilter === g
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {g === 'all' ? 'सभी' : g}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 rounded-md bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setSelectionFilter('all')}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  selectionFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                सभी ({voters.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectionFilter('selected')}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  selectionFilter === 'selected'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                चयनित ({selectedCount})
              </button>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              नया मतदाता
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 whitespace-nowrap shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
              साफ़ करें
            </button>
            <button
              type="button"
              onClick={onNavigateToPreview}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-3.5 py-2 text-xs font-medium text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
            >
              <span>स्लिप प्रीव्यू ({selectedCount})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="w-10 px-3 py-3 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      onSelectAllFiltered(
                        filteredVoters.map((v) => v.id),
                        !allFilteredSelected
                      )
                    }
                    title={allFilteredSelected ? 'सभी अचयनित करें' : 'सभी चुनें'}
                    className="inline-flex items-center justify-center text-slate-600 hover:text-slate-900"
                  >
                    {allFilteredSelected ? (
                      <CheckSquare className="h-4 w-4 text-blue-700" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3 text-right whitespace-nowrap">क्रम सं.</th>
                <th className="px-3 py-3 whitespace-nowrap">मतदाता का नाम</th>
                <th className="px-3 py-3 whitespace-nowrap">पिता / पति का नाम</th>
                <th className="px-3 py-3 whitespace-nowrap">EPIC नंबर</th>
                <th className="px-3 py-3 text-right whitespace-nowrap">मकान नं.</th>
                <th className="px-3 py-3 text-right whitespace-nowrap">आयु</th>
                <th className="px-3 py-3 whitespace-nowrap">लिंग</th>
                <th className="px-3 py-3 whitespace-nowrap">वार्ड / भाग</th>
                <th className="px-3 py-3 text-right whitespace-nowrap">एडिट</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredVoters.map((voter) => (
                <tr
                  key={voter.id}
                  onDoubleClick={() => openEditModal(voter)}
                  className={`transition-colors hover:bg-slate-50 ${
                    !voter.selected ? 'opacity-55' : ''
                  }`}
                >
                  <td className="px-3 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={voter.selected}
                      onChange={() => onToggleSelect(voter.id)}
                      aria-label={`Select ${voter.name}`}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                    />
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono-tabular text-xs font-medium text-slate-700">
                    {voter.serialNo || '—'}
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-slate-900">
                    {voter.name || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-700">
                    {voter.fatherOrHusbandName || '—'}
                  </td>
                  <td className="px-3 py-2.5 font-mono-tabular text-xs font-medium text-slate-800">
                    {voter.epic || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono-tabular text-xs text-slate-700">
                    {voter.houseNo || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono-tabular text-xs text-slate-700">
                    {voter.age || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-700 whitespace-nowrap">
                    {voter.gender}
                  </td>
                  <td className="px-3 py-2.5 font-mono-tabular text-xs text-slate-600 whitespace-nowrap">
                    {voter.wardNo || config.defaultWardNo} /{' '}
                    {voter.partNo || config.defaultPartNo}
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(voter)}
                        className="rounded p-1.5 text-slate-600 hover:bg-slate-100 hover:text-blue-700"
                        title="रिकॉर्ड एडिट करें"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteVoter(voter.id)}
                        className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-700"
                        title="हटाएं"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVoters.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-sm text-slate-500">
                    खोज मानदंड से मेल खाने वाला कोई मतदाता नहीं मिला।
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Voter Modal */}
      {editingVoter ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-base font-semibold text-slate-900">
                {isNewRecord ? 'नया मतदाता जोड़ें' : 'मतदाता रिकॉर्ड एडिट करें'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingVoter(null)}
                className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    क्रम संख्या (Serial No.)
                  </label>
                  <input
                    type="text"
                    value={editingVoter.serialNo}
                    onChange={(e) =>
                      setEditingVoter({ ...editingVoter, serialNo: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm tabular-nums focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700">
                    मतदाता का नाम (Voter Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingVoter.name}
                    onChange={(e) =>
                      setEditingVoter({ ...editingVoter, name: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    संबंध प्रकार
                  </label>
                  <select
                    value={editingVoter.relationType}
                    onChange={(e) =>
                      setEditingVoter({
                        ...editingVoter,
                        relationType: e.target.value as RelationType,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                  >
                    <option value="father">पिता का नाम</option>
                    <option value="husband">पति का नाम</option>
                    <option value="mother">माता का नाम</option>
                    <option value="other">अन्य</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700">
                    पिता / पति का नाम
                  </label>
                  <input
                    type="text"
                    value={editingVoter.fatherOrHusbandName}
                    onChange={(e) =>
                      setEditingVoter({
                        ...editingVoter,
                        fatherOrHusbandName: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700">
                    EPIC नंबर
                  </label>
                  <input
                    type="text"
                    value={editingVoter.epic}
                    onChange={(e) =>
                      setEditingVoter({
                        ...editingVoter,
                        epic: e.target.value.toUpperCase(),
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono-tabular text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    मकान नं.
                  </label>
                  <input
                    type="text"
                    value={editingVoter.houseNo}
                    onChange={(e) =>
                      setEditingVoter({ ...editingVoter, houseNo: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm tabular-nums focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    आयु (Age)
                  </label>
                  <input
                    type="text"
                    value={editingVoter.age}
                    onChange={(e) =>
                      setEditingVoter({ ...editingVoter, age: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm tabular-nums focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    लिंग (Gender)
                  </label>
                  <select
                    value={editingVoter.gender}
                    onChange={(e) =>
                      setEditingVoter({
                        ...editingVoter,
                        gender: e.target.value as GenderOption,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                  >
                    <option value="पुरुष">पुरुष</option>
                    <option value="महिला">महिला</option>
                    <option value="अन्य">अन्य</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    वार्ड नं.
                  </label>
                  <input
                    type="text"
                    value={editingVoter.wardNo}
                    onChange={(e) =>
                      setEditingVoter({ ...editingVoter, wardNo: e.target.value })
                    }
                    placeholder={config.defaultWardNo}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm tabular-nums focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    भाग संख्या
                  </label>
                  <input
                    type="text"
                    value={editingVoter.partNo}
                    onChange={(e) =>
                      setEditingVoter({ ...editingVoter, partNo: e.target.value })
                    }
                    placeholder={config.defaultPartNo}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm tabular-nums focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">
                  पता (Address)
                </label>
                <input
                  type="text"
                  value={editingVoter.address}
                  onChange={(e) =>
                    setEditingVoter({ ...editingVoter, address: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    कस्टम मतदान केंद्र (खाली छोड़ें तो डिफ़ॉल्ट लागू होगा)
                  </label>
                  <input
                    type="text"
                    value={editingVoter.customPollingStation || ''}
                    onChange={(e) =>
                      setEditingVoter({
                        ...editingVoter,
                        customPollingStation: e.target.value,
                      })
                    }
                    placeholder={config.pollingStation}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    कस्टम कमरा नंबर
                  </label>
                  <input
                    type="text"
                    value={editingVoter.customRoomNumber || ''}
                    onChange={(e) =>
                      setEditingVoter({
                        ...editingVoter,
                        customRoomNumber: e.target.value,
                      })
                    }
                    placeholder={config.roomNumber}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingVoter(null)}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                >
                  सेव करें
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};
