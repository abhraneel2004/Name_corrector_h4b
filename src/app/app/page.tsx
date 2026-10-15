'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { auditDataForIndianNames } from '@/ai/flows/audit-data-for-indian-names';
import { provideDataAuditSummary } from '@/ai/flows/provide-data-audit-summary';
import { suggestDataCorrections } from '@/ai/flows/suggest-data-corrections';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { SignIn } from '@/components/sign-in';
import { Loading } from '@/components/loading';
import { NavBar } from '@/components/navbar';
import { VerifyEmail } from '@/components/verify-email';
import { OcrImport, type ImportedOcrRecord } from '@/components/ocr-import';
import { OCR_FIELDS } from '@/lib/ocr';
import { authFetch } from '@/lib/auth-fetch';
import { toCsv } from '@/lib/csv';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Define a type for the data, each key is a string, and value can be a string or number
type Data = Record<string, string>;

// Define the expected CSV columns
const EXPECTED_HEADERS = [
  "Case Title",
  "Date",
  "Accused First Name",
  "Accused Last Name",
  "Crime",
  "Accused Status",
  "Criminal Location",
  "Police Station",
  "Inspector In charge",
  "Last Audit Date",
  "Last Audit By",
  "Last Audit Status",
  "Last Audit Remarks",
  "Last Audit Location"
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<Data[]>([]);
  const [filename, setFilename] = useState<string>('');
  const [filesize, setFilesize] = useState<number>(0);
  const [modified, setModified] = useState<boolean>(false);
  const [auditResults, setAuditResults] = useState<string>('');
  const [auditSummary, setAuditSummary] = useState<string>('');
  const [dataCorrections, setDataCorrections] = useState<string>('');
  const [correctionTable, setCorrectionTable] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  // Tracked separately because Firebase updates emailVerified on the same user object
  const [emailVerified, setEmailVerified] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [firebaseApp, setFirebaseApp] = useState<any>(null);
  const [firebaseConfig, setFirebaseConfig] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null);
  const [db, setDb] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // RAG states
  const [queryInput, setQueryInput] = useState<string>('');
  const [queryResult, setQueryResult] = useState<string>('');
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [aiSectionOpen, setAiSectionOpen] = useState(true);
  const [auditSectionOpen, setAuditSectionOpen] = useState(true);
  const [correctionSectionOpen, setCorrectionSectionOpen] = useState(true);
  // Error state for handling errors
  const [error, setError] = useState<{
    title: string,
    message: string,
    variant?: "default" | "destructive" | "success"
  } | null>(null);

  const { toast } = useToast();

  // Effect to handle errors and show toasts
  useEffect(() => {
    if (error) {
      toast({
        title: error.title,
        description: error.message,
        variant: error.variant || 'destructive',
      });
      setError(null);
    }
  }, [error, toast]);

  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Firebase only after component mounts
  useEffect(() => {
    if (!mounted) return;

    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    setFirebaseConfig(config);

    if (!firebaseApp && config.apiKey) {
      try {
        const app = initializeApp(config);
        setFirebaseApp(app);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);
        setAuth(authInstance);
        setDb(dbInstance);
        console.log('Firebase initialized');
      } catch (error) {
        console.error('Error initializing Firebase:', error);
      }
    }
  }, [mounted]);

  // Memoize loadFiles to prevent recreation on every render
  const loadFiles = useCallback(async (userId: string) => {
    if (!db) {
      console.error('Firestore not initialized');
      return;
    }
    try {
      const filesCollection = collection(db, `users/${userId}/files`);
      const filesSnapshot = await getDocs(filesCollection);
      const filesList = filesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUploadedFiles(filesList);
    } catch (error: any) {
      setError({
        title: 'Error loading files',
        message: error.message
      });
      console.error('Error loading files:', error);
    }
  }, [db, setError]);

  // Set up auth state listener after Firebase is initialized
  useEffect(() => {
    if (!mounted || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        setEmailVerified(authUser.emailVerified);
        // Firestore only serves verified accounts
        if (authUser.emailVerified) await loadFiles(authUser.uid);
      } else {
        setUser(null);
        setEmailVerified(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [mounted, auth, loadFiles, db]);

  const handleFileUpload = async (file: File) => {
    setFilename(file.name);
    setFilesize(file.size);

    const reader = new FileReader();

    reader.onload = async (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        try {
          // Split by newlines and handle different line ending formats
          const rows = result.split(/\r?\n/);

          // Get headers from the first row
          const headerLine = rows[0];
          const headers = parseCSVLine(headerLine);

          console.log("File headers:", headers);

          // Validate headers against expected structure
          const missingHeaders = EXPECTED_HEADERS.filter(
            header => !headers.includes(header)
          );

          if (missingHeaders.length > 0) {
            setError({
              title: 'CSV format error',
              message: `Missing expected headers: ${missingHeaders.join(', ')}`
            });
            // Continue anyway, but show the warning
          }

          // Parse data rows
          const parsedData: Data[] = [];
          for (let i = 1; i < rows.length; i++) {
            if (rows[i].trim() === '') continue; // Skip empty rows

            const values = parseCSVLine(rows[i]);
            const rowData: Data = {};

            // Map values to headers
            headers.forEach((header, index) => {
              rowData[header] = values[index] || '';
            });

            // Only add row if it has at least one non-empty value
            if (Object.values(rowData).some(value => value !== '')) {
              parsedData.push(rowData);
            }
          }

          // Set the parsed data to state
          setData(parsedData);

          // Upload file details to Firestore
          await uploadFileToFirestore(user.uid, file.name, file.size, result);
          toast({
            title: 'File uploaded successfully',
            description: `${file.name} has been uploaded and parsed.`,
            variant: 'success',
          });
          await loadFiles(user.uid); // Reload files after upload

        } catch (error: any) {
          setError({
            title: 'Error processing file',
            message: error.message || 'An unexpected error occurred while processing the file'
          });
          console.error('Error processing file:', error);
        }
      }
    };
    reader.readAsText(file);
  };

  // Helper function to parse CSV lines, handling quoted values correctly
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        // A doubled quote inside a quoted field is a literal quote
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Don't forget the last field
    result.push(current.trim());

    return result;
  };

  const uploadFileToFirestore = async (userId: string, fileName: string, fileSize: number, fileData: string) => {
    if (!db) {
      console.error('Firestore not initialized');
      throw new Error('Database not initialized. Please try again later.');
    }

    try {
      console.log(`Uploading file to Firestore: ${fileName} (${fileSize} bytes) for user ${userId}`);

      // Check if a file with the same name already exists
      const filesCollection = collection(db, `users/${userId}/files`);
      const querySnapshot = await getDocs(filesCollection);

      // Find files with the same name
      const existingFiles = querySnapshot.docs.filter(doc =>
        doc.data().name === fileName
      );

      // If file exists with the same name, update it instead of adding a new one
      if (existingFiles.length > 0) {
        const fileDoc = existingFiles[0];
        await updateDoc(doc(db, `users/${userId}/files/${fileDoc.id}`), {
          size: fileSize,
          data: fileData,
          uploadedAt: new Date(),
        });
        console.log(`Updated existing file with ID: ${fileDoc.id}`);
        return fileDoc.id;
      }

      // Otherwise, add as a new file
      const docRef = await addDoc(filesCollection, {
        name: fileName,
        size: fileSize,
        data: fileData,
        uploadedAt: new Date(),
      });

      console.log(`Added new file with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error: any) {
      console.error('Error in uploadFileToFirestore:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  };

  const handleSignOut = () => {
    if (!auth) {
      console.error('Auth not initialized');
      return;
    }
    signOut(auth)
      .then(() => {
        console.log('Signed out successfully');
        setUser(null);
        setUploadedFiles([]);
        toast({
          title: 'Signed out',
          description: 'You have been signed out.',
          variant: 'success',
        });
      })
      .catch((error) => {
        console.error('Error signing out:', error);
        toast({
          title: 'Sign out error',
          description: error.message,
          variant: 'destructive',
        });
      });
  };

  const handleCellChange = (index: number, key: string, value: string) => {
    setData(prevData => {
      const newData = [...prevData];
      newData[index][key] = value;
      setModified(true);
      return newData;
    });
  };

  const handleDeleteRow = (index: number) => {
    // Use the browser's built-in confirmation dialog instead of trying to use AlertDialog as a function
    if (confirm('Are you sure you want to delete this row?')) {
      setData(prevData => {
        const newData = [...prevData];
        newData.splice(index, 1);
        setModified(true);
        return newData;
      });
    }
  };

  const handleSend = () => {
    setModified(false);
    toast({
      title: 'Changes saved',
      description: 'Edits kept in this session. Use Save to Cloud to store them.',
    });
  };

  // Function to handle uploading the current table data to Firestore
  const handleUploadCurrentData = async () => {
    // Make sure we have data to upload
    if (data.length === 0) {
      toast({
        title: 'No data to upload',
        description: 'Please load or create data first.',
        variant: 'destructive',
      });
      return;
    }

    // Show loading toast immediately
    toast({
      title: 'Preparing data...',
      description: 'Getting ready to save your changes.',
    });

    try {
      // Verify prerequisites
      if (!db) {
        throw new Error('Database not initialized. Please try again later.');
      }

      if (!user || !user.uid) {
        throw new Error('You need to be logged in to upload files.');
      }

      // Generate the filename with timestamp to avoid conflicts
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = filename ?
        `${filename.replace(/\.[^/.]+$/, '')}_updated_${timestamp}.csv` :
        `data_export_${timestamp}.csv`;

      // Convert data to CSV format (quoted and safe against formula injection)
      const csvContent = toCsv(data);

      // Show uploading toast
      toast({
        title: 'Uploading to cloud...',
        description: 'Please wait while your data is being saved.',
      });

      // Upload to Firestore
      const fileId = await uploadFileToFirestore(
        user.uid,
        fileName,
        csvContent.length,
        csvContent
      );

      // Update local state variables
      setFilename(fileName);
      setFilesize(csvContent.length);
      setModified(false); // Reset modified flag

      // Refresh the file list
      await loadFiles(user.uid);

      // Show success toast
      toast({
        title: 'Upload successful!',
        description: `Data saved as "${fileName}"`,
        variant: 'success',
      });

      return fileId;
    } catch (error: any) {
      console.error('Upload failed:', error);

      // Show error toast
      toast({
        title: 'Upload failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });

      return null;
    }
  };

  // Function to hide the current data table
  const handleHideData = () => {
    if (data.length === 0) return;

    setData([]);
    setFilename('');
    setFilesize(0);
    setModified(false);
    setAuditResults('');
    setAuditSummary('');
    setDataCorrections('');
    setCorrectionTable([]);

    toast({
      title: 'Data hidden',
      description: 'The data table has been cleared.',
    });
  };

  // Function to download the current data as CSV
  const handleDownloadData = () => {
    if (data.length === 0) {
      toast({
        title: 'No data to download',
        description: 'Please load or create data first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Convert data to CSV format (quoted and safe against formula injection)
      const csvContent = toCsv(data);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      const downloadFilename = filename ?
        filename.replace(/\.[^/.]+$/, '') + '_updated.csv' :
        `data_export_${new Date().toISOString().split('T')[0]}.csv`;

      link.href = url;
      link.setAttribute('download', downloadFilename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Download started',
        description: `Downloading ${downloadFilename}`,
        variant: 'success',
      });
    } catch (error: any) {
      toast({
        title: 'Download failed',
        description: error.message,
        variant: 'destructive',
      });
      console.error('Error downloading data:', error);
    }
  };

  const handleAuditData = async () => {
    setLoadingAudit(true);
    try {
      // Convert data to the format expected by auditDataForIndianNames
      const auditInput = { data: data };
      const idToken = await user.getIdToken();
      const auditOutput = await auditDataForIndianNames(auditInput, idToken);
      if (auditOutput.limitMessage) {
        setError({ title: 'Audit limit reached', message: auditOutput.limitMessage });
        return;
      }
      setAuditResults(JSON.stringify(auditOutput, null, 2));

      // Get audit summary
      const summaryInput = { auditResults: JSON.stringify(auditOutput, null, 2) };
      const summaryOutput = await provideDataAuditSummary(summaryInput, idToken);
      setAuditSummary(summaryOutput.summary);

      // Extract names for corrections from specific columns
      const nameColumns = ['Accused First Name', 'Accused Last Name', 'Inspector In charge'];
      const namesArray: string[] = [];

      // Extract names from the data
      data.forEach(row => {
        nameColumns.forEach(col => {
          if (row[col] && row[col].trim()) {
            namesArray.push(row[col]);
          }
        });
      });

      // Get data corrections with the names array
      const correctionsInput = { names: namesArray };
      const correctionsOutput = await suggestDataCorrections(correctionsInput, idToken);

      // Process corrections output
      let correctionsText = "Name correction suggestions:\n\n";
      correctionsOutput.correctionResults.forEach(correction => {
        if (correction.hasCorrection) {
          correctionsText += `- "${correction.originalName}" should be "${correction.suggestedName}" (${correction.reason || 'No specific reason provided'})\n`;
        }
      });

      setDataCorrections(correctionsText);

      // Create a correction table compatible with the existing UI
      const correctionTableData = correctionsOutput.correctionResults
        .filter(item => item.hasCorrection)
        .map(item => {
          // Find the row and column for this name
          let row = 0;
          let column = '';

          // Search through data to find the matching name
          data_loop:
          for (let i = 0; i < data.length; i++) {
            for (const col of nameColumns) {
              if (data[i][col] === item.originalName) {
                row = i + 1; // Convert to 1-indexed
                column = col;
                break data_loop;
              }
            }
          }

          return {
            row: row,
            column: column,
            originalValue: item.originalName,
            suggestedValue: item.suggestedName,
            reason: item.reason || 'Spelling or formatting correction'
          };
        })
        .filter(item => item.row > 0 && item.column); // Only include items where we found the row and column

      setCorrectionTable(correctionTableData);

      // Update Last Audit fields when corrections are applied
      if (correctionTableData.length > 0) {
        const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

        setData(prevData => {
          const newData = [...prevData];
          correctionTableData.forEach(correction => {
            if (correction.row > 0) {
              const rowIndex = correction.row - 1;
              if (rowIndex < newData.length) {
                // Update audit metadata
                newData[rowIndex]["Last Audit Date"] = currentDate;
                newData[rowIndex]["Last Audit By"] = user?.email || "Anonymous User";
                newData[rowIndex]["Last Audit Status"] = "Corrected";
                newData[rowIndex]["Last Audit Remarks"] = `Corrected "${correction.originalValue}" to "${correction.suggestedValue}"`;
                newData[rowIndex]["Last Audit Location"] = correction.column;
              }
            }
          });
          return newData;
        });
      }

    } catch (error: any) {
      // Use setError instead of directly calling toast
      // Production builds hide server action errors, so explain the likely causes
      const detail = String(error?.message ?? '');
      setError({
        title: 'Error auditing data',
        message: /429|quota/i.test(detail)
          ? 'The AI service quota has been used up. Try again later or contact your administrator.'
          : /503|high demand|overloaded/i.test(detail)
            ? 'The AI service is busy. Try again in a minute.'
            : 'The audit could not be completed. Try again, and contact your administrator if it keeps failing.'
      });

      setAuditResults('Error during audit.');
      setAuditSummary('Error during audit.');
      setDataCorrections('Error during audit.');
      setCorrectionTable([]);
    } finally {
      setLoadingAudit(false);
    }
  };

  // Apply a single correction with audit metadata update
  const applyCorrection = useCallback((correction: any) => {
    if (correction?.row && correction?.column) {
      setData(prevData => {
        const newData = [...prevData];
        const rowIndex = correction.row - 1; // Convert from 1-indexed to 0-indexed

        if (rowIndex >= 0 && rowIndex < newData.length) {
          // Apply the correction
          newData[rowIndex][correction.column] = correction.suggestedValue;

          // Update audit metadata
          const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
          newData[rowIndex]["Last Audit Date"] = currentDate;
          newData[rowIndex]["Last Audit By"] = user?.email || "Anonymous User";
          newData[rowIndex]["Last Audit Status"] = "Corrected";
          newData[rowIndex]["Last Audit Remarks"] = `Corrected "${correction.originalValue}" to "${correction.suggestedValue}"`;
          newData[rowIndex]["Last Audit Location"] = correction.column;

          setModified(true);
        }

        return newData;
      });

      // Show toast directly
      toast({
        title: 'Correction applied',
        description: `Changed "${correction.originalValue}" to "${correction.suggestedValue}"`,
        variant: 'success',
      });
    }
  }, [user?.email, toast]);

  // Apply all corrections at once with audit metadata updates
  const applyAllCorrections = useCallback(() => {
    if (correctionTable.length === 0) return;

    setData(prevData => {
      const newData = [...prevData];
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      correctionTable.forEach(correction => {
        const rowIndex = correction.row - 1; // Convert from 1-indexed to 0-indexed
        if (rowIndex >= 0 && rowIndex < newData.length) {
          // Apply the correction
          newData[rowIndex][correction.column] = correction.suggestedValue;

          // Update audit metadata
          newData[rowIndex]["Last Audit Date"] = currentDate;
          newData[rowIndex]["Last Audit By"] = user?.email || "Anonymous User";
          newData[rowIndex]["Last Audit Status"] = "Corrected";
          newData[rowIndex]["Last Audit Remarks"] = `Corrected "${correction.originalValue}" to "${correction.suggestedValue}"`;
          newData[rowIndex]["Last Audit Location"] = correction.column;
        }
      });

      setModified(true);

      return newData;
    });

    // Show toast directly
    toast({
      title: 'All corrections applied',
      description: `Applied ${correctionTable.length} name corrections`,
      variant: 'success',
    });
  }, [correctionTable, user?.email, toast]);

  // Append records extracted from scanned documents to the open dataset
  const handleOcrImport = useCallback((records: ImportedOcrRecord[]) => {
    if (records.length === 0) return;

    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const headers = data.length > 0 ? Object.keys(data[0]) : EXPECTED_HEADERS;

    const newRows: Data[] = records.map(record => {
      const row: Data = Object.fromEntries(headers.map(header => [header, '']));
      OCR_FIELDS.forEach(field => {
        if (field.header in row) row[field.header] = record[field.key];
      });

      // Record provenance in the audit columns so imported rows can be traced and verified
      const uncertainHeaders = OCR_FIELDS
        .filter(field => record.uncertainFields.includes(field.key))
        .map(field => field.header);
      const remarks = [
        `OCR import from ${record.sourceFile}`,
        uncertainHeaders.length > 0 ? `Verify: ${uncertainHeaders.join('; ')}` : '',
        record.nameAsWritten ? `Name as written: ${record.nameAsWritten}` : '',
      ].filter(Boolean).join('. ');
      const audit: Data = {
        "Last Audit Date": currentDate,
        "Last Audit By": user?.email || "Anonymous User",
        "Last Audit Status": uncertainHeaders.length > 0 ? "Needs verification" : "Imported via OCR",
        "Last Audit Remarks": remarks,
        "Last Audit Location": "Document scan",
      };
      Object.entries(audit).forEach(([header, value]) => {
        if (header in row) row[header] = value;
      });
      return row;
    });

    setData(prevData => [...prevData, ...newRows]);
    if (!filename) setFilename(`ocr_import_${currentDate}.csv`);
    setModified(true);

    toast({
      title: 'Records added',
      description: `${newRows.length} record(s) added from scanned documents. Use Save to Cloud to keep them.`,
      variant: 'success',
    });
  }, [data, filename, user?.email, toast]);

  // Expected headers first, then any additional headers from the file
  const getOrderedHeaders = () => {
    if (data.length === 0) return [];
    const availableHeaders = Object.keys(data[0]);
    return [
      ...EXPECTED_HEADERS.filter(header => availableHeaders.includes(header)),
      ...availableHeaders.filter(header => !EXPECTED_HEADERS.includes(header))
    ];
  };

  // Render table headers with the expected order
  const renderTableHeaders = () => {
    if (data.length === 0) return null;
    const orderedHeaders = getOrderedHeaders();

    return (
      <TableHeader className="sticky top-0 z-20 bg-card [&_tr]:border-b">
        <TableRow className="hover:bg-transparent">
          <TableHead className="sticky left-0 z-10 w-12 bg-card text-right">#</TableHead>
          {orderedHeaders.map((header) => (
            <TableHead key={header} className="whitespace-nowrap min-w-[160px]">
              {header}
            </TableHead>
          ))}
          <TableHead className="sticky right-0 z-10 w-14 border-l bg-card text-center">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
    );
  };

  // Render table rows with the expected order
  const renderTableRows = () => {
    if (data.length === 0) return null;
    const orderedHeaders = getOrderedHeaders();

    return data.map((row, rowIndex) => (
      <TableRow key={rowIndex} className="group hover:bg-muted">
        <TableCell className="sticky left-0 z-10 bg-card py-1 text-right font-mono text-[11px] text-muted-foreground group-hover:bg-muted">
          {rowIndex + 1}
        </TableCell>
        {orderedHeaders.map((header) => (
          <TableCell key={header} className="min-w-[160px] px-1.5 py-1">
            <Input
              value={row[header] || ''}
              onChange={(e) => handleCellChange(rowIndex, header, e.target.value)}
              className="h-8 w-full border-transparent bg-transparent px-1.5 text-[13px] hover:border-input focus-visible:bg-background"
            />
          </TableCell>
        ))}
        <TableCell className="sticky right-0 z-10 border-l bg-card px-2 py-1 text-center group-hover:bg-muted">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteRow(rowIndex)}
            className="h-7 w-7 hover:bg-destructive/15 hover:text-destructive"
            title="Delete row"
          >
            <Icons.trash className="h-3.5 w-3.5" />
            <span className="sr-only">Delete row</span>
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  // const handleSubmit = async (e: React.FormEvent) => { // Removed for rollback
  //   e.preventDefault();
  //   setLoading(true);
  //   // Simulate API call
  //   await new Promise(resolve => setTimeout(resolve, 1500));
  //   setResult(`Corrected name: ${name}`);
  //   setLoading(false);
  // };

  // Function to load a file from the uploaded files list
  const handleLoadFile = async (fileId: string) => {
    if (!db || !user) {
      setError({
        title: 'Error',
        message: 'Database or user not initialized.'
      });
      return;
    }

    try {
      // Get the file document
      const fileDoc = await getDoc(doc(db, `users/${user.uid}/files/${fileId}`));

      if (!fileDoc.exists()) {
        setError({
          title: 'File not found',
          message: 'The selected file could not be found.'
        });
        return;
      }

      const fileData = fileDoc.data();
      setFilename(fileData.name);
      setFilesize(fileData.size);

      // Parse the CSV data
      const csvData = fileData.data;
      const rows = csvData.split(/\r?\n/);

      // Get headers from the first row
      const headerLine = rows[0];
      const headers = parseCSVLine(headerLine);

      // Parse data rows
      const parsedData: Data[] = [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].trim() === '') continue; // Skip empty rows

        const values = parseCSVLine(rows[i]);
        const rowData: Data = {};

        // Map values to headers
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });

        // Only add row if it has at least one non-empty value
        if (Object.values(rowData).some(value => value !== '')) {
          parsedData.push(rowData);
        }
      }

      // Set the parsed data to state
      setData(parsedData);
      setModified(false);

      toast({
        title: 'File loaded',
        description: `${fileData.name} has been loaded.`,
        variant: 'success',
      });
    } catch (error: any) {
      console.error('Error loading file:', error);
      setError({
        title: 'Error loading file',
        message: error.message || 'Failed to load the file'
      });
    }
  };

  // Function to test Firebase connection
  const testFirebaseConnection = useCallback(async () => {
    setError({
      title: 'Testing Firebase connection...',
      message: 'Please check console for details.'
    });

    console.log("==== FIREBASE CONNECTION TEST ====");
    console.log("Firebase App initialized:", !!firebaseApp);
    console.log("Auth instance:", !!auth);
    console.log("Firestore instance:", !!db);
    console.log("Current user:", user ? `User ID: ${user.uid}` : "No user logged in");

    if (!db || !user) {
      console.error("Firebase not properly initialized or user not logged in");
      setError({
        title: 'Firebase connection failed',
        message: 'Please check console for details.'
      });
      return;
    }

    try {
      // Create a test document
      const testCollection = collection(db, `users/${user.uid}/tests`);
      const testDoc = await addDoc(testCollection, {
        timestamp: new Date(),
        message: "Firebase connection test"
      });

      console.log("Test document created:", testDoc.id);

      // Delete the test document
      await deleteDoc(doc(db, `users/${user.uid}/tests/${testDoc.id}`));

      console.log("Test document deleted");

      toast({
        title: 'Firebase connection successful',
        description: 'Successfully created and deleted a test document.',
        variant: 'success',
      });
    } catch (error: any) {
      console.error("Firebase test failed:", error);
      setError({
        title: 'Firebase test failed',
        message: error.message || 'An error occurred while testing the connection.'
      });
    }
  }, [db, user, firebaseConfig, firebaseApp, auth]);

  // Function to delete a file with confirmation
  const handleDeleteFile = async (fileId: string, fileName: string) => {
    // Show confirmation dialog
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return; // User cancelled
    }

    if (!db || !user) {
      toast({
        title: 'Error',
        description: 'Database or user not initialized.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Show loading toast
      toast({
        title: 'Deleting file...',
        description: `Removing "${fileName}" from your files.`,
      });

      // Delete the file document from Firestore
      await deleteDoc(doc(db, `users/${user.uid}/files/${fileId}`));

      // Update the uploaded files list
      setUploadedFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));

      toast({
        title: 'File deleted',
        description: `"${fileName}" has been removed from your files.`,
      });

      // If the currently loaded file was deleted, clear the data view
      if (filename === fileName) {
        setData([]);
        setFilename('');
        setFilesize(0);
        setModified(false);
        setAuditResults('');
        setAuditSummary('');
        setDataCorrections('');
        setCorrectionTable([]);
      }
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error deleting file',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Function to handle RAG queries using Gemini
  const handleRagQuery = async () => {
    if (!queryInput.trim()) {
      setError({
        title: 'Empty query',
        message: 'Please enter a question about your data.'
      });
      return;
    }

    if (data.length === 0) {
      setError({
        title: 'No data available',
        message: 'Please load data before asking questions.'
      });
      return;
    }

    setIsQuerying(true);
    setQueryResult('');

    // Maximum number of retries
    const maxRetries = 2;
    let retries = 0;
    let success = false;

    while (retries <= maxRetries && !success) {
      try {
        // Reduce the size of the context if retrying due to rate limit
        const maxContextItems = retries === 0 ? data.length : Math.floor(data.length / (retries + 1));
        const contextData = data.slice(0, maxContextItems);

        // Convert data to context for the RAG query
        const dataContext = JSON.stringify(contextData);

        // Create a prompt for Gemini
        const prompt = `
You are an AI assistant that helps analyze police records data. 
Answer the following question based only on the data provided.

DATA CONTEXT:
${dataContext}

USER QUESTION: ${queryInput}

Provide a clear, accurate, and concise answer based only on the provided data. 
If the answer cannot be determined from the data, say so.
`;

        // Call Gemini through the authenticated server route so the API key stays on the server
        const response = await authFetch('/api/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt,
            maxOutputTokens: Math.min(2048, 1024 + (retries * 256)), // Reduce tokens on retries
          })
        });

        if (!response.ok) {
          // The server explains quota, overload and auth failures
          const { error: serverMessage } = await response.json().catch(() => ({ error: '' }));
          throw new Error(serverMessage || `API request failed with status ${response.status}`);
        }

        const responseData = await response.json();

        if (responseData.candidates && responseData.candidates[0]?.content?.parts[0]?.text) {
          setQueryResult(responseData.candidates[0].content.parts[0].text);
          success = true;
        } else {
          setQueryResult('Failed to get a response from the AI. Please try again.');
        }
      } catch (error: any) {
        console.error(`Error in RAG query (attempt ${retries + 1}):`, error);

        if (error.message.includes('429') || error.message.includes('Rate limit')) {
          // If this is not the last retry
          if (retries < maxRetries) {
            // Wait before retrying with exponential backoff
            const backoffTime = Math.pow(2, retries) * 1000;
            setQueryResult(`The AI service is busy. Retrying in ${backoffTime / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
            retries++;
          } else {
            setQueryResult(
              `The AI service is currently experiencing high demand. Please try again later with a simpler question or fewer records.
              
Suggested actions:
1. Try a more specific question
2. Reduce the amount of data you're analyzing
3. Wait a few minutes before trying again`
            );

            setError({
              title: 'Rate limit reached',
              message: 'The AI service is currently busy. Please try again later.'
            });
          }
        } else {
          // For other errors, don't retry
          setQueryResult(`Error: ${error.message || 'An unexpected error occurred. Please try again.'}`);
          setError({
            title: 'Query failed',
            message: error.message || 'An unexpected error occurred'
          });
          break;
        }
      }
    }

    setIsQuerying(false);
  };

  // Show loading state while checking authentication
  if (!mounted || loading) {
    return <Loading />;
  }

  // Show sign-in page if not authenticated
  if (!user) {
    return <SignIn />;
  }

  // Accounts are open to anyone, so the console requires a verified email address
  if (!emailVerified) {
    return (
      <VerifyEmail
        user={user}
        onSignOut={handleSignOut}
        onVerified={() => {
          setEmailVerified(true);
          loadFiles(user.uid);
        }}
      />
    );
  }

  const activeFileSizeKb = (filesize / 1024).toFixed(1);
  const datasetStatus = modified
    ? { label: 'Unsaved changes', tone: 'bg-warning' }
    : data.length > 0
      ? { label: 'In sync', tone: 'bg-success' }
      : { label: 'Idle', tone: 'bg-muted-foreground' };

  return (
    <div className="flex flex-col">
      <NavBar
        user={user}
        onSignOut={handleSignOut}
        subtitle="Case record audit and name standardisation"
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-4 px-4 py-6 sm:px-6">
        {/* Page heading */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">Case Records</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Upload, review and audit accused and officer names across case files.
          </p>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border lg:grid-cols-4">
          <StatTile
            label="Records loaded"
            value={data.length.toLocaleString()}
            detail={filename || 'No dataset loaded'}
          />
          <StatTile
            label="Files in repository"
            value={uploadedFiles.length.toLocaleString()}
            detail="Stored in secure cloud"
          />
          <StatTile
            label="Corrections pending"
            value={correctionTable.length.toLocaleString()}
            detail={auditSummary ? 'From last audit run' : 'Run an audit to generate'}
            valueClassName={correctionTable.length > 0 ? 'text-warning' : undefined}
          />
          <StatTile
            label="Dataset status"
            value={
              <span className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${datasetStatus.tone}`} />
                {datasetStatus.label}
              </span>
            }
            detail={data.length > 0 ? `${activeFileSizeKb} KB` : '—'}
            valueClassName="text-base"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Left Panel: File Upload and List */}
          <Card className="flex flex-col">
            <PanelHeader
              eyebrow="Repository"
              title="Case Files"
              actions={
                <Badge variant="outline" className="font-mono text-muted-foreground">
                  {uploadedFiles.length}
                </Badge>
              }
            />
            <CardContent className="flex flex-1 flex-col gap-4">
              <label
                htmlFor="file-upload"
                className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-input bg-background px-4 py-5 text-center transition-colors hover:border-primary/60 hover:bg-accent/40"
              >
                <Icons.upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-[13px] font-medium">Upload CSV</span>
                <span className="text-[11px] text-muted-foreground">Case record export, {EXPECTED_HEADERS.length} columns</span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                  className="sr-only"
                />
              </label>

              <OcrImport onImport={handleOcrImport} />

              <div className="flex-1">
                {uploadedFiles.length > 0 ? (
                  <ul className="-mx-2 max-h-[360px] space-y-0.5 overflow-y-auto">
                    {uploadedFiles.map((file) => {
                      const isActive = file.name === filename;
                      return (
                        <li
                          key={file.id}
                          className={`group flex items-center gap-2 rounded-md border px-2 py-1.5 transition-colors ${isActive ? 'border-primary/40 bg-primary/10' : 'border-transparent hover:bg-accent/50'}`}
                        >
                          <Icons.fileSpreadsheet className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                          <button
                            type="button"
                            onClick={() => handleLoadFile(file.id)}
                            className="min-w-0 flex-1 text-left"
                            title={file.name}
                          >
                            <span className="block truncate text-[13px]">{file.name}</span>
                            {typeof file.size === 'number' && (
                              <span className="block font-mono text-[11px] text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB
                              </span>
                            )}
                          </button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteFile(file.id, file.name)}
                            className="h-7 w-7 shrink-0 opacity-60 hover:bg-destructive/15 hover:text-destructive hover:opacity-100"
                            title="Delete file"
                          >
                            <Icons.trash className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete file</span>
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="py-6 text-center text-xs text-muted-foreground">No files in repository.</p>
                )}
              </div>

              {/* Debug button - only in development */}
              {process.env.NODE_ENV === 'development' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={testFirebaseConnection}
                  className="w-full justify-start text-[11px]"
                >
                  <Icons.server />
                  Test Firebase connection
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Center Panel: Data Table and Actions */}
          <Card className="flex min-w-0 flex-col">
            <div className="flex flex-col gap-3 border-b p-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <p className="eyebrow">Records</p>
                <div className="mt-1 flex items-center gap-2">
                  <h2 className="truncate text-sm font-semibold">{filename || 'No dataset loaded'}</h2>
                  {modified && (
                    <Badge variant="outline" className="border-warning/40 text-warning">Modified</Badge>
                  )}
                </div>
                {data.length > 0 && (
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {data.length} records · {getOrderedHeaders().length} fields · {activeFileSizeKb} KB
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={handleAuditData} disabled={data.length === 0 || loadingAudit} size="sm">
                  {loadingAudit ? (
                    <>
                      <Icons.spinner className="animate-spin" />
                      Auditing…
                    </>
                  ) : (
                    <>
                      <Icons.shieldCheck />
                      Run Audit
                    </>
                  )}
                </Button>
                <Button onClick={handleSend} disabled={!modified} variant="secondary" size="sm">
                  Save Changes
                </Button>
                <Button onClick={handleUploadCurrentData} disabled={data.length === 0} variant="outline" size="sm">
                  <Icons.save />
                  Save to Cloud
                </Button>
                <Button onClick={handleDownloadData} disabled={data.length === 0} variant="outline" size="sm">
                  <Icons.download />
                  Export
                </Button>
                {data.length > 0 && (
                  <Button onClick={handleHideData} variant="ghost" size="icon" className="h-8 w-8" title="Close dataset">
                    <Icons.close />
                    <span className="sr-only">Close dataset</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1">
              {data.length > 0 ? (
                <Table containerClassName="max-h-[560px]">
                  {renderTableHeaders()}
                  <TableBody>{renderTableRows()}</TableBody>
                </Table>
              ) : (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 p-8 text-center">
                  <div className="rounded-md border bg-background p-3">
                    <Icons.database className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-[13px] font-medium">No dataset loaded</p>
                  <p className="max-w-sm text-xs text-muted-foreground">
                    Upload a CSV export, scan handwritten case documents, or open a file from the repository to review and audit case records.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Data Analysis with RAG */}
        <Collapsible open={aiSectionOpen} onOpenChange={setAiSectionOpen}>
          <Card>
            <PanelHeader
              eyebrow="Analyst Query"
              title="Ask about this dataset"
              description="Natural-language questions answered from the loaded records only."
              actions={<CollapseToggle open={aiSectionOpen} />}
            />
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Icons.search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={data.length === 0 ? 'Load a dataset to enable queries' : 'e.g. How many accused are absconding, by police station?'}
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                      disabled={isQuerying || data.length === 0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleRagQuery();
                        }
                      }}
                      className="pl-9"
                    />
                  </div>
                  <Button
                    onClick={handleRagQuery}
                    disabled={isQuerying || data.length === 0 || !queryInput.trim()}
                  >
                    {isQuerying ? (
                      <>
                        <Icons.spinner className="animate-spin" />
                        Analysing…
                      </>
                    ) : (
                      <>
                        Submit
                        <Icons.arrowRight />
                      </>
                    )}
                  </Button>
                </div>

                {queryResult && (
                  <div className="rounded-md border bg-background">
                    <div className="border-b px-4 py-2">
                      <span className="eyebrow">Response</span>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto whitespace-pre-wrap px-4 py-3 text-[13px] leading-relaxed">
                      {queryResult}
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Audit Results Section */}
        {(auditResults || auditSummary || dataCorrections) && (
          <Collapsible open={auditSectionOpen} onOpenChange={setAuditSectionOpen}>
            <Card>
              <PanelHeader
                eyebrow="Audit"
                title="Audit Results"
                description="Output of the most recent name audit run."
                actions={<CollapseToggle open={auditSectionOpen} />}
              />
              <CollapsibleContent>
                <CardContent>
                  <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border bg-border lg:grid-cols-3">
                    <ReportPane title="Summary">{auditSummary}</ReportPane>
                    <ReportPane title="Correction Suggestions">{dataCorrections}</ReportPane>
                    <ReportPane title="Raw Output" mono>{auditResults}</ReportPane>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Name Corrections Table */}
        {correctionTable.length > 0 && (
          <Collapsible open={correctionSectionOpen} onOpenChange={setCorrectionSectionOpen}>
            <Card>
              <PanelHeader
                eyebrow="Review"
                title={`Name Corrections · ${correctionTable.length}`}
                description="Suggested corrections for accused and officer names. Review before applying."
                actions={
                  <>
                    <Button onClick={applyAllCorrections} size="sm">
                      <Icons.listChecks />
                      Apply All
                    </Button>
                    <CollapseToggle open={correctionSectionOpen} />
                  </>
                }
              />
              <CollapsibleContent>
                <CardContent>
                  <div className="overflow-hidden rounded-md border">
                    <Table>
                      <TableHeader className="bg-background">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-16 text-right">Row</TableHead>
                          <TableHead>Field</TableHead>
                          <TableHead>Original</TableHead>
                          <TableHead>Suggested</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead className="w-24 text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {correctionTable.map((correction, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-right font-mono text-xs text-muted-foreground">{correction.row}</TableCell>
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{correction.column}</TableCell>
                            <TableCell className="text-[13px] text-muted-foreground line-through decoration-destructive/60">{correction.originalValue}</TableCell>
                            <TableCell className="text-[13px] font-medium text-success">{correction.suggestedValue}</TableCell>
                            <TableCell className="max-w-[320px] truncate text-xs text-muted-foreground" title={correction.reason}>
                              {correction.reason}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => applyCorrection(correction)}
                                className="h-7"
                              >
                                Apply
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}
      </main>

    </div>
  );
}

function PanelHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-4">
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-1 text-sm font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

function CollapseToggle({ open }: { open: boolean }) {
  return (
    <CollapsibleTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8" title={open ? 'Collapse' : 'Expand'}>
        {open ? <Icons.collapse /> : <Icons.expand />}
        <span className="sr-only">{open ? 'Collapse section' : 'Expand section'}</span>
      </Button>
    </CollapsibleTrigger>
  );
}

function StatTile({
  label,
  value,
  detail,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  detail?: string;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0 bg-card px-4 py-3.5">
      <p className="eyebrow">{label}</p>
      <div className={`mt-1.5 text-2xl font-semibold tabular-nums tracking-tight ${valueClassName ?? ''}`}>{value}</div>
      {detail && <p className="mt-0.5 truncate text-[11px] text-muted-foreground" title={detail}>{detail}</p>}
    </div>
  );
}

function ReportPane({ title, mono, children }: { title: string; mono?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col bg-background">
      <div className="border-b px-4 py-2">
        <span className="eyebrow">{title}</span>
      </div>
      <div className={`max-h-[320px] overflow-auto whitespace-pre-wrap px-4 py-3 leading-relaxed text-muted-foreground ${mono ? 'font-mono text-[11px]' : 'text-[13px]'}`}>
        {children || '—'}
      </div>
    </div>
  );
}
