import { useEffect, useState } from 'react';
import { supabase, type Profile } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import {
  Store,
  Hash,
  FileText,
  Phone,
  Mail,
  Calendar,
  Loader2,
  Check,
  Save,
  LogOut,
  Camera,
  Upload,
  User,
  Image,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AddressManager from '@/components/AddressManager';

const PRESET_AVATARS = [
  'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200',
];

export default function ProfileSection() {
  const { session, profile, loading, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [form, setForm] = useState<Partial<Profile>>({});

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-wine-600" />
      </div>
    );
  }

  if (!session || !profile) {
    return (
      <p className="text-center text-ink-700/60 py-10">
        Sign in to view your account details.
      </p>
    );
  }

  async function uploadAvatarFile(file: File) {
    if (!supabase) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `avatars/${profile!.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        // Fallback to Base64 data URL if storage bucket fails
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Url = reader.result as string;
          setForm((prev) => ({ ...prev, avatar_url: base64Url }));
          await supabase!
            .from('profiles')
            .update({ avatar_url: base64Url })
            .eq('id', profile!.id);
          toast.success('Profile picture updated successfully!');
        };
        reader.readAsDataURL(file);
      } else {
        const publicUrl = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
        setForm((prev) => ({ ...prev, avatar_url: publicUrl }));
        await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', profile!.id);
        toast.success('Profile picture uploaded!');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error('Could not upload image file');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    if (!supabase) {
      setSaving(false);
      return;
    }
    await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        business_name: form.business_name,
        shop_no: form.shop_no,
        gst_no: form.gst_no,
        phone: form.phone,
        avatar_url: form.avatar_url,
      })
      .eq('id', profile!.id);

    setSaving(false);
    setSaved(true);
    setEditing(false);
    toast.success('Profile details updated!');
    setTimeout(() => setSaved(false), 2500);
  }

  const isVendor = profile.role === 'vendor';
  const avatarImage = form.avatar_url || profile.avatar_url;

  const rows = isVendor
    ? [
        { icon: <Store className="h-4 w-4" />, label: 'Business name', key: 'business_name' as const },
        { icon: <Hash className="h-4 w-4" />, label: 'Shop number', key: 'shop_no' as const },
        { icon: <FileText className="h-4 w-4" />, label: 'GST number', key: 'gst_no' as const },
        { icon: <Phone className="h-4 w-4" />, label: 'Phone', key: 'phone' as const },
      ]
    : [
        { icon: <Store className="h-4 w-4" />, label: 'Full name', key: 'full_name' as const },
        { icon: <Phone className="h-4 w-4" />, label: 'Phone', key: 'phone' as const },
      ];

  return (
    <div className="rounded-3xl bg-cream-50 dark:bg-gray-800 ring-1 ring-cream-200 dark:ring-gray-700 overflow-hidden font-sans">
      {/* Header with Avatar Photo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 border-b border-cream-200 dark:border-gray-700 bg-cream-100/40 dark:bg-gray-800/80">
        <div className="flex items-center gap-5">
          {/* Avatar Picture Container */}
          <div className="relative group shrink-0">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden ring-4 ring-gold-400/50 bg-wine-600 text-cream-50 flex items-center justify-center shadow-md">
              {avatarImage ? (
                <img
                  src={avatarImage}
                  alt={profile.full_name || 'Profile Avatar'}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = PRESET_AVATARS[0];
                  }}
                />
              ) : (
                <span className="font-display text-2xl sm:text-3xl font-semibold">
                  {(profile.full_name || profile.business_name || profile.id).charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Quick Upload Camera Overlay */}
            <label className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-wine-600 text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-wine-700 transition-transform hover:scale-110">
              {uploadingAvatar ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingAvatar}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadAvatarFile(file);
                }}
              />
            </label>
          </div>

          <div>
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-wine-700 dark:text-white">
              {profile.full_name || profile.business_name || 'Your account'}
            </h3>
            <p className="flex items-center gap-1.5 text-xs sm:text-sm text-ink-700/60 dark:text-gray-300 mt-1">
              <Mail className="h-3.5 w-3.5 text-gold-600" />
              {session.user.email}
              {(session.user.email_confirmed_at || profile.email_verified) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold shadow-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Verified
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-gold-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-600 dark:text-gold-300">
            {profile.role}
          </span>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs text-sage-500 font-bold animate-fade-in">
              <Check className="h-4 w-4" /> Saved
            </span>
          )}
        </div>
      </div>

      {/* Main Profile Form */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Editing Profile Picture Section */}
        {editing && (
          <div className="rounded-2xl border border-cream-200 dark:border-gray-700 bg-cream-100/50 dark:bg-gray-700/40 p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-wine-700 dark:text-gold-300 flex items-center gap-2">
              <Image className="h-4 w-4" /> Profile Picture Settings
            </p>

            <div>
              <label className="block text-xs font-medium text-ink-700/60 dark:text-gray-300 mb-1">
                Custom Image URL
              </label>
              <input
                type="url"
                placeholder="https://images.pexels.com/..."
                value={form.avatar_url || ''}
                onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value }))}
                className="input text-xs"
              />
            </div>

            <div>
              <p className="text-xs font-medium text-ink-700/60 dark:text-gray-300 mb-1.5">
                Or choose a preset avatar:
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, avatar_url: url }))}
                    className={`h-10 w-10 rounded-full overflow-hidden ring-2 shrink-0 transition-all ${
                      form.avatar_url === url ? 'ring-wine-600 scale-110' : 'ring-transparent hover:scale-105'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-5">
          {rows.map((r) => (
            <div key={r.key}>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-700/55 dark:text-gray-400">
                <span className="text-gold-600">{r.icon}</span>
                {r.label}
              </p>
              {editing ? (
                <input
                  value={(form[r.key] as string) || ''}
                  onChange={(e) => setForm((f) => ({ ...f, [r.key]: e.target.value }))}
                  className="input"
                />
              ) : (
                <p className="font-display text-lg text-ink-800 dark:text-white">
                  {profile[r.key] || '—'}
                </p>
              )}
            </div>
          ))}

          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-700/55 dark:text-gray-400">
              <span className="text-gold-600"><Calendar className="h-4 w-4" /></span>
              Member since
            </p>
            <p className="font-display text-lg text-ink-800 dark:text-white">
              {new Date(profile.created_at).toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {!isVendor && (
          <div className="pt-6 border-t border-cream-200 dark:border-gray-700">
            <AddressManager userId={profile.id} />
          </div>
        )}

        <div className="mt-8 flex items-center gap-3">
          {editing ? (
            <>
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-wine-600 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-wine-700 transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save changes
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setForm(profile);
                }}
                className="rounded-full border border-cream-300 dark:border-gray-600 px-6 py-3 text-sm font-medium text-ink-700/70 dark:text-gray-300 hover:bg-cream-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-full border border-wine-600/30 px-6 py-3 text-sm font-medium text-wine-700 dark:text-gold-300 dark:border-gold-500/30 hover:bg-cream-100 dark:hover:bg-gray-700 transition-colors"
              >
                Edit details &amp; picture
              </button>
              <button
                onClick={() => void signOut()}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 dark:border-red-900/40 px-6 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
