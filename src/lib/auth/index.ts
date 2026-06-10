import type { AuthProvider } from './types';

/**
 * Auth entry point. Today this always resolves to the disabled provider —
 * the portfolio is fully public and statically built.
 *
 * Cutover plan (see README.md in this directory): when the Logto IdP at
 * auth.robyrew.com is live, set PUBLIC_AUTH_PROVIDER=logto plus the LOGTO_*
 * secrets, switch Astro to `output: 'server'` with the node adapter, and
 * implement `./providers/logto`.
 */

const nullProvider: AuthProvider = {
  id: 'none',
  enabled: false,
  getSession: async () => null,
  signInUrl: () => '#',
  signOutUrl: () => '#',
};

export function getAuthProvider(): AuthProvider {
  const provider = import.meta.env.PUBLIC_AUTH_PROVIDER ?? 'none';

  if (provider === 'logto') {
    // Fail loudly at build time rather than silently shipping a half-wired
    // auth setup: the Logto adapter requires server output + secrets.
    throw new Error(
      "PUBLIC_AUTH_PROVIDER=logto is set but the Logto adapter isn't implemented yet. " +
        'See src/lib/auth/README.md for the cutover checklist.',
    );
  }

  return nullProvider;
}

export type { AuthProvider, AuthSession, AuthUser } from './types';
