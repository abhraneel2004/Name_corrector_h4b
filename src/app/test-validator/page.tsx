'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { validateIndianName, batchValidateIndianNames } from '@/services/indian-name-validator';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Loading from '@/components/loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function TestValidator() {
  // Single name validation
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Batch validation
  const [firstNames, setFirstNames] = useState('');
  const [lastNames, setLastNames] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<any>(null);
  const [batchError, setBatchError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const nameInfo = await validateIndianName(name);
      setResult(nameInfo);
    } catch (err) {
      console.error(err);
      setError('Failed to validate name. API error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBatchLoading(true);
    setBatchError(null);
    
    try {
      // Parse names from textarea (one per line)
      const firstNameArray = firstNames.split('\n').filter(n => n.trim() !== '');
      const lastNameArray = lastNames.split('\n').filter(n => n.trim() !== '');
      
      const result = await batchValidateIndianNames(firstNameArray, lastNameArray);
      setBatchResult(result);
    } catch (err) {
      console.error(err);
      setBatchError('Failed to validate names in batch. API error occurred.');
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Indian Name Validator Test</h1>
      
      <Tabs defaultValue="single">
        <TabsList className="mb-4">
          <TabsTrigger value="single">Single Name</TabsTrigger>
          <TabsTrigger value="batch">Batch Names</TabsTrigger>
        </TabsList>
        
        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Test Individual Name Validation</CardTitle>
              <CardDescription>Enter an Indian name to validate</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter an Indian name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Button type="submit" disabled={loading || !name.trim()}>
                    {loading ? <Loading size="sm" /> : 'Validate'}
                  </Button>
                </div>
              </form>
              
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {result && !loading && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Result:</h3>
                  <div className="bg-slate-100 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>Test Batch Name Validation</CardTitle>
              <CardDescription>Enter multiple names (one per line) for batch validation</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBatchSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstNames">First Names (one per line)</Label>
                    <Textarea 
                      id="firstNames"
                      placeholder="Enter first names"
                      value={firstNames}
                      onChange={(e) => setFirstNames(e.target.value)}
                      rows={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastNames">Last Names (one per line)</Label>
                    <Textarea 
                      id="lastNames"
                      placeholder="Enter last names"
                      value={lastNames}
                      onChange={(e) => setLastNames(e.target.value)}
                      rows={6}
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={batchLoading || (!firstNames.trim() && !lastNames.trim())}
                >
                  {batchLoading ? <Loading size="sm" /> : 'Validate Batch'}
                </Button>
              </form>
              
              {batchError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{batchError}</AlertDescription>
                </Alert>
              )}
              
              {batchResult && !batchLoading && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Result:</h3>
                  <div className="bg-slate-100 p-4 rounded-md max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(batchResult, null, 2)}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 