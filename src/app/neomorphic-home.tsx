'use client';

import { useState, useEffect } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loading } from '@/components/loading';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import {
  getAuth,
  signInAnonymously,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function NeomorphicHome() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [nameHistory, setNameHistory] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [firebaseApp, setFirebaseApp] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null);
  const [db, setDb] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Initialize Firebase
  useEffect(() => {
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
      
    if (config.apiKey) {
      try {
        const app = initializeApp(config);
        setFirebaseApp(app);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);
        setAuth(authInstance);
        setDb(dbInstance);
        setInitialized(true);
        console.log('Firebase initialized');
      } catch (error) {
        console.error('Error initializing Firebase:', error);
      }
    }
  }, []);

  // Handle name correction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name',
        variant: 'destructive',
      });
      return;
    }
    
    // Simulate API call
    setLoading(true);
    setResult('');
    
    try {
      // In a real app, you'd call an API here
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simple name correction logic
      const correctedName = correctName(name);
      setResult(correctedName);
      
      // Save to history if user is logged in
      if (user && db) {
        try {
          const historyCollection = collection(db, `users/${user.uid}/history`);
          await addDoc(historyCollection, {
            originalName: name,
            correctedName: correctedName,
            timestamp: new Date(),
          });
          
          // Refresh file list
          loadHistory(user.uid);
        } catch (error) {
          console.error('Error saving to history:', error);
        }
      }
      
      toast({
        title: 'Success',
        description: 'Name has been corrected',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to correct name',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Simple name correction function
  const correctName = (input: string): string => {
    // Convert to Title Case (first letter of each word capitalized)
    const corrected = input
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      
    return corrected;
  };

  // Anonymous sign in
  const handleSignIn = async () => {
    if (!auth) {
      toast({
        title: 'Error',
        description: 'Authentication not initialized',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const userCredential = await signInAnonymously(auth);
      setUser(userCredential.user);
      
      toast({
        title: 'Signed in',
        description: 'You are now signed in anonymously',
      });
      
      // Load history and files
      if (userCredential.user) {
        loadHistory(userCredential.user.uid);
        loadFiles(userCredential.user.uid);
      }
    } catch (error: any) {
      toast({
        title: 'Sign in error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Load name correction history
  const loadHistory = async (userId: string) => {
    if (!db) {
      console.error('Firestore not initialized');
      return;
    }
    
    try {
      const historyCollection = collection(db, `users/${userId}/history`);
      const historySnapshot = await getDocs(historyCollection);
      const historyList = historySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNameHistory(historyList);
    } catch (error: any) {
      console.error('Error loading history:', error);
    }
  };

  // Load uploaded files
  const loadFiles = async (userId: string) => {
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
      console.error('Error loading files:', error);
      toast({
        title: 'Error loading files',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Delete file from Firestore
  const handleDeleteFile = async (fileId: string) => {
    if (!db || !user) {
      console.error('Firestore not initialized or user not logged in');
      return;
    }
    
    try {
      const fileRef = doc(db, `users/${user.uid}/files/${fileId}`);
      await deleteDoc(fileRef);
      
      // Refresh file list
      loadFiles(user.uid);
      
      toast({
        title: 'File deleted',
        description: 'The file has been removed successfully',
      });
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error deleting file',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-10 bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-blue-900">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-4xl'}`}>
        <div className="relative">
          <div className="absolute -inset-4 bg-white dark:bg-gray-800 rounded-2xl shadow-neu dark:shadow-neu-dark"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 shadow-neu-inner dark:shadow-neu-inner-dark">
            <div className="flex flex-col items-center space-y-6">
              {/* Logo/Header */}
              <div className="flex items-center justify-center gap-3">
                <div className="relative">
                  <div className="absolute -inset-2 bg-white dark:bg-gray-800 rounded-full shadow-neu dark:shadow-neu-dark"></div>
                  <div className="relative bg-white dark:bg-gray-800 rounded-full p-2 shadow-neu-inner dark:shadow-neu-inner-dark">
                    <Icons.user className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Name Corrector</h1>
              </div>
              
              {/* Form */}
              <form onSubmit={handleSubmit} className="w-full space-y-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enter a name to correct
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. john DOE"
                    className="w-full neu-input py-2 px-4"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="submit"
                    className="flex-1 neu-button bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-100"
                  >
                    Correct Name
                  </Button>
                  
                  {!user && initialized && (
                    <Button 
                      type="button"
                      onClick={handleSignIn}
                      className="neu-button bg-secondary hover:bg-secondary/80"
                    >
                      <Icons.user className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  )}
                </div>
              </form>
              
              {/* Result */}
              {result && (
                <div className="w-full">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-white dark:bg-gray-800 rounded-xl shadow-neu dark:shadow-neu-dark"></div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-lg p-4 shadow-neu-inner dark:shadow-neu-inner-dark">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Corrected Name:</h3>
                      <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">{result}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Uploaded Files Table */}
              {user && uploadedFiles.length > 0 && (
                <Card className="w-full mt-6 neu-card border-0">
                  <CardHeader>
                    <CardTitle className="text-gray-800 dark:text-gray-100">Uploaded Files</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      Your previously uploaded CSV files
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Upload Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uploadedFiles.map((file) => (
                            <TableRow key={file.id}>
                              <TableCell className="font-medium">{file.name}</TableCell>
                              <TableCell>{Math.round(file.size / 1024)} KB</TableCell>
                              <TableCell>
                                {file.uploadedAt?.toDate 
                                  ? file.uploadedAt.toDate().toLocaleString() 
                                  : new Date(file.uploadedAt?.seconds * 1000).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50/50"
                                    >
                                      <Icons.trash className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the file "{file.name}" from your records.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteFile(file.id)}
                                        className="bg-red-500 hover:bg-red-600"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Name Correction History Table */}
              {user && nameHistory.length > 0 && (
                <Card className="w-full mt-6 neu-card border-0">
                  <CardHeader>
                    <CardTitle className="text-gray-800 dark:text-gray-100">Correction History</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      Your previous name corrections
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Original Name</TableHead>
                            <TableHead>Corrected Name</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {nameHistory.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.originalName}</TableCell>
                              <TableCell>{item.correctedName}</TableCell>
                              <TableCell>
                                {item.timestamp?.toDate 
                                  ? item.timestamp.toDate().toLocaleString() 
                                  : new Date(item.timestamp?.seconds * 1000).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="neu-card-inner space-y-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2">
                      <Icons.check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">Proper Capitalization</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Corrects uppercase/lowercase issues</p>
                </div>
                <div className="neu-card-inner space-y-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2">
                      <Icons.settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">Format Consistency</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Formats names consistently</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 