import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, type Profile } from '@/lib/supabase';
import CheckoutAuthModal from '@/components/CheckoutAuthModal';

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching profile from Supabase:', error.message);
        return null;
      }
      return (data as Profile) || null;
    } catch (err) {
      console.warn('Profile fetch exception:', err);
      return null;
    }
  };

  /**
   * Auto-provisions or syncs profile from OAuth/Google metadata if record doesn't exist yet
   */
  const ensureProfile = async (user: any): Promise<Profile> => {
    const rawMeta = user.user_metadata || {};
    const displayName =
      rawMeta.full_name ||
      rawMeta.name ||
      rawMeta.user_name ||
      user.email?.split('@')[0] ||
      'Customer';
    const avatarUrl = rawMeta.avatar_url || rawMeta.picture || '';
    const intendedRole =
      (sessionStorage.getItem('a_s_hamper_account_intent') as 'user' | 'vendor' | 'admin') ||
      (rawMeta.account_type as 'user' | 'vendor' | 'admin') ||
      'user';

    const fallbackProfile: Profile = {
      id: user.id,
      email: user.email || '',
      full_name: displayName,
      avatar_url: avatarUrl,
      role: intendedRole,
      phone: rawMeta.phone || '',
      business_name: intendedRole === 'vendor' ? (rawMeta.business_name || `${displayName}'s Studio`) : null,
      shop_no: null,
      gst_no: null,
      email_verified: Boolean(user.email_confirmed_at || rawMeta.email_verified || user.app_metadata?.provider === 'google'),
      account_status: 'active',
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert(fallbackProfile, { onConflict: 'id' })
          .select()
          .maybeSingle();

        if (data && !error) {
          return data as Profile;
        }
      } catch (e) {
        console.warn('Profile upsert warning:', e);
      }
    }

    return fallbackProfile;
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // 1. Initial Session Check
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (!mounted) return;
      
      if (currentSession?.user?.id) {
        setSession(currentSession);
        let userProf = await fetchProfile(currentSession.user.id);
        
        if (!mounted) return;
        
        if (!userProf) {
          userProf = await ensureProfile(currentSession.user);
        }
        
        if (mounted) {
          setProfile(userProf);
        }
      } else {
        setSession(null);
        setProfile(null);
      }
      setLoading(false);
    });

    // 2. Auth State Change Listener (Handles Google OAuth Redirects & Email logins)
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      if (!mounted) return;
      setSession(sess);

      if (sess?.user?.id) {
        let userProf = await fetchProfile(sess.user.id);
        if (!userProf) {
          userProf = await ensureProfile(sess.user);
        }
        if (mounted) {
          setProfile(userProf);
        }
      } else {
        if (mounted) {
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // 3. Real-time Profile Updates Listener
  useEffect(() => {
    if (!session?.user?.id || !supabase) return;

    const channel = supabase
      .channel(`profile-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${session.user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setProfile(null);
            setSession(null);
            supabase?.auth.signOut();
          } else if (payload.new) {
            setProfile(payload.new as Profile);
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const refreshProfile = async () => {
    if (!session?.user?.id || !supabase) return;
    let p = await fetchProfile(session.user.id);
    if (!p && session.user) {
      p = await ensureProfile(session.user);
    }
    setProfile(p);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      loading,
      isAdmin: profile?.role === 'admin',
      isVendor: profile?.role === 'vendor',
      signOut: async () => {
        try {
          if (supabase) {
            await supabase.auth.signOut();
          }
        } catch (e) {
          console.error('Sign out error:', e);
        } finally {
          setSession(null);
          setProfile(null);
        }
      },
      refreshProfile,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
    }),
    [session, profile, loading, isAuthModalOpen]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <CheckoutAuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
