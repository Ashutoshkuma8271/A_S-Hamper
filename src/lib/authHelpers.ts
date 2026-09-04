import { supabase } from '@/lib/supabase';

export type AccountRole = 'user' | 'vendor' | 'admin';

/**
 * Check if an email is already registered under a different role.
 * If registered under a different role, returns a helpful user error message.
 */
export async function checkRoleCollision(
  email: string,
  intendedRole: AccountRole
): Promise<string | null> {
  if (!supabase || !email.trim()) return null;

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (error || !profile) return null;

    if (profile.role && profile.role !== intendedRole) {
      const roleName = profile.role === 'vendor' ? 'Vendor' : profile.role === 'admin' ? 'Admin' : 'Customer';
      const portalName = profile.role === 'vendor' ? 'Vendor Portal' : profile.role === 'admin' ? 'Admin Portal' : 'Customer Portal';
      return `An account with email "${email}" already exists as a ${roleName}. Please sign in using the ${portalName}.`;
    }
  } catch (err) {
    console.error('Error checking role collision:', err);
  }

  return null;
}

/**
 * Triggers Google OAuth with prompt="select_account"
 * This forces Google to show the Account Chooser screen so the user can select ANY email ID!
 */
export async function triggerGoogleSignIn(
  intendedRole: AccountRole,
  redirectPath = '/profile'
): Promise<void> {
  if (intendedRole === 'admin') {
    throw new Error('Google Sign-In is disabled for Admin accounts. Please sign in using your Admin email and password credentials.');
  }

  if (!supabase) {
    throw new Error('Authentication is not configured. Please check environment variables.');
  }

  sessionStorage.setItem('a_s_hamper_account_intent', intendedRole);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}${redirectPath}`,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });

  if (error) throw error;
}

/**
 * Validates post-login or post-OAuth session to ensure user didn't log into wrong portal.
 * If role collision detected, signs out and returns error message.
 */
export async function validateSessionRole(): Promise<string | null> {
  if (!supabase) return null;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    if (!session) return null;

    const intendedRole = sessionStorage.getItem('a_s_hamper_account_intent') as AccountRole | null;
    if (!intendedRole) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profile && profile.role && profile.role !== intendedRole) {
      // Clear intent and sign out
      sessionStorage.removeItem('a_s_hamper_account_intent');
      await supabase.auth.signOut();

      const roleName = profile.role === 'vendor' ? 'Vendor' : profile.role === 'admin' ? 'Admin' : 'Customer';
      const portalName = profile.role === 'vendor' ? 'Vendor Portal' : profile.role === 'admin' ? 'Admin Portal' : 'Customer Portal';
      return `An account with email "${session.user.email}" is registered as a ${roleName}. Please sign in using the ${portalName}.`;
    }
  } catch (err) {
    console.error('Error validating session role:', err);
  }

  return null;
}
