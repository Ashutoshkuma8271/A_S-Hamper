import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { BarChart3, Bell, Check, ChevronDown, Eye, FileText, Image, Loader2, PackageSearch, Plus, Search, Settings, Tag, Trash2, Users } from 'lucide-react';
import { supabase, type Product, type Profile } from '@/lib/supabase';
import { formatPrice } from '@/cart';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import ConfirmationDialog from '@/components/ConfirmationDialog';

type Kind = 'category' | 'coupon' | 'banner' | 'blog' | 'review' | 'notification';
type Resource = { id: string; kind: Kind; title: string; subtitle: string | null; image_url: string | null; active: boolean; data: Record<string, any>; created_at: string };

const config: Record<Kind, { title: string; hint: string; action: string }> = {
  category: { title: 'Categories', hint: 'Organize hampers and subcategories.', action: 'Add category' },
  coupon: { title: 'Coupons & offers', hint: 'Codes, discount rules, limits and expiry dates.', action: 'Create coupon' },
  banner: { title: 'Banner management', hint: 'Homepage, promotional, offers and new-arrival campaign banners.', action: 'Add banner' },
  blog: { title: 'Blog management', hint: 'Create, edit, delete, publish or unpublish gift stories.', action: 'Create blog post' },
  review: { title: 'Reviews moderation', hint: 'Approve, reject or remove customer reviews.', action: 'Add review' },
  notification: { title: 'Customer notifications', hint: 'Create order, service and promotional messages.', action: 'New notification' },
};

