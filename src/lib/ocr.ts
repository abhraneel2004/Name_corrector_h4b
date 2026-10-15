// Fields extracted from scanned case documents, mapped to the dataset's CSV headers
export const OCR_FIELDS = [
  { key: 'caseTitle', header: 'Case Title', hint: 'Case title, FIR number or case number' },
  { key: 'date', header: 'Date', hint: 'Date of the FIR or case, formatted YYYY-MM-DD' },
  { key: 'accusedFirstName', header: 'Accused First Name', hint: "Accused person's given name, including any middle names (e.g. 'Ramesh Kumar')" },
  { key: 'accusedLastName', header: 'Accused Last Name', hint: "Accused person's surname or family name only" },
  { key: 'crime', header: 'Crime', hint: 'Offence, including the IPC/BNS section if written' },
  { key: 'accusedStatus', header: 'Accused Status', hint: 'Status of the accused, e.g. Arrested, Absconding, On bail' },
  { key: 'criminalLocation', header: 'Criminal Location', hint: 'Address of the accused or place of occurrence' },
  { key: 'policeStation', header: 'Police Station', hint: 'Police station where the case is registered' },
  { key: 'inspectorInCharge', header: 'Inspector In charge', hint: 'Investigating officer or officer in charge' },
] as const;

export type OcrFieldKey = (typeof OCR_FIELDS)[number]['key'];

export const OCR_FIELD_KEYS = OCR_FIELDS.map((f) => f.key) as OcrFieldKey[];

export type OcrRecord = Record<OcrFieldKey, string> & {
  // Accused name in the original script, kept for verification
  nameAsWritten: string;
  // Fields the model could not read with confidence
  uncertainFields: OcrFieldKey[];
};

export type OcrResponse = {
  language: string;
  legibility: 'good' | 'fair' | 'poor';
  records: OcrRecord[];
};

export const OCR_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
];

// Vercel rejects request bodies over 4.5 MB, so each upload must stay below that
export const OCR_MAX_FILE_MB = 4;
export const OCR_MAX_FILE_BYTES = OCR_MAX_FILE_MB * 1024 * 1024;

// Rounds up, so a file just over the limit never displays as "4.0 MB"
export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
  return `${(Math.ceil((bytes / 1024 / 1024) * 10) / 10).toFixed(1)} MB`;
}
