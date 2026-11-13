export type GenderOption = 'पुरुष' | 'महिला' | 'अन्य';

export type RelationType = 'father' | 'husband' | 'mother' | 'other';

export interface VoterRecord {
  id: string;
  selected: boolean;
  serialNo: string;
  name: string;
  fatherOrHusbandName: string;
  relationType: RelationType;
  epic: string;
  houseNo: string;
  age: string;
  gender: GenderOption;
  address: string;
  wardNo: string;
  partNo: string;
  zpNo?: string;
  psNo?: string;
  customPollingStation?: string;
  customRoomNumber?: string;
}

export interface SlipConfig {
  electionTitle: string;
  panchayatSamitiLabel: string;
  panchayatSamiti: string;
  gramPanchayatLabel: string;
  gramPanchayat: string;
  defaultWardNo: string;
  zpNo: string;
  psNo: string;
  defaultPartNo: string;
  pollingStation: string;
  roomNumber: string;
  pollingDate: string;
  pollingTime: string;
  slipsPerPage: 10 | 8;
  showFooterDateTime: boolean;
}

export interface PageExtractionMetadata {
  panchayatSamiti?: string;
  gramPanchayat?: string;
  wardNo?: string;
  partNo?: string;
  pollingStation?: string;
  roomNo?: string;
  defaultAddress?: string;
}

export interface ExtractionProgress {
  status: 'idle' | 'reading-pdf' | 'processing' | 'done' | 'error';
  currentPage: number;
  totalPages: number;
  extractedCount: number;
  errorMessage?: string;
}

export const DEFAULT_SLIP_CONFIG: SlipConfig = {
  electionTitle: 'सरपंच चुनाव 2026',
  panchayatSamitiLabel: 'पंचायत समिति',
  panchayatSamiti: 'BADLYA',
  gramPanchayatLabel: 'ग्राम पंचायत',
  gramPanchayat: 'Amba-Masina',
  defaultWardNo: '1',
  zpNo: '4',
  psNo: '2',
  defaultPartNo: '192',
  pollingStation: '1 — GOVERNMENT SENIOR SECONDARY SCHOOL, MASINA',
  roomNumber: 'ROOM NUMBER 3',
  pollingDate: '16-11-2026 (सोमवार)',
  pollingTime: 'सुबह 7:00 से शाम 6:00 बजे तक',
  slipsPerPage: 10,
  showFooterDateTime: true,
};

export const SAMPLE_VOTERS: VoterRecord[] = [
  {
    id: 'sample-1',
    selected: true,
    serialNo: '1',
    name: 'शफ़ी मोहम्मद',
    fatherOrHusbandName: 'अनवर खान',
    relationType: 'father',
    epic: 'UHK1673060',
    houseNo: '218',
    age: '25',
    gender: 'पुरुष',
    address: 'AMBA MAJARA BHAMBI BASTI,AMBA MASINA',
    wardNo: '1',
    partNo: '192',
  },
  {
    id: 'sample-2',
    selected: true,
    serialNo: '2',
    name: 'अफ़साना',
    fatherOrHusbandName: 'सफ़ी',
    relationType: 'husband',
    epic: 'UHK1852086',
    houseNo: '218',
    age: '24',
    gender: 'महिला',
    address: 'AMBA MAJARA BHAMBI BASTI,AMBA MASINA',
    wardNo: '1',
    partNo: '192',
  },
  {
    id: 'sample-3',
    selected: true,
    serialNo: '3',
    name: 'संदीप',
    fatherOrHusbandName: 'गीता',
    relationType: 'father',
    epic: 'UHK2042752',
    houseNo: '007',
    age: '20',
    gender: 'पुरुष',
    address: 'AMBA MAJARA RAVAT BASTI,AMBA MASINA',
    wardNo: '1',
    partNo: '192',
  },
  {
    id: 'sample-4',
    selected: true,
    serialNo: '4',
    name: 'मुकेश रावत',
    fatherOrHusbandName: 'शम्भू सिंह',
    relationType: 'father',
    epic: 'UHK1480987',
    houseNo: '196',
    age: '26',
    gender: 'पुरुष',
    address: 'AMBA MAJARA RAVAT BASTI,AMBA MASINA',
    wardNo: '1',
    partNo: '192',
  },
  {
    id: 'sample-5',
    selected: true,
    serialNo: '5',
    name: 'अर्चना',
    fatherOrHusbandName: 'कान सिंह',
    relationType: 'husband',
    epic: 'UHK2088292',
    houseNo: '192',
    age: '21',
    gender: 'महिला',
    address: 'AMBA MAJARA RAVAT BASTI,AMBA MASINA',
    wardNo: '1',
    partNo: '192',
  },
  {
    id: 'sample-6',
    selected: true,
    serialNo: '6',
    name: 'धन्ना',
    fatherOrHusbandName: 'कामड़',
    relationType: 'father',
    epic: 'RJ/12/097/468239',
    houseNo: '195',
    age: '75',
    gender: 'पुरुष',
    address: 'AMBA MAJARA RAVAT BASTI,AMBA MASINA',
    wardNo: '1',
    partNo: '192',
  },
  {
    id: 'sample-7',
    selected: true,
    serialNo: '7',
    name: 'पांची',
    fatherOrHusbandName: 'धन्ना',
    relationType: 'husband',
    epic: 'RJ/12/097/468144',
    houseNo: '195',
    age: '71',
    gender: 'महिला',
    address: 'AMBA MAJARA RAVAT BASTI,AMBA MASINA',
    wardNo: '1',
    partNo: '192',
  },
  {
    id: 'sample-8',
    selected: true,
    serialNo: '8',
    name: 'बोदू',
    fatherOrHusbandName: 'कामड़',
    relationType: 'father',
    epic: 'RJ/12/097/468148',
    houseNo: '195',
    age: '65',
    gender: 'पुरुष',
    address: 'AMBA MAJARA RAVAT BASTI,AMBA MASINA',
    wardNo: '1',
    partNo: '192',
  },
  {
    id: 'sample-9',
    selected: true,
    serialNo: '9',
    name: 'गंगादेवी',
    fatherOrHusbandName: 'पाचूसिंह',
    relationType: 'husband',
    epic: 'DLZ2503480',
    houseNo: '195',
    age: '61',
    gender: 'महिला',
    address: 'AMBA MAJARA RAVAT BASTI,AMBA MASINA',
    wardNo: '1',
    partNo: '192',
  },
  {
    id: 'sample-10',
    selected: true,
    serialNo: '10',
    name: 'प्रेम देवी',
    fatherOrHusbandName: 'बोदू सिंह',
    relationType: 'husband',
    epic: 'RJ/12/097/469010',
    houseNo: '195',
    age: '55',
    gender: 'महिला',
    address: 'AMBA MAJARA RAVAT BASTI,AMBA MASINA',
    wardNo: '1',
    partNo: '192',
  },
];
