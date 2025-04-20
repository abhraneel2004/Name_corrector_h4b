'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { NavBar } from '@/components/navbar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AnimatedCard } from '@/components/ui/animated-card';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AnimatedListItem, AnimatedTableRow } from '@/components/ui/animations';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { SignIn } from '@/components/sign-in';
import { Loading } from '@/components/loading';
import { Icons } from '@/components/icons';
import { Separator } from '@/components/ui/separator';

type CrimeData = {
  crime: string;
  count: number;
  caseIds: string[];
  rows: number[];
};

// Create a wrapper component that uses useSearchParams inside Suspense
function CrimesContent() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [crimeStats, setCrimeStats] = useState<CrimeData[]>([]);
  const [filename, setFilename] = useState<string>('');
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [crimeAnalysis, setCrimeAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Firebase auth
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

    if (config.apiKey) {
      try {
        const app = initializeApp(config);
        const authInstance = getAuth(app);

        const unsubscribe = onAuthStateChanged(authInstance, (authUser) => {
          if (authUser) {
            setUser(authUser);
          } else {
            setUser(null);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error initializing Firebase:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [mounted]);

  // Parse crime data from URL parameters
  useEffect(() => {
    if (!searchParams) return;

    try {
      const crimeDataParam = searchParams.get('crimeData');
      const filenameParam = searchParams.get('filename');
      const totalParam = searchParams.get('total');

      if (crimeDataParam && filenameParam && totalParam) {
        const decodedData = decodeURIComponent(crimeDataParam);
        const parsedData = JSON.parse(decodedData);
        setCrimeStats(parsedData);
        setFilename(filenameParam);
        setTotalRecords(parseInt(totalParam));
      }
    } catch (error) {
      console.error('Error parsing crime data from URL:', error);
      toast({
        title: 'Error loading crime data',
        description: 'Could not parse the crime statistics from URL',
        variant: 'destructive',
      });
    }
  }, [searchParams, toast]);

  const analyzeCrimesWithGemini = async () => {
    if (crimeStats.length === 0) {
      toast({
        title: 'No crimes to analyze',
        description: 'Please load data with crime information first.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setCrimeAnalysis('');

    try {
      // Get API key from the environment
      const GOOGLE_GENAI_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY;

      if (!GOOGLE_GENAI_API_KEY) {
        throw new Error('No API key found for Google Gemini');
      }

      // Extract crime names for analysis
      const crimes = crimeStats.map(stat => stat.crime);

      // Create a prompt for Gemini
      const prompt = `
You are a legal expert specializing in criminal law in India.

Please provide a detailed analysis of the following crimes from the Indian Penal Code:
${crimes.join(', ')}

For each crime, please include:
1. The definition of the crime under Indian law
2. The typical penalties or sentences associated with this crime
3. The relevant section(s) of the Indian Penal Code
4. Any notable case precedents

Present your analysis in a clear, organized format suitable for legal professionals. also use html tags to format the output.
`;

      // Call the Gemini API via our server-side proxy API route
      const response = await fetch('/api/gemini', {
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
            maxOutputTokens: 4096
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.candidates && responseData.candidates[0]?.content?.parts[0]?.text) {
        setCrimeAnalysis(responseData.candidates[0].content.parts[0].text);
        toast({
          title: 'Analysis complete',
          description: 'Crime analysis has been generated successfully.',
          variant: 'success',
        });
      } else {
        setCrimeAnalysis('Failed to get a response from the AI. Please try again.');
        toast({
          title: 'Analysis failed',
          description: 'Could not generate crime analysis.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error analyzing crimes:', error);
      setCrimeAnalysis(`Error: ${error.message || 'An unexpected error occurred'}`);
      toast({
        title: 'Analysis failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
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
    <div className="flex flex-col">
      <NavBar
        user={user}
        subtitle="Crime Statistics Analysis"
        onSignOut={() => { }}
      />

      <div className="p-6 space-y-6">
        <AnimatedCard
          className="w-full"
          animation="slide"
          delay={0.1}
          hoverEffect="shadow"
        >
          <CardHeader>
            <CardTitle>Crime Statistics</CardTitle>
            <CardDescription>
              {filename ? `From ${filename} - ${totalRecords} total records` : 'No data loaded'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {crimeStats.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Crime Type</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {crimeStats.map((crime, index) => (
                      <AnimatedTableRow key={index} index={index}>
                        <TableCell className="font-medium">{crime.crime || 'Unknown'}</TableCell>
                        <TableCell className="text-right">{crime.count}</TableCell>
                        <TableCell className="text-right">
                          {((crime.count / totalRecords) * 100).toFixed(2)}%
                        </TableCell>
                      </AnimatedTableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">No crime data available.</p>
              </div>
            )}
          </CardContent>
        </AnimatedCard>

        <div className="flex justify-center mt-4">
          <Button
            onClick={analyzeCrimesWithGemini}
            disabled={isAnalyzing || crimeStats.length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isAnalyzing ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Crimes...
              </>
            ) : (
              <>
                <Icons.barChart className="mr-2 h-4 w-4" />
                Analyze Criminal Charges
              </>
            )}
          </Button>
        </div>

        {crimeAnalysis && (
          <AnimatedCard
            className="w-full"
            animation="slide"
            delay={0.2}
            hoverEffect="shadow"
          >
            <CardHeader>
              <CardTitle>Legal Analysis of Crimes</CardTitle>
              <CardDescription>
                AI-generated analysis of criminal charges under Indian law
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: crimeAnalysis }}
                  className="text-sm bg-muted p-4 rounded-md overflow-auto max-h-[500px]"
                />
              </div>
            </CardContent>
          </AnimatedCard>
        )}
      </div>

      <Toaster />
    </div>
  );
}

// Main component that wraps the content with Suspense
export default function CrimesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CrimesContent />
    </Suspense>
  );
}
