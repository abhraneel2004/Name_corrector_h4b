import { Footer } from '@/components/footer';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-grow flex-col">{children}</div>
      <Footer />
    </>
  );
}
