import Link from 'next/link';

// Centered single-column layout for account recovery pages
export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center bg-background px-6 py-20">
      <div className="w-full max-w-sm">
        <Link href="/">
          <img src="/long_logo.png" alt="Police Record Management System" className="h-9 w-auto" />
        </Link>
        <div className="mt-10 border-t pt-8">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
