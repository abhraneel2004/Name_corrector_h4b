'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AuthStatus() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading authentication status...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Authentication Status</CardTitle>
      </CardHeader>
      <CardContent>
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                Authenticated
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">User ID:</span>
              <span className="text-sm font-mono bg-muted p-1 rounded">{user.uid}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Email:</span>
              <span>{user.email || 'No email (Anonymous)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Anonymous:</span>
              <Badge variant={user.isAnonymous ? 'secondary' : 'outline'}>
                {user.isAnonymous ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
              Not Authenticated
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 