export function ResourceManager({ kind }: { kind: Kind }) {
  const [rows, setRows] = useState<Resource[]>([]);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [create, setCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<Resource | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase.from('admin_resources').select('*').eq('kind', kind).order('created_at', { ascending: false });
    setRows((data || []) as Resource[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [kind]);

  const confirmRemove = async () => {
    if (!itemToDelete || !supabase) return;
    setDeleting(true);
    await supabase.from('admin_resources').delete().eq('id', itemToDelete.id);
    setDeleting(false);
    setItemToDelete(null);
    void load();
  };

  const toggle = async (row: Resource) => {
    if (supabase) {
      await supabase.from('admin_resources').update({ active: !row.active }).eq('id', row.id);
      void load();
    }
  };

  const c = config[kind];

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-wine-700">{c.title}</h2>
          <p className="mt-1 text-sm text-ink-700/60">{c.hint}</p>
        </div>
        <button onClick={() => setCreate(true)} className="inline-flex items-center gap-2 rounded-full bg-wine-600 px-4 py-2.5 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" />{c.action}
        </button>
      </div>

      {kind === 'banner' && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {['Homepage','Promotional','Offers','New arrivals'].map(label => (
            <div key={label} className="rounded-2xl bg-gold-500/10 px-4 py-3 text-center text-sm font-semibold text-gold-600">{label}</div>
          ))}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton type="table" count={3} />
      ) : rows.length ? (
        <div className="space-y-3">
          {rows.map(row => (
            <article key={row.id} className="flex flex-col gap-4 rounded-2xl bg-cream-100/50 p-4 ring-1 ring-cream-200 sm:flex-row sm:items-center">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-wine-600/10 text-wine-700">
                {kind === 'banner' ? <Image className="h-5 w-5" /> : kind === 'blog' ? <FileText className="h-5 w-5" /> : <Tag className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-wine-700">{row.title}</h3>
                <p className="truncate text-sm text-ink-700/60">{row.subtitle || 'No description added'}</p>
                {kind === 'banner' && (
                  <span className="mt-2 inline-flex rounded-full bg-gold-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold-600">
                    {row.data?.placement || 'Homepage'}
                  </span>
                )}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${row.active ? 'bg-sage-500/15 text-sage-500' : 'bg-cream-200 text-ink-700/60'}`}>
                {row.active ? (kind === 'blog' ? 'Published' : 'Active') : (kind === 'blog' ? 'Draft' : 'Hidden')}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setEditing(row)} className="rounded-full border border-cream-300 px-3 py-1.5 text-xs font-medium">Edit</button>
                <button onClick={() => void toggle(row)} className="rounded-full border border-cream-300 px-3 py-1.5 text-xs font-medium">
                  {row.active ? (kind === 'blog' ? 'Unpublish' : 'Hide') : (kind === 'blog' ? 'Publish' : 'Show')}
                </button>
                <button onClick={() => setItemToDelete(row)} className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-cream-100/50 p-8 text-center text-sm text-ink-700/60">No {c.title.toLowerCase()} yet.</p>
      )}

      {(create || editing) && (
        <ResourceModal
          kind={kind}
          resource={editing}
          onClose={() => { setCreate(false); setEditing(null); }}
          onSaved={() => { setCreate(false); setEditing(null); void load(); }}
        />
      )}

      {/* Reusable Confirmation Dialog for Resource Deletion */}
      <ConfirmationDialog
        isOpen={!!itemToDelete}
        title={`Delete ${kind === 'blog' ? 'Blog Post' : kind === 'banner' ? 'Banner' : 'Category'}?`}
        message={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        itemName={itemToDelete?.title}
        isLoading={deleting}
        onConfirm={confirmRemove}
        onCancel={() => setItemToDelete(null)}
      />
    </section>
  );
}


function ResourceModal({ kind, resource, onClose, onSaved }: { kind: Kind; resource: Resource | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(resource?.title || ''); const [subtitle, setSubtitle] = useState(resource?.subtitle || ''); const [image, setImage] = useState(resource?.image_url || ''); const [active, setActive] = useState(resource?.active ?? true); const [placement, setPlacement] = useState(resource?.data?.placement || 'Homepage'); const [subcategories, setSubcategories] = useState(Array.isArray(resource?.data?.subcategories) ? resource.data.subcategories.join(', ') : ''); const [saving, setSaving] = useState(false);
  const save = async () => { if (!supabase || !title.trim()) return; setSaving(true); const data = kind === 'banner' ? { placement } : kind === 'category' ? { subcategories: subcategories.split(',').map((item: string) => item.trim()).filter(Boolean) } : resource?.data || {}; const payload = { kind, title, subtitle: subtitle || null, image_url: image || null, active, data }; const { error } = resource ? await supabase.from('admin_resources').update(payload).eq('id', resource.id) : await supabase.from('admin_resources').insert(payload); setSaving(false); if (!error) onSaved(); };
  return <div className="fixed inset-0 z-[90] grid place-items-center bg-ink-900/50 p-4" onClick={onClose}><div className="w-full max-w-lg rounded-3xl bg-cream-50 p-6 shadow-xl" onClick={e => e.stopPropagation()}><h3 className="font-display text-xl font-semibold text-wine-700">{resource ? 'Edit' : 'Create'} {kind === 'blog' ? 'blog post' : config[kind].title.slice(0, -1)}</h3><div className="mt-5 space-y-4">{kind === 'banner' && <label className="block"><span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-700/60">Banner placement</span><select value={placement} onChange={e=>setPlacement(e.target.value)} className="input"><option>Homepage</option><option>Promotional</option><option>Offers</option><option>New arrivals</option></select></label>}<input className="input" placeholder={kind === 'blog' ? 'Blog title' : kind === 'category' ? 'Category name' : 'Title'} value={title} onChange={e => setTitle(e.target.value)} />{kind === 'category' && <input className="input" placeholder="Subcategories, comma-separated" value={subcategories} onChange={e=>setSubcategories(e.target.value)} />}<textarea className="input resize-none" rows={3} placeholder={kind === 'blog' ? 'Blog content / excerpt' : 'Description / details'} value={subtitle} onChange={e => setSubtitle(e.target.value)} /><input className="input" placeholder={kind === 'category' ? 'Category image URL (optional)' : 'Image URL (optional)'} value={image} onChange={e => setImage(e.target.value)} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />{kind === 'blog' ? 'Publish now' : 'Active / visible'}</label><div className="flex gap-3"><button onClick={() => void save()} disabled={saving} className="rounded-full bg-wine-600 px-5 py-2.5 text-sm font-semibold text-white">{saving ? 'Saving...' : 'Save'}</button><button onClick={onClose} className="rounded-full border border-cream-300 px-5 py-2.5 text-sm">Cancel</button></div></div></div></div>;
}

export function Customers() { const [customers, setCustomers] = useState<Profile[]>([]); const [query, setQuery] = useState(''); const [selected, setSelected] = useState<any>(null); const [orders, setOrders] = useState<any[]>([]); const load = async () => { if (!supabase) return; const { data } = await supabase.from('profiles').select('*').neq('role', 'admin').order('created_at', { ascending: false }); setCustomers((data || []) as Profile[]); }; useEffect(() => { void load(); }, []); const shown = customers.filter(c => `${c.full_name} ${c.phone}`.toLowerCase().includes(query.toLowerCase())); const toggle = async (c: any) => { if (supabase) { await supabase.from('profiles').update({ is_active: !c.is_active }).eq('id', c.id); void load(); } }; const view = async (c:any) => { setSelected(c); if (!supabase) return; const { data } = await supabase.from('orders').select('*').eq('customer_id',c.id).order('created_at',{ascending:false}); setOrders(data || []); }; return <section><h2 className="font-display text-2xl font-semibold text-wine-700">Customer management</h2><p className="mt-1 text-sm text-ink-700/60">View customer profiles and orders, search customers, and manage account access.</p><label className="mt-6 flex max-w-sm items-center gap-2 rounded-full border border-cream-300 bg-cream-50 px-4 py-2"><Search className="h-4 w-4" /><input className="w-full bg-transparent text-sm outline-none" placeholder="Search name or phone" value={query} onChange={e => setQuery(e.target.value)} /></label><div className="mt-5 grid gap-5 xl:grid-cols-[1fr_.85fr]"><div className="space-y-3">{shown.map((c: any) => <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream-100/50 p-4 ring-1 ring-cream-200"><button onClick={()=>void view(c)} className="text-left"><p className="font-semibold text-wine-700">{c.full_name || 'Customer'}</p><p className="text-xs text-ink-700/60">{c.phone || 'No phone'} · joined {new Date(c.created_at).toLocaleDateString('en-IN')}</p></button><div className="flex gap-2"><button onClick={()=>void view(c)} className="rounded-full border border-cream-300 px-3 py-1.5 text-xs font-semibold">View profile</button><button onClick={() => void toggle(c)} className="rounded-full border border-cream-300 px-3 py-1.5 text-xs font-semibold">{c.is_active === false ? 'Activate' : 'Deactivate'}</button></div></div>)}</div><aside className="rounded-3xl bg-cream-100/50 p-5 ring-1 ring-cream-200">{selected ? <><h3 className="font-display text-lg font-semibold text-wine-700">Customer profile</h3><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-ink-700/50">Name</dt><dd className="font-medium text-wine-700">{selected.full_name || '—'}</dd></div><div><dt className="text-ink-700/50">Phone</dt><dd className="font-medium text-wine-700">{selected.phone || '—'}</dd></div><div><dt className="text-ink-700/50">Account status</dt><dd className="font-medium text-wine-700">{selected.is_active === false ? 'Deactivated' : 'Active'}</dd></div></dl><h4 className="mt-6 font-display font-semibold text-wine-700">Customer orders ({orders.length})</h4><div className="mt-3 space-y-2">{orders.length ? orders.map(o=><div key={o.id} className="rounded-xl bg-cream-50 p-3 text-sm"><div className="flex justify-between"><span>#{o.id.slice(0,8)}</span><b>{formatPrice(o.total)}</b></div><p className="mt-1 capitalize text-xs text-ink-700/60">{o.status}</p></div>) : <p className="text-sm text-ink-700/60">No linked orders yet.</p>}</div></> : <p className="text-sm text-ink-700/60">Select a customer to view their profile and order history.</p>}</aside></div></section>; }

export function CouponManagement() {
  const [coupons, setCoupons] = useState<Resource[]>([]);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [creating, setCreating] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Resource | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('admin_resources').select('*').eq('kind', 'coupon').order('created_at', { ascending: false });
    setCoupons((data || []) as Resource[]);
  };

  useEffect(() => { void load(); }, []);

  const confirmDeleteCoupon = async () => {
    if (!couponToDelete || !supabase) return;
    setDeleting(true);
    await supabase.from('admin_resources').delete().eq('id', couponToDelete.id);
    setDeleting(false);
    setCouponToDelete(null);
    void load();
  };

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-wine-700">Coupons & offers</h2>
          <p className="mt-1 text-sm text-ink-700/60">Create discount codes with percentage/fixed values, expiration dates and usage limits.</p>
        </div>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-full bg-wine-600 px-4 py-2.5 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" />Create coupon
        </button>
      </div>
      <div className="mt-6 space-y-3">
        {coupons.map(c => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-cream-100/50 p-4 ring-1 ring-cream-200">
            <div>
              <p className="font-semibold text-wine-700">{c.title}</p>
              <p className="mt-1 text-sm text-ink-700/60">
                {c.data?.discount_type === 'percentage' ? `${c.data.discount_value}% off` : `${formatPrice(Number(c.data?.discount_value || 0))} off`} · Expires {c.data?.expires_at || 'Never'} · Limit {c.data?.usage_limit || 'Unlimited'}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(c)} className="rounded-full border border-cream-300 px-3 py-1.5 text-xs font-semibold">Edit</button>
              <button onClick={() => setCouponToDelete(c)} className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600">Delete</button>
            </div>
          </div>
        ))}
        {!coupons.length && <p className="rounded-2xl bg-cream-100/50 p-8 text-center text-sm text-ink-700/60">No coupons yet.</p>}
      </div>

      {(creating || editing) && (
        <CouponModal
          coupon={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); void load(); }}
        />
      )}

      {/* Confirmation Dialog for Deleting Coupon */}
      <ConfirmationDialog
        isOpen={!!couponToDelete}
        title="Delete Coupon Code?"
        message={`Are you sure you want to delete coupon code "${couponToDelete?.title}"?`}
        confirmText="Delete Coupon"
        cancelText="Cancel"
        variant="danger"
        itemName={couponToDelete?.title}
        isLoading={deleting}
        onConfirm={confirmDeleteCoupon}
        onCancel={() => setCouponToDelete(null)}
      />
    </section>
  );
}

function CouponModal({coupon,onClose,onSaved}:{coupon:Resource|null;onClose:()=>void;onSaved:()=>void}) { const [code,setCode]=useState(coupon?.title||'');const [type,setType]=useState(coupon?.data?.discount_type||'percentage');const [value,setValue]=useState(coupon?.data?.discount_value||'');const [expires,setExpires]=useState(coupon?.data?.expires_at||'');const [limit,setLimit]=useState(coupon?.data?.usage_limit||'');const save=async()=>{if(!supabase||!code||!value)return;const payload={kind:'coupon',title:code.toUpperCase(),active:true,data:{discount_type:type,discount_value:value,expires_at:expires,usage_limit:limit}};const {error}=coupon?await supabase.from('admin_resources').update(payload).eq('id',coupon.id):await supabase.from('admin_resources').insert(payload);if(!error)onSaved();};return <div className="fixed inset-0 z-[90] grid place-items-center bg-ink-900/50 p-4" onClick={onClose}><div className="w-full max-w-lg rounded-3xl bg-cream-50 p-6" onClick={e=>e.stopPropagation()}><h3 className="font-display text-xl font-semibold text-wine-700">{coupon?'Edit':'Create'} coupon</h3><div className="mt-5 space-y-3"><input className="input" placeholder="Code, e.g. FESTIVE20" value={code} onChange={e=>setCode(e.target.value)}/><div className="grid grid-cols-2 gap-3"><select className="input" value={type} onChange={e=>setType(e.target.value)}><option value="percentage">Percentage discount</option><option value="fixed">Fixed discount</option></select><input className="input" type="number" min="1" placeholder="Discount value" value={value} onChange={e=>setValue(e.target.value)}/></div><input className="input" type="date" value={expires} onChange={e=>setExpires(e.target.value)}/><input className="input" type="number" min="1" placeholder="Usage limit (optional)" value={limit} onChange={e=>setLimit(e.target.value)}/><div className="flex gap-3"><button onClick={()=>void save()} className="rounded-full bg-wine-600 px-5 py-2.5 text-sm font-semibold text-white">Save coupon</button><button onClick={onClose} className="rounded-full border border-cream-300 px-5 py-2.5 text-sm">Cancel</button></div></div></div></div>; }

export function ReviewManagement() {
  const [reviews, setReviews] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewToDelete, setReviewToDelete] = useState<Resource | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase.from('admin_resources').select('*').eq('kind', 'review').order('created_at', { ascending: false });
    setReviews((data || []) as Resource[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    if (!supabase) return;

    const channel = supabase
      .channel('realtime_reviews_admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_resources' },
        () => {
          void load();
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [load]);

  const setStatus = async (review: Resource, approved: boolean) => {
    if (supabase) {
      await supabase.from('admin_resources').update({ active: approved, data: { ...(review.data || {}), moderation: approved ? 'approved' : 'rejected' } }).eq('id', review.id);
      void load();
    }
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete || !supabase) return;
    setDeleting(true);
    await supabase.from('admin_resources').delete().eq('id', reviewToDelete.id);
    setDeleting(false);
    setReviewToDelete(null);
    void load();
  };

  return (
    <section>
      <h2 className="font-display text-2xl font-semibold text-wine-700">Reviews</h2>
      <p className="mt-1 text-sm text-ink-700/60">View customer feedback and approve, reject or remove inappropriate reviews.</p>
      {loading ? (
        <LoadingSkeleton type="table" count={3} />
      ) : (
        <div className="mt-6 space-y-3">
          {reviews.length ? (
            reviews.map(review => (
              <article key={review.id} className="rounded-2xl bg-cream-100/50 p-5 ring-1 ring-cream-200">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-wine-700">{review.title}</h3>
                    <p className="mt-1 text-sm text-ink-700/65">{review.subtitle || 'No review text'}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${review.active ? 'bg-sage-500/15 text-sage-500' : 'bg-red-50 text-red-600'}`}>
                    {review.data?.moderation || (review.active ? 'approved' : 'rejected')}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => void setStatus(review, true)} className="inline-flex items-center gap-1 rounded-full bg-sage-500 px-3 py-1.5 text-xs font-semibold text-white">
                    <Check className="h-3.5 w-3.5" />Approve
                  </button>
                  <button onClick={() => void setStatus(review, false)} className="rounded-full border border-gold-500/40 px-3 py-1.5 text-xs font-semibold text-gold-600">
                    Reject
                  </button>
                  <button onClick={() => setReviewToDelete(review)} className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600">
                    <Trash2 className="h-3.5 w-3.5" />Delete
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-2xl bg-cream-100/50 p-8 text-center text-sm text-ink-700/60">No reviews awaiting moderation.</p>
          )}
        </div>
      )}

      {/* Confirmation Dialog for Deleting Review */}
      <ConfirmationDialog
        isOpen={!!reviewToDelete}
        title="Delete Customer Review?"
        message={`Are you sure you want to permanently delete this review for "${reviewToDelete?.title}"?`}
        confirmText="Delete Review"
        cancelText="Cancel"
        variant="danger"
        itemName={reviewToDelete?.title}
        isLoading={deleting}
        onConfirm={confirmDeleteReview}
        onCancel={() => setReviewToDelete(null)}
      />
    </section>
  );
}


