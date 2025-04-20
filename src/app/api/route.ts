import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const dynamic = 'force-dynamic'; // 👈 needed for SSR fetch

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const getLawFromGemini = async (crime: string): Promise<string> => {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `State Indian law and punishment (IPC section) for the crime: ${crime}` }] }]
    }),
  });

  const json = await res.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No data found';
};

export async function GET() {
  const snapshot = await getDocs(collection(db, 'crimes'));
  const crimes = snapshot.docs.map(doc => doc.data().name);

  const results = await Promise.all(
    crimes.map(async (crime) => ({
      crime,
      law: await getLawFromGemini(crime)
    }))
  );

  return NextResponse.json(results);
}
