// Password rules for sign-up and password reset.
// Keep in sync with Firebase Console → Authentication → Settings → Password policy,
// which enforces the same rules on Firebase's servers.

export const MIN_PASSWORD_LENGTH = 12;

export const PASSWORD_RULES = [
  { id: 'length', label: `At least ${MIN_PASSWORD_LENGTH} characters`, test: (p: string) => p.length >= MIN_PASSWORD_LENGTH },
  { id: 'upper', label: 'An uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'A lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'A number', test: (p: string) => /\d/.test(p) },
];

export function passwordMeetsPolicy(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

export const PASSWORD_POLICY_MESSAGE = `Use at least ${MIN_PASSWORD_LENGTH} characters, including an uppercase letter, a lowercase letter and a number.`;
