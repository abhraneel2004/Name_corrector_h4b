import { Icons } from '@/components/icons';

export function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-1 items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-5">
        <img src="/sq_logo.png" alt="" className="h-16 w-16 opacity-80" />
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Icons.spinner className="h-4 w-4 animate-spin text-primary" />
          Establishing secure session…
        </div>
      </div>
    </div>
  );
}