export function Inventory({ products, onChanged }: { products: Product[]; onChanged: () => void }) { const low = products.filter(p => p.stock > 0 && p.stock <= 5); const [updating, setUpdating] = useState<string | null>(null); const updateStock = async (id:string, stock:number) => { if (!supabase) return; setUpdating(id); await supabase.from('products').update({ stock: Math.max(0, stock) }).eq('id',id); setUpdating(null); onChanged(); }; return <section><h2 className="font-display text-2xl font-semibold text-wine-700">Inventory</h2><p className="mt-1 text-sm text-ink-700/60">View and update stock, with low-stock and out-of-stock alerts.</p><div className="mt-6 grid gap-4 sm:grid-cols-3"><Stat label="Products" value={products.length} /><Stat label="Low stock alerts" value={low.length} /><Stat label="Out of stock" value={products.filter(p => p.stock === 0).length} /></div><div className="mt-6 space-y-2">{products.map(p => <div key={p.id} className="flex flex-col gap-3 rounded-2xl bg-cream-100/50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><span className="font-medium text-wine-700">{p.name}</span><p className={`mt-1 text-xs font-semibold ${p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-gold-600' : 'text-sage-500'}`}>{p.stock === 0 ? 'Out of stock' : p.stock <= 5 ? 'Low stock alert' : 'In stock'}</p></div><div className="flex items-center gap-2"><input type="number" min="0" defaultValue={p.stock} onBlur={e => { const value = Number(e.target.value); if (value !== p.stock) void updateStock(p.id, value); }} className="w-24 rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm outline-none" aria-label={`Stock for ${p.name}`} /><span className="text-xs text-ink-700/60">{updating === p.id ? 'Saving…' : 'units'}</span></div></div>)}</div></section>; }
export function Notifications() {
  const [items, setItems] = useState<any[]>([]);
  const [type, setType] = useState<'customer' | 'order' | 'promotional'>('promotional');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const STORAGE_KEY = 'as_hamper_admin_notifications_v1';

  const load = async () => {
    let loadedItems: any[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) loadedItems = JSON.parse(saved);
    } catch {
      loadedItems = [];
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('customer_notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30);

        if (!error && data && data.length > 0) {
          const mergedMap = new Map();
          data.forEach((i: any) => mergedMap.set(i.id, i));
          loadedItems.forEach((i: any) => mergedMap.set(i.id, i));
          loadedItems = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
      } catch (err) {
        console.warn('Supabase notifications fetch fallback:', err);
      }
    }

    setItems(loadedItems);
  };

  useEffect(() => {
    void load();
  }, []);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    setFeedback(null);

    const newNotif = {
      id: `notif-${Date.now()}`,
      type,
      title: title.trim(),
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    // Save to local storage first (fail-safe)
    const updated = [newNotif, ...items];
    setItems(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving notification locally:', err);
    }

    // Try Supabase insert
    if (supabase) {
      try {
        await supabase.from('customer_notifications').insert({
          type,
          title: title.trim(),
          message: message.trim(),
        });
      } catch (err) {
        console.warn('Supabase notification insert warning:', err);
      }
    }

    setSending(false);
    setTitle('');
    setMessage('');
    setFeedback('✅ Notification published successfully to customers!');
    setTimeout(() => setFeedback(null), 4000);
  };

  const removeNotification = async (id: string) => {
    const filtered = items.filter((i) => i.id !== id);
    setItems(filtered);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (err) {
      console.error('Error removing notification:', err);
    }

    if (supabase) {
      try {
        await supabase.from('customer_notifications').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase notification delete error:', err);
      }
    }
  };

  return (
    <section>
      <div className="mb-2">
        <h2 className="font-display text-2xl font-semibold text-wine-700">Customer Notifications</h2>
        <p className="mt-1 text-sm text-ink-700/60">
          Publish announcements, order status alerts, and promotional discount notifications.
        </p>
      </div>

      {feedback && (
        <div className="mt-4 rounded-2xl bg-sage-500/15 p-4 border border-sage-500/30 text-xs font-bold text-sage-800 animate-fade-in">
          {feedback}
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <form onSubmit={send} className="rounded-3xl bg-cream-100/50 p-6 ring-1 ring-cream-200">
          <h3 className="font-display text-lg font-semibold text-wine-700">Publish New Notification</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-700/60 mb-1">
                Notification Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
                className="input"
              >
                <option value="promotional">📢 Promotional / Discount Notice</option>
                <option value="order">📦 Order Status & Shipping Alert</option>
                <option value="customer">💬 Customer Service Announcement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-700/60 mb-1">
                Title *
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="e.g. Diwali Luxe Hampers 20% OFF!"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-700/60 mb-1">
                Message Content *
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input resize-none"
                rows={4}
                placeholder="Write the message that customers will see in their dashboard..."
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-full bg-wine-600 py-3 text-xs font-bold text-white shadow transition-all hover:bg-wine-700 disabled:opacity-60"
            >
              {sending ? 'Publishing...' : 'Publish Notification'}
            </button>
          </div>
        </form>

        <div className="rounded-3xl bg-cream-100/50 p-6 ring-1 ring-cream-200">
          <h3 className="font-display text-lg font-semibold text-wine-700 mb-1">
            Notification History ({items.length})
          </h3>
          <p className="text-xs text-ink-700/55 mb-4">Past published notifications sent to customers.</p>

          <div className="max-h-[380px] space-y-3 overflow-y-auto pr-1">
            {items.length > 0 ? (
              items.map((i) => (
                <div key={i.id} className="relative rounded-2xl bg-cream-50 p-4 border border-cream-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-block rounded-full bg-gold-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-700 mb-1">
                        {i.type}
                      </span>
                      <h4 className="font-display font-bold text-wine-800 text-sm">{i.title}</h4>
                    </div>

                    <button
                      onClick={() => removeNotification(i.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold p-1"
                      title="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-ink-700/75 leading-relaxed">{i.message}</p>
                  <p className="mt-3 text-[10px] font-medium text-gray-400">
                    Published: {new Date(i.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-12 text-center text-xs text-ink-700/60 font-medium">
                No notifications published yet. Use the form on the left to send your first message.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
export function Reports({ products, orders }: { products: Product[]; orders: any[] }) { const paid = orders.filter(o => o.status !== 'cancelled'); const revenue = paid.reduce((sum, o) => sum + o.total, 0); const delivered = orders.filter(o => o.status === 'delivered').length; const customers = new Set(orders.map(o => o.customer_email).filter(Boolean)).size; const productSales = new Map<string, number>(); orders.forEach(o => (o.items || []).forEach((i:any) => productSales.set(i.name, (productSales.get(i.name)||0) + i.qty))); const leaders = [...productSales.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5); const statuses = ['new','packed','shipped','delivered','cancelled']; return <section><h2 className="font-display text-2xl font-semibold text-wine-700">Reports & analytics</h2><p className="mt-1 text-sm text-ink-700/60">Live sales, revenue, customers, product performance and order statistics.</p><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Sales revenue" value={formatPrice(revenue)} /><Stat label="Completed orders" value={delivered} /><Stat label="Purchasing customers" value={customers} /><Stat label="Average order value" value={paid.length ? formatPrice(Math.round(revenue / paid.length)) : formatPrice(0)} /></div><div className="mt-6 grid gap-5 xl:grid-cols-2"><div className="rounded-3xl bg-cream-100/50 p-6 ring-1 ring-cream-200"><h3 className="font-display text-lg font-semibold text-wine-700">Sales & revenue report</h3><div className="mt-5 flex h-44 items-end gap-3">{[...Array(7)].map((_,i)=>{const amount=orders.filter(o=>new Date(o.created_at).getDay()===i).reduce((s,o)=>s+(o.status==='cancelled'?0:o.total),0); const max=Math.max(revenue,1); return <div key={i} className="flex flex-1 flex-col justify-end"><div className="rounded-t-lg bg-wine-600" style={{height:`${Math.max(6,(amount/max)*100)}%`}} title={formatPrice(amount)} /><span className="mt-2 text-center text-[10px] text-ink-700/50">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i]}</span></div>})}</div></div><div className="rounded-3xl bg-cream-100/50 p-6 ring-1 ring-cream-200"><h3 className="font-display text-lg font-semibold text-wine-700">Order statistics</h3><div className="mt-5 space-y-3">{statuses.map(s=><div key={s} className="flex items-center justify-between"><span className="capitalize text-sm text-ink-700/65">{s}</span><span className="font-semibold text-wine-700">{orders.filter(o=>o.status===s).length}</span></div>)}</div></div><div className="rounded-3xl bg-cream-100/50 p-6 ring-1 ring-cream-200"><h3 className="font-display text-lg font-semibold text-wine-700">Product performance</h3><div className="mt-5 space-y-3">{leaders.length ? leaders.map(([name,qty])=><div key={name} className="flex justify-between gap-4"><span className="truncate text-sm text-ink-700/65">{name}</span><span className="font-semibold text-wine-700">{qty} sold</span></div>) : <p className="text-sm text-ink-700/60">Product performance appears after orders are placed.</p>}</div></div><div className="rounded-3xl bg-cream-100/50 p-6 ring-1 ring-cream-200"><h3 className="font-display text-lg font-semibold text-wine-700">Customer report</h3><p className="mt-5 font-display text-4xl font-semibold text-wine-700">{customers}</p><p className="mt-1 text-sm text-ink-700/60">unique customers have placed an order.</p><p className="mt-5 text-sm text-ink-700/65">Top category: {products.find(p=>p.is_best_seller)?.category || products[0]?.category || '—'}</p></div></div></section>; }
export function AdminSettings() {
  const { profile, session } = useAuth();
  const [name, setName] = useState(profile?.full_name || ''); const [phone, setPhone] = useState(profile?.phone || ''); const [email, setEmail] = useState(session?.user.email || ''); const [newPassword, setNewPassword] = useState(''); const [message, setMessage] = useState<string | null>(null); const [saving, setSaving] = useState(false);
  useEffect(() => { setName(profile?.full_name || ''); setPhone(profile?.phone || ''); setEmail(session?.user.email || ''); }, [profile, session?.user.email]);
  async function saveProfile(event: FormEvent) { event.preventDefault(); if (!supabase || !profile) return; setSaving(true); setMessage(null); const { error } = await supabase.from('profiles').update({ full_name: name, phone }).eq('id', profile.id); setSaving(false); setMessage(error ? error.message : 'Admin profile saved.'); }
  async function changeEmail(event: FormEvent) { event.preventDefault(); if (!supabase) return; setSaving(true); setMessage(null); const { error } = await supabase.auth.updateUser({ email }); setSaving(false); setMessage(error ? error.message : 'Confirmation links were sent to your current and new email address.'); }
  async function changePassword(event: FormEvent) { event.preventDefault(); if (!supabase) return; if (newPassword.length < 8) { setMessage('Use a password of at least 8 characters.'); return; } setSaving(true); setMessage(null); const { error } = await supabase.auth.updateUser({ password: newPassword }); setSaving(false); if (!error) setNewPassword(''); setMessage(error ? error.message : 'Password updated securely.'); }
  return <section><h2 className="font-display text-2xl font-semibold text-wine-700">Admin settings</h2><p className="mt-1 text-sm text-ink-700/60">Manage the configured administrator profile, email, password and authentication security.</p>{message && <p className="mt-5 rounded-2xl bg-sage-500/10 px-4 py-3 text-sm text-sage-700">{message}</p>}<div className="mt-6 grid gap-5 xl:grid-cols-2"><form onSubmit={saveProfile} className="rounded-3xl bg-cream-100/50 p-6 ring-1 ring-cream-200"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-wine-700" /><div><h3 className="font-display text-lg font-semibold text-wine-700">Admin profile</h3><p className="text-xs text-ink-700/60">Display and contact information.</p></div></div><div className="mt-5 space-y-3"><input className="input" placeholder="Administrator name" value={name} onChange={e => setName(e.target.value)} /><input className="input" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} /><button disabled={saving} className="rounded-full bg-wine-600 px-4 py-2.5 text-sm font-semibold text-white">Save profile</button></div></form><form onSubmit={changeEmail} className="rounded-3xl bg-cream-100/50 p-6 ring-1 ring-cream-200"><div className="flex items-center gap-3"><Settings className="h-5 w-5 text-wine-700" /><div><h3 className="font-display text-lg font-semibold text-wine-700">Admin email</h3><p className="text-xs text-ink-700/60">Changing it requires email confirmation.</p></div></div><div className="mt-5 space-y-3"><input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} /><button disabled={saving} className="rounded-full bg-wine-600 px-4 py-2.5 text-sm font-semibold text-white">Update email</button></div></form><form onSubmit={changePassword} className="rounded-3xl bg-cream-100/50 p-6 ring-1 ring-cream-200"><div className="flex items-center gap-3"><Check className="h-5 w-5 text-wine-700" /><div><h3 className="font-display text-lg font-semibold text-wine-700">Password & security</h3><p className="text-xs text-ink-700/60">Set a new secure password for this account.</p></div></div><div className="mt-5 space-y-3"><input className="input" type="password" minLength={8} required placeholder="New password (8+ characters)" value={newPassword} onChange={e => setNewPassword(e.target.value)} /><button disabled={saving} className="rounded-full bg-wine-600 px-4 py-2.5 text-sm font-semibold text-white">Update password</button></div></form><div className="rounded-3xl bg-wine-700 p-6 text-cream-50"><div className="flex items-center gap-3"><Eye className="h-5 w-5 text-gold-300" /><div><h3 className="font-display text-lg font-semibold">Authentication settings</h3><p className="text-xs text-cream-200/75">Current account security status.</p></div></div><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-cream-200/75">Email verification</dt><dd className="font-semibold">{session?.user.email_confirmed_at ? 'Verified' : 'Pending'}</dd></div><div className="flex justify-between gap-4"><dt className="text-cream-200/75">Last sign-in</dt><dd className="font-semibold">{session?.user.last_sign_in_at ? new Date(session.user.last_sign_in_at).toLocaleString('en-IN') : '—'}</dd></div><div className="flex justify-between gap-4"><dt className="text-cream-200/75">Role protection</dt><dd className="font-semibold">Database enforced</dd></div><div className="flex justify-between gap-4"><dt className="text-cream-200/75">Admin accounts</dt><dd className="font-semibold">One only</dd></div></dl></div></div></section>;
}
function Stat({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl bg-cream-100/50 p-5 ring-1 ring-cream-200"><p className="font-display text-2xl font-semibold text-wine-700">{value}</p><p className="mt-1 text-sm text-ink-700/60">{label}</p></div>; }

export function BestSellersAdmin({ products, onChanged }: { products: Product[]; onChanged: () => void }) {
  const [updating, setUpdating] = useState<string | null>(null);

  const toggleBestSeller = async (p: Product) => {
    const isBest = p.tag?.toLowerCase().includes('best');
    const newTag = isBest ? '' : 'Best seller';

    if (supabase) {
      setUpdating(p.id);
      await supabase.from('products').update({ tag: newTag }).eq('id', p.id);
      setUpdating(null);
      onChanged();
    }
  };

  const updateTag = async (p: Product, tag: string) => {
    if (supabase) {
      setUpdating(p.id);
      await supabase.from('products').update({ tag }).eq('id', p.id);
      setUpdating(null);
      onChanged();
    }
  };

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-wine-700">Best Sellers Management</h2>
          <p className="mt-1 text-sm text-ink-700/60">
            Mark or unmark products as Best Sellers, customize promotional badges, and feature items on the customer website.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const isBest = p.tag?.toLowerCase().includes('best');

          return (
            <div
              key={p.id}
              className={`rounded-2xl p-4 ring-1 transition-all ${
                isBest
                  ? 'bg-gold-500/10 ring-gold-400/50'
                  : 'bg-cream-100/50 ring-cream-200'
              }`}
            >
              <div className="flex gap-3">
                <img src={p.image} alt={p.name} className="h-16 w-16 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-wine-700 line-clamp-1">{p.name}</h3>
                  <p className="text-xs text-ink-700/60 font-semibold">{formatPrice(p.price)}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 bg-gold-500/15 px-2 py-0.5 rounded-full">
                      {p.tag || 'No Badge'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-cream-200 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink-700/60">Promotional Badge:</span>
                  <select
                    value={p.tag || ''}
                    onChange={(e) => void updateTag(p, e.target.value)}
                    disabled={updating === p.id}
                    className="rounded-lg border border-cream-300 bg-cream-50 px-2 py-1 text-xs outline-none"
                  >
                    <option value="">None</option>
                    <option value="Best seller">Best seller</option>
                    <option value="Popular">Popular</option>
                    <option value="Trending">Trending</option>
                    <option value="Limited Edition">Limited Edition</option>
                    <option value="New">New Arrival</option>
                  </select>
                </div>

                <button
                  onClick={() => void toggleBestSeller(p)}
                  disabled={updating === p.id}
                  className={`w-full rounded-full py-2 text-xs font-semibold transition-colors ${
                    isBest
                      ? 'bg-gold-500 text-wine-950 hover:bg-gold-400'
                      : 'bg-wine-600 text-white hover:bg-wine-700'
                  }`}
                >
                  {updating === p.id
                    ? 'Updating...'
                    : isBest
                    ? '★ Mark as Regular'
                    : '★ Mark as Best Seller'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function SameDayDeliveryAdmin() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPincode, setNewPincode] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { fetchDeliverySettings } = await import('@/lib/deliverySettings');
      const data = await fetchDeliverySettings();
      setSettings(data);
      setLoading(false);
    }
    void load();
  }, []);

  const handleSave = async (updated: any) => {
    setSaving(true);
    setFeedback(null);
    const { saveDeliverySettings } = await import('@/lib/deliverySettings');
    const ok = await saveDeliverySettings(updated);
    setSettings(updated);
    setSaving(false);
    setFeedback(ok ? 'Same-day delivery configuration saved!' : 'Failed to save settings.');
  };

  const addPincode = () => {
    if (!newPincode.trim() || newPincode.length !== 6) return;
    const currentList = settings.eligiblePincodes || [];
    if (!currentList.includes(newPincode.trim())) {
      const updated = {
        ...settings,
        eligiblePincodes: [...currentList, newPincode.trim()],
      };
      void handleSave(updated);
    }
    setNewPincode('');
  };

  const removePincode = (code: string) => {
    const updated = {
      ...settings,
      eligiblePincodes: (settings.eligiblePincodes || []).filter((c: string) => c !== code),
    };
    void handleSave(updated);
  };

  if (loading || !settings) {
    return <LoadingSkeleton type="dashboard" />;
  }


  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-wine-700">Same-Day Delivery Settings</h2>
          <p className="mt-1 text-sm text-ink-700/60">
            Configure cutoff times, delivery charges, and eligible 6-digit PIN codes for same-day delivery.
          </p>
        </div>
      </div>

      {feedback && (
        <p className="mb-6 rounded-2xl bg-sage-500/10 px-4 py-3 text-sm text-sage-700 font-medium">
          {feedback}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* General Service Config */}
        <div className="rounded-3xl bg-cream-100/50 p-6 ring-1 ring-cream-200 space-y-4">
          <h3 className="font-display text-lg font-semibold text-wine-700">Service Configuration</h3>

          <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl bg-cream-50 ring-1 ring-cream-200">
            <span className="text-sm font-semibold text-wine-700">Enable Same-Day Delivery Service</span>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => handleSave({ ...settings, enabled: e.target.checked })}
              className="accent-wine-600 h-5 w-5"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-700/70 mb-1">Cutoff Time (24h)</label>
              <input
                type="time"
                value={settings.cutoffTime}
                onChange={(e) => handleSave({ ...settings, cutoffTime: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-700/70 mb-1">Same-Day Delivery Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={settings.sameDayFee}
                onChange={(e) => handleSave({ ...settings, sameDayFee: Number(e.target.value) })}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-700/70 mb-1">Standard Shipping Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={settings.standardFee}
                onChange={(e) => handleSave({ ...settings, standardFee: Number(e.target.value) })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-700/70 mb-1">Free Shipping Threshold (₹)</label>
              <input
                type="number"
                min="0"
                value={settings.freeDeliveryThreshold}
                onChange={(e) => handleSave({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* PIN Code List Manager */}
        <div className="rounded-3xl bg-cream-100/50 p-6 ring-1 ring-cream-200">
          <h3 className="font-display text-lg font-semibold text-wine-700 mb-1">Eligible PIN Codes ({settings.eligiblePincodes?.length || 0})</h3>
          <p className="text-xs text-ink-700/60 mb-4">Add or remove 6-digit Indian PIN codes eligible for same-day delivery.</p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit PIN"
              value={newPincode}
              onChange={(e) => setNewPincode(e.target.value.replace(/[^0-9]/g, ''))}
              className="input flex-1"
            />
            <button
              onClick={addPincode}
              className="rounded-full bg-wine-600 px-5 py-2 text-xs font-semibold text-white hover:bg-wine-700"
            >
              Add PIN
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1">
            {settings.eligiblePincodes?.map((code: string) => (
              <span
                key={code}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-mono font-semibold text-wine-800 shadow-sm border border-cream-300"
              >
                {code}
                <button
                  onClick={() => removePincode(code)}
                  className="text-red-500 hover:text-red-700 text-xs font-bold"
                  title="Remove PIN"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import {
  fetchAllReturnRequests,
  updateReturnStatusAndRefund,
  subscribeToRealtimeReturns,
  type ReturnRequest,
  type ReturnStatus,
} from '@/lib/orderSync';
import { RotateCcw } from 'lucide-react';

export function AdminReturnsManager() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const loadReturns = async () => {
    setLoading(true);
    const data = await fetchAllReturnRequests();
    setReturns(data);
    setLoading(false);
  };

  useEffect(() => {
    void loadReturns();
    const unSub = subscribeToRealtimeReturns(() => {
      void loadReturns();
    });
    return () => unSub();
  }, []);

  const handleStatusChange = async (retId: string, nextStatus: ReturnStatus) => {
    await updateReturnStatusAndRefund(retId, nextStatus);
    void loadReturns();
  };

  const filtered = returns.filter((r) => filter === 'all' || r.status === filter);

  return (
    <section className="font-sans">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-wine-700">
            Return &amp; Refund Management
          </h2>
          <p className="mt-1 text-sm text-ink-700/60">
            Review customer product return requests, update return status, and approve instant wallet refunds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-full border border-cream-300 bg-cream-50 px-4 py-2 text-xs font-semibold outline-none"
          >
            <option value="all">All Return Statuses</option>
            <option value="RETURN REQUESTED">RETURN REQUESTED</option>
            <option value="RETURN APPROVED">RETURN APPROVED</option>
            <option value="RETURN REJECTED">RETURN REJECTED</option>
            <option value="RETURN PICKUP">RETURN PICKUP</option>
            <option value="RETURNED">RETURNED</option>
            <option value="REFUND PENDING">REFUND PENDING</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" count={3} />
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-cream-100/50 p-12 text-center ring-1 ring-cream-200">
          <RotateCcw className="mx-auto h-10 w-10 text-gold-500 mb-2 opacity-60" />
          <p className="font-medium text-wine-800">No return requests found.</p>
          <p className="text-xs text-ink-700/50 mt-1">Customer return requests will appear here live.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl bg-cream-100/40 p-5 ring-1 ring-cream-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-wine-800 text-sm">#{r.return_id}</span>
                  <span className="text-xs text-ink-700/60">Order #{r.order_id.slice(0, 8)}</span>
                  <span className="rounded-full bg-gold-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-gold-700">
                    {r.status}
                  </span>
                </div>
                <p className="text-sm font-semibold text-wine-900">{r.product_name} (Qty: {r.quantity})</p>
                <p className="text-xs text-ink-700/70">
                  Customer: <b>{r.customer_name}</b> ({r.customer_email || 'No email'})
                </p>
                <p className="text-xs text-red-600 font-medium">Reason: {r.reason}</p>
                {r.description && <p className="text-xs text-ink-700/60 italic font-sans">"{r.description}"</p>}
              </div>

              <div className="flex flex-col items-end gap-3 shrink-0">
                <span className="text-base font-bold text-wine-800">{formatPrice(r.amount)}</span>

                <div className="flex flex-wrap items-center gap-2">
                  {r.status === 'RETURN REQUESTED' && (
                    <>
                      <button
                        onClick={() => void handleStatusChange(r.id, 'RETURN APPROVED')}
                        className="rounded-full bg-wine-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-wine-700 transition-colors"
                      >
                        Approve Return
                      </button>
                      <button
                        onClick={() => void handleStatusChange(r.id, 'RETURN REJECTED')}
                        className="rounded-full border border-red-300 px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {r.status === 'RETURN APPROVED' && (
                    <button
                      onClick={() => void handleStatusChange(r.id, 'RETURN PICKUP')}
                      className="rounded-full bg-gold-500 px-3.5 py-1.5 text-xs font-bold text-wine-950 hover:bg-gold-400 transition-colors"
                    >
                      Mark Pickup Scheduled
                    </button>
                  )}

                  {r.status === 'RETURN PICKUP' && (
                    <button
                      onClick={() => void handleStatusChange(r.id, 'RETURNED')}
                      className="rounded-full bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors"
                    >
                      Mark Returned / Received
                    </button>
                  )}

                  {(r.status === 'RETURNED' || r.status === 'REFUND PENDING') && (
                    <button
                      onClick={() => void handleStatusChange(r.id, 'REFUNDED')}
                      className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      Approve Wallet Refund ({formatPrice(r.amount)})
                    </button>
                  )}

                  {r.status === 'REFUNDED' && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="h-4 w-4" /> Refunded to Wallet
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

