'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { validateIndianName } from '@/services/indian-name-validator';
import { Loading } from '@/components/loading';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ValidatorPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name to validate',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      const validationResult = await validateIndianName(name);
      setResult(validationResult);
      
      // Show toast based on validation result
      if (validationResult.isValid) {
        toast({
          title: 'Valid Indian Name',
          description: `Confidence: ${validationResult.confidence}%`,
        });
      } else {
        toast({
          title: 'Name may need correction',
          description: validationResult.issues[0] || 'See suggestions below',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Validation Error',
        description: error.message || 'An error occurred during validation',
        variant: 'destructive',
      });
      console.error('Validation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 py-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle className="text-2xl">Indian Name Validator</CardTitle>
          <CardDescription>
            Check if a name follows Indian naming conventions and get suggestions for corrections
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Input
                placeholder="Enter a name to validate (e.g., Rajesh Kumar, Priya Singh)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="focus:ring-2 focus:ring-primary"
              />
              <div className="text-sm text-muted-foreground">
                Enter a full name or just a first/last name
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading || !name.trim()} 
              className="w-full"
            >
              {loading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> 
                  Validating...
                </>
              ) : 'Validate Name'}
            </Button>
          </form>
          
          {loading && (
            <div className="flex justify-center items-center py-10">
              <Loading />
            </div>
          )}
          
          {result && !loading && (
            <div className="mt-8 space-y-4">
              <Separator />
              
              <div className="flex items-center justify-between mt-4">
                <h3 className="font-semibold text-lg">Validation Result:</h3>
                <Badge 
                  variant={result.isValid ? "default" : "destructive"}
                  className="text-sm"
                >
                  {result.isValid ? 'Valid' : 'Needs Correction'}
                </Badge>
              </div>
              
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Name</div>
                      <div className="text-lg font-medium">{name}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Confidence Score</div>
                      <div className={`text-lg font-bold ${getConfidenceColor(result.confidence)}`}>
                        {result.confidence}%
                      </div>
                    </div>
                  </div>
                  
                  {result.issues.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium text-muted-foreground mb-2">Issues Found</div>
                      <ul className="list-disc pl-5 space-y-1">
                        {result.issues.map((issue: string, index: number) => (
                          <li key={index} className="text-sm text-red-600">
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.suggestions && result.suggestions.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium text-muted-foreground mb-2">Suggestions</div>
                      <div className="flex flex-wrap gap-2">
                        {result.suggestions.map((suggestion: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="cursor-pointer bg-green-50 hover:bg-green-100"
                            onClick={() => setName(suggestion)}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {!result.isValid && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Icons.info className="h-4 w-4" />
                  <AlertTitle>Try a suggested correction</AlertTitle>
                  <AlertDescription>
                    Click on any of the suggested names above to try validating it instead.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>About Indian Name Validation</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm">
          <p>
            This validator checks if a name follows common Indian naming conventions. It analyzes:
          </p>
          <ul>
            <li>Name structure and formatting</li>
            <li>Common Indian first and last names</li>
            <li>Proper capitalization</li>
            <li>Special character usage</li>
            <li>Regional naming patterns</li>
          </ul>
          <p>
            The validator provides a confidence score and suggestions for corrections when issues are found.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 