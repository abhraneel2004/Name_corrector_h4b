'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, getDocs, Firestore } from 'firebase/firestore';

type Crime = {
  title: string;
  law: string[];
};

const GEMINI_API_KEY = process.env.GOOGLE_GENAI_API_KEY!;

const CrimesContent = () => {
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    };

    const app = initializeApp(config);
    const firestore = getFirestore(app);

    setFirebaseApp(app);
    setDb(firestore);
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchCrimes = async () => {
      if (!db) return;
      const snapshot = await getDocs(collection(db, 'crimes'));
      
      const data: Crime[] = [];

      for (const doc of snapshot.docs) {
        const crime = doc.data().title as string;
        console.log(crime);
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `State Indian law and punishment (IPC section) for the crime: ${crime}`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        const json = await response.json();
        const law: string[] =
          json.candidates?.[0]?.content?.parts?.[0]?.text?.split('\n') ?? [];

        data.push({ title: crime, law });
      }

      setCrimes(data);
    };

    if (db) fetchCrimes();
  }, [db]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-900 text-white px-6 py-12 md:px-24">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-extrabold mb-4">Indian Criminal Law Reference</h1>
        <p className="text-zinc-400 text-lg">Swipe through major crimes and corresponding laws 🚨</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {crimes.map((crime, idx) => (
          <div key={idx} className="bg-zinc-800 p-6 rounded-xl shadow-md border border-zinc-700">
            <h2 className="text-2xl font-semibold mb-4 text-teal-300">{crime.title}</h2>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 text-sm">
              {crime.law.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
};

const Page = () => (
  <Suspense fallback={null}>
    <CrimesContent />
  </Suspense>
);

export default Page;
