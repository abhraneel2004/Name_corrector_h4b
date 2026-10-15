import type { Metadata } from 'next';
import { UnsupportedDevice } from '@/components/unsupported-device';

export const metadata: Metadata = {
  title: 'Desktop required · Records Audit Console',
  robots: { index: false },
};

export default function UnsupportedDevicePage() {
  return <UnsupportedDevice />;
}
