'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { authFetch } from '@/lib/auth-fetch';
import {
  OCR_ACCEPTED_TYPES,
  OCR_FIELDS,
  OCR_MAX_FILE_BYTES,
  OCR_MAX_FILE_MB,
  formatFileSize,
  type OcrFieldKey,
  type OcrRecord,
  type OcrResponse,
} from '@/lib/ocr';

export type ImportedOcrRecord = OcrRecord & { sourceFile: string };

type QueuedFile = {
  id: string;
  file: File;
  url: string;
  status: 'queued' | 'processing' | 'done' | 'error';
  error?: string;
  found?: number;
  legibility?: OcrResponse['legibility'];
};

type ReviewRecord = ImportedOcrRecord & { id: string; fileId: string; include: boolean };

type RejectedFile = { name: string; reason: string };

let idCounter = 0;
const makeId = () => `ocr-${Date.now()}-${idCounter++}`;

export function OcrImport({ onImport }: { onImport: (records: ImportedOcrRecord[]) => void }) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [records, setRecords] = useState<ReviewRecord[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  // Files refused from the most recent selection, shown until dismissed or the next selection
  const [rejectedFiles, setRejectedFiles] = useState<RejectedFile[]>([]);
  const { toast } = useToast();

  // Release object URLs when the component unmounts
  const filesRef = useRef(files);
  filesRef.current = files;
  useEffect(() => () => filesRef.current.forEach((f) => URL.revokeObjectURL(f.url)), []);

  const previewFile = files.find((f) => f.id === previewFileId) ?? files[0];
  const pendingCount = files.filter((f) => f.status === 'queued' || f.status === 'error').length;
  const selectedCount = records.filter((r) => r.include).length;
  const uncertainCount = records
    .filter((r) => r.include)
    .reduce((sum, r) => sum + r.uncertainFields.length, 0);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const accepted: QueuedFile[] = [];
    const rejected: RejectedFile[] = [];

    Array.from(list).forEach((file) => {
      if (!OCR_ACCEPTED_TYPES.includes(file.type)) {
        rejected.push({ name: file.name, reason: 'Unsupported file type' });
      } else if (file.size > OCR_MAX_FILE_BYTES) {
        rejected.push({ name: file.name, reason: `${formatFileSize(file.size)}, over the ${OCR_MAX_FILE_MB} MB limit` });
      } else {
        accepted.push({ id: makeId(), file, url: URL.createObjectURL(file), status: 'queued' });
      }
    });

    setRejectedFiles(rejected);
    if (accepted.length > 0) {
      setFiles((prev) => [...prev, ...accepted]);
      setPreviewFileId((current) => current ?? accepted[0].id);
    }
  };

  const removeFile = (fileId: string) => {
    const target = files.find((f) => f.id === fileId);
    if (target) URL.revokeObjectURL(target.url);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setRecords((prev) => prev.filter((r) => r.fileId !== fileId));
    if (previewFileId === fileId) setPreviewFileId(null);
  };

  const extractRecords = async () => {
    const pending = files.filter((f) => f.status === 'queued' || f.status === 'error');
    if (pending.length === 0) return;

    setIsExtracting(true);
    let found = 0;
    let failed = 0;

    // One document per request keeps each call under Gemini's inline size limit
    for (const queued of pending) {
      setFiles((prev) =>
        prev.map((f) => (f.id === queued.id ? { ...f, status: 'processing', error: undefined } : f))
      );

      try {
        const body = new FormData();
        body.append('file', queued.file);
        const response = await authFetch('/api/ocr', { method: 'POST', body });
        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(json.error || `Request failed with status ${response.status}`);
        }

        const result = json as OcrResponse;
        setRecords((prev) => [
          ...prev,
          ...result.records.map((record) => ({
            ...record,
            id: makeId(),
            fileId: queued.id,
            sourceFile: queued.file.name,
            include: true,
          })),
        ]);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === queued.id
              ? { ...f, status: 'done', found: result.records.length, legibility: result.legibility }
              : f
          )
        );
        found += result.records.length;
      } catch (error: any) {
        failed += 1;
        setFiles((prev) =>
          prev.map((f) => (f.id === queued.id ? { ...f, status: 'error', error: error.message } : f))
        );
      }
    }

    setIsExtracting(false);
    toast({
      title: failed > 0 ? 'Extraction finished with errors' : 'Extraction complete',
      description: `${found} record(s) found in ${pending.length - failed} of ${pending.length} document(s).`,
      variant: failed > 0 ? 'destructive' : 'success',
    });
  };

  const updateField = (recordId: string, key: OcrFieldKey, value: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? // Editing a field counts as verifying it
            { ...r, [key]: value, uncertainFields: r.uncertainFields.filter((k) => k !== key) }
          : r
      )
    );
  };

  const selectRecord = (record: ReviewRecord) => {
    setActiveRecordId(record.id);
    setPreviewFileId(record.fileId);
  };

  const importSelected = () => {
    const selected = records.filter((r) => r.include);
    if (selected.length === 0) return;

    onImport(selected.map(({ id, fileId, include, ...record }) => record));

    files.forEach((f) => URL.revokeObjectURL(f.url));
    setFiles([]);
    setRecords([]);
    setActiveRecordId(null);
    setPreviewFileId(null);
    setOpen(false);
  };

  const fileInput = (
    <input
      type="file"
      multiple
      accept={OCR_ACCEPTED_TYPES.join(',')}
      onChange={(e) => {
        addFiles(e.target.files);
        e.target.value = '';
      }}
      className="sr-only"
    />
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !isExtracting && setOpen(next)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Icons.scan />
          Scan handwritten documents
        </Button>
      </DialogTrigger>

      <DialogContent className="flex h-[90vh] max-w-[1400px] flex-col gap-0 overflow-hidden p-0 sm:rounded-md">
        {/* Header */}
        <div className="border-b px-5 py-4 pr-12">
          <p className="eyebrow">Document Import</p>
          <DialogTitle className="mt-1 text-base font-semibold">Scan handwritten case files</DialogTitle>
          <DialogDescription className="mt-1 text-xs">
            Upload photos or scans of FIRs and case diaries. Names in Hindi and other Indian scripts are
            transliterated to English. Review every record against the original before adding it.
          </DialogDescription>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* Left: documents and review table */}
          <div className="flex min-h-0 flex-col lg:border-r">
            <div className="border-b p-4">
              {files.length === 0 ? (
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    addFiles(e.dataTransfer.files);
                  }}
                  className={cn(
                    'flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-input bg-background px-4 py-10 text-center transition-colors hover:border-primary/60 hover:bg-accent/40',
                    isDragging && 'border-primary bg-primary/5'
                  )}
                >
                  <Icons.upload className="h-5 w-5 text-muted-foreground" />
                  <span className="mt-1 text-[13px] font-medium">Select or drop scanned pages</span>
                  <span className="text-[11px] text-muted-foreground">
                    JPG, PNG, WEBP, HEIC or PDF
                  </span>
                  <span className="mt-1 rounded-sm border px-2 py-0.5 text-[11px] font-medium text-foreground">
                    Maximum {OCR_MAX_FILE_MB} MB per file
                  </span>
                  {fileInput}
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-3">
                      <span className="eyebrow">Documents · {files.length}</span>
                      <span className="text-[11px] text-muted-foreground">Max {OCR_MAX_FILE_MB} MB per file</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label
                        className={cn(
                          'inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-input px-3 text-xs font-medium hover:bg-accent',
                          isExtracting && 'pointer-events-none opacity-50'
                        )}
                      >
                        <Icons.plus className="h-3.5 w-3.5" />
                        Add files
                        {fileInput}
                      </label>
                      <Button size="sm" onClick={extractRecords} disabled={isExtracting || pendingCount === 0}>
                        {isExtracting ? (
                          <>
                            <Icons.spinner className="animate-spin" />
                            Reading documents…
                          </>
                        ) : (
                          <>
                            <Icons.scan />
                            Extract records{pendingCount > 0 ? ` (${pendingCount})` : ''}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <ul className="max-h-36 space-y-0.5 overflow-y-auto">
                    {files.map((f) => (
                      <li
                        key={f.id}
                        className={cn(
                          'flex items-center gap-2 rounded-md border px-2 py-1.5',
                          previewFile?.id === f.id ? 'border-primary/40 bg-primary/10' : 'border-transparent hover:bg-accent/50'
                        )}
                      >
                        <FileStatusIcon status={f.status} />
                        <button
                          type="button"
                          onClick={() => setPreviewFileId(f.id)}
                          className="min-w-0 flex-1 truncate text-left text-[13px]"
                          title={f.file.name}
                        >
                          {f.file.name}
                        </button>
                        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                          {formatFileSize(f.file.size)}
                        </span>
                        <span
                          className={cn(
                            'shrink-0 text-[11px]',
                            f.status === 'error' ? 'max-w-[50%] truncate text-destructive' : 'text-muted-foreground'
                          )}
                          title={f.error}
                        >
                          {f.status === 'queued' && 'Queued'}
                          {f.status === 'processing' && 'Reading…'}
                          {f.status === 'done' && `${f.found} record${f.found === 1 ? '' : 's'} · ${f.legibility} legibility`}
                          {f.status === 'error' && f.error}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(f.id)}
                          disabled={f.status === 'processing'}
                          className="h-6 w-6 shrink-0 hover:bg-destructive/15 hover:text-destructive"
                          title="Remove document"
                        >
                          <Icons.close className="h-3.5 w-3.5" />
                          <span className="sr-only">Remove document</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {rejectedFiles.length > 0 && (
                <div role="alert" className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-destructive">
                      <Icons.alertTriangle className="h-4 w-4 shrink-0" />
                      {rejectedFiles.length === 1 ? '1 file was not added' : `${rejectedFiles.length} files were not added`}
                    </div>
                    <button
                      type="button"
                      onClick={() => setRejectedFiles([])}
                      className="text-muted-foreground hover:text-foreground"
                      title="Dismiss"
                    >
                      <Icons.close className="h-3.5 w-3.5" />
                      <span className="sr-only">Dismiss</span>
                    </button>
                  </div>
                  <ul className="mt-2 max-h-24 space-y-1 overflow-y-auto">
                    {rejectedFiles.map((rejected, index) => (
                      <li key={`${rejected.name}-${index}`} className="flex items-center justify-between gap-3 text-xs">
                        <span className="min-w-0 truncate" title={rejected.name}>{rejected.name}</span>
                        <span className="shrink-0 text-destructive">{rejected.reason}</span>
                      </li>
                    ))}
                  </ul>
                  {rejectedFiles.some((rejected) => rejected.reason.includes('limit')) && (
                    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                      To get under {OCR_MAX_FILE_MB} MB: photograph the page at a lower camera resolution, crop to the
                      page edges, or scan at 200 DPI. Split long PDFs into a few pages per file.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Review table */}
            <div className="min-h-0 flex-1">
              {records.length > 0 ? (
                <Table containerClassName="h-full">
                  <TableHeader className="sticky top-0 z-20 bg-card">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selectedCount === records.length ? true : selectedCount === 0 ? false : 'indeterminate'}
                          onCheckedChange={(checked) =>
                            setRecords((prev) => prev.map((r) => ({ ...r, include: checked === true })))
                          }
                          aria-label="Select all records"
                        />
                      </TableHead>
                      <TableHead className="min-w-[140px] whitespace-nowrap">Name as written</TableHead>
                      {OCR_FIELDS.map((field) => (
                        <TableHead key={field.key} className="min-w-[150px] whitespace-nowrap">
                          {field.header}
                        </TableHead>
                      ))}
                      <TableHead className="w-10">
                        <span className="sr-only">Remove</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow
                        key={record.id}
                        onClick={() => selectRecord(record)}
                        onFocusCapture={() => selectRecord(record)}
                        className={cn(
                          !record.include && 'opacity-50',
                          activeRecordId === record.id && 'bg-primary/5 hover:bg-primary/5'
                        )}
                      >
                        <TableCell className="py-1">
                          <Checkbox
                            checked={record.include}
                            onCheckedChange={(checked) =>
                              setRecords((prev) =>
                                prev.map((r) => (r.id === record.id ? { ...r, include: checked === true } : r))
                              )
                            }
                            aria-label="Include record"
                          />
                        </TableCell>
                        <TableCell className="py-1 text-[13px]" title={record.sourceFile}>
                          {record.nameAsWritten || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        {OCR_FIELDS.map((field) => {
                          const uncertain = record.uncertainFields.includes(field.key);
                          return (
                            <TableCell key={field.key} className="px-1.5 py-1">
                              <Input
                                value={record[field.key]}
                                onChange={(e) => updateField(record.id, field.key, e.target.value)}
                                title={uncertain ? 'Low confidence: check against the original' : undefined}
                                className={cn(
                                  'h-8 px-1.5 text-[13px]',
                                  uncertain
                                    ? 'border-warning/60 bg-warning/10 hover:border-warning focus-visible:border-warning focus-visible:ring-warning'
                                    : 'border-transparent bg-transparent hover:border-input focus-visible:bg-background'
                                )}
                              />
                            </TableCell>
                          );
                        })}
                        <TableCell className="px-2 py-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRecords((prev) => prev.filter((r) => r.id !== record.id));
                            }}
                            className="h-7 w-7 hover:bg-destructive/15 hover:text-destructive"
                            title="Remove record"
                          >
                            <Icons.trash className="h-3.5 w-3.5" />
                            <span className="sr-only">Remove record</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-1 p-8 text-center">
                  <p className="text-[13px] font-medium">No records extracted yet</p>
                  <p className="max-w-sm text-xs text-muted-foreground">
                    {files.length === 0
                      ? 'Add scanned case documents to begin.'
                      : 'Run extraction to read the documents. Extracted records appear here for review.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: source document preview */}
          <div className="hidden min-h-0 flex-col bg-background lg:flex">
            <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
              <div className="min-w-0">
                <p className="eyebrow">Source document</p>
                <p className="truncate text-xs text-muted-foreground" title={previewFile?.file.name}>
                  {previewFile?.file.name ?? 'None selected'}
                </p>
              </div>
              {previewFile && (
                <a
                  href={previewFile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Open
                  <Icons.externalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-3">
              {!previewFile ? (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  Select a document or record to view the original.
                </div>
              ) : previewFile.file.type === 'application/pdf' ? (
                <object data={previewFile.url} type="application/pdf" className="h-full w-full rounded-sm">
                  <p className="p-4 text-xs text-muted-foreground">PDF preview is not available in this browser.</p>
                </object>
              ) : (
                <img
                  src={previewFile.url}
                  alt={`Scan of ${previewFile.file.name}`}
                  className="w-full rounded-sm border object-contain"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {records.length > 0 ? (
              <>
                {selectedCount} of {records.length} records selected
                {uncertainCount > 0 && (
                  <span className="text-warning">
                    {' '}· {uncertainCount} highlighted field{uncertainCount === 1 ? '' : 's'} to verify
                  </span>
                )}
              </>
            ) : (
              'Records are added to the open dataset. Use Save to Cloud afterwards to keep them.'
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={isExtracting}>
              Close
            </Button>
            <Button size="sm" onClick={importSelected} disabled={isExtracting || selectedCount === 0}>
              <Icons.plus />
              Add {selectedCount} record{selectedCount === 1 ? '' : 's'} to dataset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FileStatusIcon({ status }: { status: QueuedFile['status'] }) {
  if (status === 'processing') return <Icons.spinner className="h-4 w-4 shrink-0 animate-spin text-primary" />;
  if (status === 'done') return <Icons.check className="h-4 w-4 shrink-0 text-success" />;
  if (status === 'error') return <Icons.alertTriangle className="h-4 w-4 shrink-0 text-destructive" />;
  return <Icons.file className="h-4 w-4 shrink-0 text-muted-foreground" />;
}
