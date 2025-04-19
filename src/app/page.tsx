'use client';

import {useState, useEffect, useCallback} from 'react';
import {useRouter} from 'next/navigation';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel} from '@/components/ui/alert-dialog';
import {useToast} from '@/hooks/use-toast';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {Icons} from '@/components/icons';
import {auditDataForIndianNames} from '@/ai/flows/audit-data-for-indian-names';
import {provideDataAuditSummary} from '@/ai/flows/provide-data-audit-summary';
import {suggestDataCorrections} from '@/ai/flows/suggest-data-corrections';
import {Toaster} from "@/components/ui/toaster"
import {Avatar, AvatarImage, AvatarFallback} from "@/components/ui/avatar";
import {Label} from "@/components/ui/label";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
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
import {initializeApp} from 'firebase/app';
import { SignIn } from '@/components/sign-in';
import { Loading } from '@/components/loading';
import { NavBar } from '@/components/navbar';
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
  "AccusedStatus",
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
  const router = useRouter();
  const [aiSectionOpen, setAiSectionOpen] = useState(true);
  const [auditSectionOpen, setAuditSectionOpen] = useState(true);
  const [correctionSectionOpen, setCorrectionSectionOpen] = useState(true);
  // Error state for handling errors
  const [error, setError] = useState<{title: string, message: string} | null>(null);

  const { toast } = useToast();
  
  // Effect to handle errors and show toasts
  useEffect(() => {
    if (error) {
      toast({
        title: error.title,
        description: error.message,
        variant: 'destructive',
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
        await loadFiles(authUser.uid);
      } else {
        setUser(null);
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
          console.log("Parsed data sample:", parsedData.slice(0, 2));

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
        inQuotes = !inQuotes;
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
    AlertDialog({children: 'Are you sure you want to delete this row?'});
    setData(prevData => {
      const newData = [...prevData];
      newData.splice(index, 1);
      setModified(true);
      return newData;
    });
  };

  const handleSend = () => {
    console.log('Modified Data:', data);
    setModified(false);
    toast({
      title: 'Data sent!',
      description: 'Modified data logged to console.',
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
      
      // Convert data to CSV format
      const headers = Object.keys(data[0]);
      const csvRows = [headers.join(',')];
      
      data.forEach(row => {
        const values = headers.map(header => {
          // Handle values with commas by quoting them
          const value = row[header] || '';
          return value.includes(',') ? `"${value}"` : value;
        });
        csvRows.push(values.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      
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
      // Convert data to CSV format
      const headers = Object.keys(data[0]);
      const csvRows = [headers.join(',')];
      
      data.forEach(row => {
        const values = headers.map(header => {
          // Handle values with commas by quoting them
          const value = row[header] || '';
          return value.includes(',') ? `"${value}"` : value;
        });
        csvRows.push(values.join(','));
      });
      
      const csvContent = csvRows.join('\n');
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
      const auditInput = {data: data};
      const auditOutput = await auditDataForIndianNames(auditInput);
      setAuditResults(JSON.stringify(auditOutput, null, 2));

      // Get audit summary
      const summaryInput = {auditResults: JSON.stringify(auditOutput, null, 2)};
      const summaryOutput = await provideDataAuditSummary(summaryInput);
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
      
      console.log('Extracted names for correction:', namesArray);
      
      // Get data corrections with the names array
      const correctionsInput = { names: namesArray };
      const correctionsOutput = await suggestDataCorrections(correctionsInput);
      
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
      setError({
        title: 'Error auditing data',
        message: error.message || 'An unexpected error occurred during the audit'
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
          
          toast({
            title: 'Correction applied',
            description: `Changed "${correction.originalValue}" to "${correction.suggestedValue}"`,
            variant: 'success',
          });
        }
        
        return newData;
      });
    }
  }, [user?.email]);
  
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
      
      toast({
        title: 'All corrections applied',
        description: `Applied ${correctionTable.length} name corrections`,
        variant: 'success',
      });
      
      return newData;
    });
  }, [correctionTable, user?.email]);

  // Render table headers with the expected order
  const renderTableHeaders = () => {
    if (data.length === 0) return null;
    
    // Get the actual headers from the data
    const availableHeaders = Object.keys(data[0]);
    
    // Create a sorted list with expected headers first, then any additional headers
    const orderedHeaders = [
      ...EXPECTED_HEADERS.filter(header => availableHeaders.includes(header)),
      ...availableHeaders.filter(header => !EXPECTED_HEADERS.includes(header))
    ];
    
    return (
      <TableHeader>
        <TableRow>
          {orderedHeaders.map((header) => (
            <TableHead key={header} className="whitespace-nowrap min-w-[150px]">
              {header}
            </TableHead>
          ))}
          <TableHead className="sticky right-0 bg-background shadow-md whitespace-nowrap">Actions</TableHead>
        </TableRow>
      </TableHeader>
    );
  };

  // Render table rows with the expected order
  const renderTableRows = () => {
    if (data.length === 0) return null;
    
    // Get the actual headers from the data
    const availableHeaders = Object.keys(data[0]);
    
    // Create a sorted list with expected headers first, then any additional headers
    const orderedHeaders = [
      ...EXPECTED_HEADERS.filter(header => availableHeaders.includes(header)),
      ...availableHeaders.filter(header => !EXPECTED_HEADERS.includes(header))
    ];
    
    return data.map((row, rowIndex) => (
      <TableRow key={rowIndex}>
        {orderedHeaders.map((header) => (
          <TableCell key={header} className="min-w-[150px]">
            <Input
              value={row[header] || ''}
              onChange={(e) => handleCellChange(rowIndex, header, e.target.value)}
              className="w-full"
            />
          </TableCell>
        ))}
        <TableCell className="sticky right-0 bg-background shadow-md whitespace-nowrap">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteRow(rowIndex)}
          >
            Delete
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
    console.log("Firebase Config:", firebaseConfig);
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
        // Get API key from the environment
        const GOOGLE_GENAI_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY;
        
        if (!GOOGLE_GENAI_API_KEY) {
          throw new Error('No API key found for Google Gemini');
        }
        
        // Reduce the size of the context if retrying due to rate limit
        const maxContextItems = retries === 0 ? data.length : Math.floor(data.length / (retries + 1));
        const contextData = data.slice(0, maxContextItems);
        
        // Convert data to context for the RAG query
        const dataContext = JSON.stringify(contextData, null, 2);
        
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

        // Call the Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GOOGLE_GENAI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              topK: 40,
              topP: 0.8,
              maxOutputTokens: Math.min(2048, 1024 + (retries * 256)), // Reduce tokens on retries
            }
          })
        });

        if (response.status === 429) {
          // Rate limit error
          throw new Error('Rate limit exceeded. The AI service is currently busy.');
        }

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
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
            setQueryResult(`The AI service is busy. Retrying in ${backoffTime/1000} seconds...`);
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
          setQueryResult(`Error: ${error.message || 'An unexpected error occurred'}. Please try again with a different question.`);
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

  return (
    <div className="flex flex-col h-screen">
      <NavBar 
        user={user} 
        onSignOut={handleSignOut} 
        subtitle="Clean and validate police case records"
      />

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 overflow-auto">
        {/* Left Panel: File Upload and List */}
        <Card className="col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>File Management</CardTitle>
            <CardDescription>Upload CSV files for auditing and correction.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload a CSV file</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-2">Uploaded Files</h3>
              {uploadedFiles.length > 0 ? (
                <ul className="space-y-2 overflow-y-auto max-h-48">
                  {uploadedFiles.map((file) => (
                    <li key={file.id} className="flex justify-between items-center p-2 bg-secondary rounded-md">
                      <span className="text-sm text-secondary-foreground truncate" title={file.name}>{file.name}</span>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoadFile(file.id)}
                        >
                          Load
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFile(file.id, file.name)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50/50"
                        >
                          <Icons.trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
              )}
              
              {/* Debug button - only in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={testFirebaseConnection}
                    className="w-full"
                  >
                    Test Firebase Connection
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Center Panel: Data Table and Actions */}
        <Card className="col-span-1 md:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Data View & Edit</CardTitle>
            <CardDescription>
              {filename ? `${filename} (${(filesize / 1024).toFixed(2)} KB)` : 'No file loaded'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4">
            <div className="flex-1 overflow-auto border rounded-md">
              {data.length > 0 ? (
                <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
                  <Table>
                    {renderTableHeaders()}
                    <TableBody>{renderTableRows()}</TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Upload a file to view data.</p>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Button onClick={handleAuditData} disabled={data.length === 0 || loadingAudit}>
                  {loadingAudit ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Auditing...
                    </>
                  ) : (
                    'Audit Data'
                  )}
                </Button>
                <Button onClick={handleSend} disabled={!modified} variant="secondary">
                  Save Changes
                </Button>
                <Button 
                  onClick={handleUploadCurrentData} 
                  disabled={data.length === 0} 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Icons.save className="mr-2 h-4 w-4" />
                  Upload
                </Button>
                <Button onClick={handleDownloadData} disabled={data.length === 0} variant="outline">
                  <Icons.download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Analysis with RAG */}
      <div className="p-6 pt-0">
        <Collapsible open={aiSectionOpen} onOpenChange={setAiSectionOpen} className="w-full">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ask AI About Your Data</CardTitle>
                <CardDescription>
                  Use Gemini to analyze your police records and get insights
                </CardDescription>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {aiSectionOpen ? 
                    <Icons.collapse className="h-4 w-4" /> : 
                    <Icons.expand className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question about your data..."
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    disabled={isQuerying || data.length === 0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleRagQuery();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleRagQuery} 
                    disabled={isQuerying || data.length === 0 || !queryInput.trim()}
                  >
                    {isQuerying ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Thinking...
                      </>
                    ) : (
                      'Ask'
                    )}
                  </Button>
                </div>
                
                {queryResult && (
                  <div className="max-h-[300px] overflow-y-auto pr-2">
                    <Card className="mt-4 bg-muted/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md">Answer</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="whitespace-pre-wrap">{queryResult}</div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {!data.length && (
                  <div className="flex items-center justify-center p-4 border rounded-md border-dashed">
                    <p className="text-muted-foreground text-center">
                      Load data first to use the AI analysis feature
                    </p>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Audit Results Section */}
      {(auditResults || auditSummary || dataCorrections) && (
        <div className="p-6 pt-0">
          <Collapsible open={auditSectionOpen} onOpenChange={setAuditSectionOpen} className="w-full">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Audit Results</CardTitle>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {auditSectionOpen ? 
                      <Icons.collapse className="h-4 w-4" /> : 
                      <Icons.expand className="h-4 w-4" />
                    }
                  </Button>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="max-h-[400px] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="col-span-1">
                        <CardHeader>
                          <CardTitle>Audit Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Textarea readOnly value={auditSummary} className="min-h-[150px] bg-muted text-muted-foreground" />
                        </CardContent>
                      </Card>
                      <Card className="col-span-1">
                        <CardHeader>
                          <CardTitle>Correction Suggestions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Textarea readOnly value={dataCorrections} className="min-h-[150px] bg-muted text-muted-foreground" />
                        </CardContent>
                      </Card>
                      <Card className="col-span-1">
                        <CardHeader>
                          <CardTitle>Detailed Audit Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Textarea readOnly value={auditResults} className="min-h-[150px] bg-muted text-muted-foreground" />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      )}

      {/* Name Corrections Table */}
      {correctionTable.length > 0 && (
        <div className="p-6 pt-0">
          <Collapsible open={correctionSectionOpen} onOpenChange={setCorrectionSectionOpen} className="w-full">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Name Corrections</CardTitle>
                  <CardDescription>AI-suggested corrections for Indian names</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={applyAllCorrections}>Apply All Corrections</Button>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {correctionSectionOpen ? 
                        <Icons.collapse className="h-4 w-4" /> : 
                        <Icons.expand className="h-4 w-4" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>Field</TableHead>
                          <TableHead>Original Name</TableHead>
                          <TableHead>Suggested Correction</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {correctionTable.map((correction, index) => (
                          <TableRow key={index}>
                            <TableCell>{correction.row}</TableCell>
                            <TableCell>{correction.column}</TableCell>
                            <TableCell>{correction.originalValue}</TableCell>
                            <TableCell className="font-medium">{correction.suggestedValue}</TableCell>
                            <TableCell className="max-w-[200px] truncate" title={correction.reason}>
                              {correction.reason}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => applyCorrection(correction)}
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
        </div>
      )}

      <Toaster />
    </div>
  );
}
