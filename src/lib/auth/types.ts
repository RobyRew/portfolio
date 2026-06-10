/**
 * Provider-agnostic auth contract.
 *
 * The site is static today, so the only live implementation is the
 * NullAuthProvider. The interface is shaped after OIDC (which Logto speaks
 * natively) so the future cutover is an adapter swap, not a refactor.
 */

export interface AuthUser {
  /** Stable subject identifier (OIDC `sub`). */
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  /** Roles/scopes as exposed by the IdP — drives any gated UI. */
  roles: string[];
}

export interface AuthSession {
  user: AuthUser;
  /** Epoch milliseconds. */
  expiresAt: number;
}

export interface AuthProvider {
  /** Provider id, e.g. 'none' | 'logto'. */
  readonly id: string;
  readonly enabled: boolean;
  /** Resolve the current session, if any. */
  getSession(request: Request): Promise<AuthSession | null>;
  /** URL to start the sign-in flow. */
  signInUrl(returnTo?: string): string;
  /** URL to end the session. */
  signOutUrl(returnTo?: string): string;
}
