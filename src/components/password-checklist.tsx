import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { PASSWORD_RULES } from '@/lib/password-policy';

// Live list of password requirements, ticked off as the user types
export function PasswordChecklist({ password, id }: { password: string; id?: string }) {
  return (
    <ul id={id} className="space-y-1" aria-label="Password requirements">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li
            key={rule.id}
            className={cn('flex items-center gap-2 text-xs', met ? 'text-success' : 'text-muted-foreground')}
          >
            {met ? (
              <Icons.check className="h-3.5 w-3.5 shrink-0" aria-hidden />
            ) : (
              <Icons.circle className="h-3 w-3 shrink-0" aria-hidden />
            )}
            {rule.label}
            <span className="sr-only">{met ? '(met)' : '(not met)'}</span>
          </li>
        );
      })}
    </ul>
  );
}
