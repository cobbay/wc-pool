import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client({
  // By default the SDK strips ID token claims down to a fixed allowlist before
  // saving the session, which drops our custom `fpf_admin` roles claim. Returning
  // the session as-is (instead of leaving this hook unset) skips that filtering
  // and keeps the full set of ID token claims, including custom namespaced ones.
  beforeSessionSaved: async (session) => session,
});
