import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export type OrderStatus =
  | 'new'
  | 'placed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'refund_pending'
  | 'refunded';

export type VendorItemStatus =
  | 'new'
  | 'accepted'
  | 'processing'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type ReturnStatus =
  | 'RETURN REQUESTED'
  | 'RETURN APPROVED'
  | 'RETURN REJECTED'
  | 'RETURN PICKUP'
  | 'RETURNED'
  | 'REFUND PENDING'
  | 'REFUNDED';

export type OrderItem = {
  id?: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  vendorId?: string;
  vendorName?: string;
  itemStatus?: VendorItemStatus;
  returnStatus?: ReturnStatus;
};

export type ExtendedOrder = {
  id: string;
  order_number?: string;
  customer_id?: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: any;
  billing_address?: any;
  items: OrderItem[];
  subtotal?: number;
  delivery_charge?: number;
  wallet_discount?: number;
  total: number;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  status: OrderStatus;
  cancellation_reason?: string | null;
  cancelled_at?: string | null;
  refund_amount?: number;
  created_at: string;
  updated_at?: string;
};

export type WalletTransaction = {
  id: string;
  transaction_id: string;
  user_id: string;
  order_id?: string;
  type: 'refund' | 'purchase' | 'credit' | 'debit';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
};

export type ReturnRequest = {
  id: string;
  return_id: string;
  order_id: string;
  customer_id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  vendor_id?: string;
  quantity: number;
  amount: number;
  reason: string;
  description?: string;
  images?: string[];
  status: ReturnStatus;
  request_date: string;
  processed_date?: string;
  created_at: string;
};

// Local storage fallback keys
const WALLET_KEY_PREFIX = 'as_hamper_wallet_';
const TRANSACTIONS_KEY_PREFIX = 'as_hamper_tx_';
const RETURNS_KEY = 'as_hamper_returns';
const ORDERS_KEY = 'as_hamper_orders_list';

// --- Realtime Subscriptions Setup ---
export function subscribeToRealtimeOrders(
  onOrderChange: (payload: any) => void
) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('orders-realtime-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      (payload) => {
        onOrderChange(payload);
      }
    )
    .subscribe();

  return () => {
    supabase?.removeChannel(channel);
  };
}

export function subscribeToRealtimeReturns(
  onReturnChange: (payload: any) => void
) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('returns-realtime-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'returns' },
      (payload) => {
        onReturnChange(payload);
      }
    )
    .subscribe();

  return () => {
    supabase?.removeChannel(channel);
  };
}

export function subscribeToRealtimeWallet(
  userId: string,
  onWalletChange: (balance: number) => void
) {
  if (!supabase || !userId) return () => {};

  const channel = supabase
    .channel(`wallet-realtime-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${userId}` },
      () => {
        getWalletBalance(userId).then(onWalletChange);
      }
    )
    .subscribe();

  return () => {
    supabase?.removeChannel(channel);
  };
}

// --- Customer Wallet Engine ---
export async function getWalletBalance(userId: string): Promise<number> {
  if (!userId) return 0;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .maybeSingle();

      if (data && !error && typeof data.wallet_balance === 'number') {
        return data.wallet_balance;
      }
    } catch (e) {
      console.warn('Supabase wallet fetch warning:', e);
    }
  }

  // Fallback to local storage for guest/resilience
  try {
    const val = localStorage.getItem(`${WALLET_KEY_PREFIX}${userId}`);
    return val ? parseFloat(val) : 0;
  } catch (e) {
    return 0;
  }
}

export async function getWalletTransactions(userId: string): Promise<WalletTransaction[]> {
  if (!userId) return [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data && !error) {
        return data as WalletTransaction[];
      }
    } catch (e) {
      console.warn('Supabase wallet transactions warning:', e);
    }
  }

  try {
    const raw = localStorage.getItem(`${TRANSACTIONS_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function deductWalletBalance(
  userId: string,
  orderId: string,
  amount: number
): Promise<{ success: boolean; newBalance: number; txId: string }> {
  if (amount <= 0 || !userId) return { success: false, newBalance: 0, txId: '' };

  const currentBalance = await getWalletBalance(userId);
  if (currentBalance < amount) {
    toast.error('Insufficient wallet balance');
    return { success: false, newBalance: currentBalance, txId: '' };
  }

  const newBalance = currentBalance - amount;
  const txId = `TX-${Math.floor(100000 + Math.random() * 900000)}`;

  const tx: WalletTransaction = {
    id: txId,
    transaction_id: txId,
    user_id: userId,
    order_id: orderId,
    type: 'purchase',
    amount: amount,
    balance_before: currentBalance,
    balance_after: newBalance,
    description: `Applied ₹${amount} wallet balance to Order #${orderId.slice(0, 8)}`,
    status: 'completed',
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', userId);
      await supabase.from('wallet_transactions').insert(tx);
    } catch (e) {
      console.warn('Supabase wallet deduction warning:', e);
    }
  }

  try {
    localStorage.setItem(`${WALLET_KEY_PREFIX}${userId}`, newBalance.toString());
    const existing = await getWalletTransactions(userId);
    localStorage.setItem(`${TRANSACTIONS_KEY_PREFIX}${userId}`, JSON.stringify([tx, ...existing]));
  } catch (e) {
    console.error('LocalStorage wallet sync error:', e);
  }

  return { success: true, newBalance, txId };
}

export async function creditWalletBalance(
  userId: string,
  orderId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; newBalance: number; txId: string }> {
  if (amount <= 0 || !userId) return { success: false, newBalance: 0, txId: '' };

  const currentBalance = await getWalletBalance(userId);
  const newBalance = currentBalance + amount;
  const txId = `TX-REFUND-${Math.floor(100000 + Math.random() * 900000)}`;

  const tx: WalletTransaction = {
    id: txId,
    transaction_id: txId,
    user_id: userId,
    order_id: orderId,
    type: 'refund',
    amount: amount,
    balance_before: currentBalance,
    balance_after: newBalance,
    description: `Refund credited: ${reason} (Order #${orderId.slice(0, 8)})`,
    status: 'completed',
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', userId);
      await supabase.from('wallet_transactions').insert(tx);
    } catch (e) {
      console.warn('Supabase wallet credit warning:', e);
    }
  }

  try {
    localStorage.setItem(`${WALLET_KEY_PREFIX}${userId}`, newBalance.toString());
    const existing = await getWalletTransactions(userId);
    localStorage.setItem(`${TRANSACTIONS_KEY_PREFIX}${userId}`, JSON.stringify([tx, ...existing]));
  } catch (e) {
    console.error('LocalStorage wallet credit sync error:', e);
  }

  return { success: true, newBalance, txId };
}

// --- Order Cancellation Helper ---
export async function cancelCustomerOrder(
  orderId: string,
  userId: string,
  reason: string
): Promise<boolean> {
  if (!orderId) return false;

  const now = new Date().toISOString();

  if (supabase) {
    try {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderData) {
        if (['shipped', 'delivered', 'cancelled'].includes(orderData.status)) {
          toast.error('Order cannot be cancelled in current status.');
          return false;
        }

        await supabase
          .from('orders')
          .update({
            status: 'cancelled',
            cancellation_reason: reason,
            cancelled_at: now,
          })
          .eq('id', orderId);

        // Process refund to wallet if paid or wallet was used
        const totalRefundable = (orderData.total || 0) + (orderData.wallet_discount || 0);
        if (totalRefundable > 0 && userId) {
          await creditWalletBalance(userId, orderId, totalRefundable, `Cancellation: ${reason}`);
        }
      }
    } catch (err) {
      console.warn('Supabase cancel order warning:', err);
    }
  }

  toast.success('Order cancelled successfully. Refund credited to your wallet balance!');
  return true;
}

// --- Product Return System Helper ---
export async function submitReturnRequest(payload: {
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  productId: string;
  productName: string;
  productImage?: string;
  vendorId?: string;
  quantity: number;
  amount: number;
  reason: string;
  description?: string;
}): Promise<boolean> {
  const returnId = `RET-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();

  const reqRecord: ReturnRequest = {
    id: returnId,
    return_id: returnId,
    order_id: payload.orderId,
    customer_id: payload.customerId,
    customer_name: payload.customerName,
    customer_email: payload.customerEmail,
    customer_phone: payload.customerPhone,
    product_id: payload.productId,
    product_name: payload.productName,
    product_image: payload.productImage,
    vendor_id: payload.vendorId,
    quantity: payload.quantity,
    amount: payload.amount,
    reason: payload.reason,
    description: payload.description,
    status: 'RETURN REQUESTED',
    request_date: now,
    created_at: now,
  };

  if (supabase) {
    try {
      await supabase.from('returns').insert(reqRecord);
      await supabase
        .from('orders')
        .update({ status: 'return_requested' })
        .eq('id', payload.orderId);
    } catch (e) {
      console.warn('Supabase return request error:', e);
    }
  }

  // Local storage fallback
  try {
    const raw = localStorage.getItem(RETURNS_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    localStorage.setItem(RETURNS_KEY, JSON.stringify([reqRecord, ...existing]));
  } catch (e) {
    console.error('LocalStorage return sync error:', e);
  }

  toast.success(`Return request #${returnId} submitted successfully!`);
  return true;
}

export async function fetchAllReturnRequests(): Promise<ReturnRequest[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('returns')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) return data as ReturnRequest[];
    } catch (e) {
      console.warn('Supabase fetch returns warning:', e);
    }
  }

  try {
    const raw = localStorage.getItem(RETURNS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function updateReturnStatusAndRefund(
  returnId: string,
  nextStatus: ReturnStatus
): Promise<boolean> {
  const allReturns = await fetchAllReturnRequests();
  const target = allReturns.find((r) => r.id === returnId || r.return_id === returnId);

  if (!target) {
    toast.error('Return record not found');
    return false;
  }

  const now = new Date().toISOString();

  if (supabase) {
    try {
      await supabase
        .from('returns')
        .update({ status: nextStatus, processed_date: now })
        .eq('id', target.id);
    } catch (e) {
      console.warn('Supabase update return warning:', e);
    }
  }

  // Handle automatic refund execution when status moves to REFUNDED
  if (nextStatus === 'REFUNDED' && target.customer_id && target.amount > 0) {
    await creditWalletBalance(
      target.customer_id,
      target.order_id,
      target.amount,
      `Approved Return: ${target.product_name}`
    );

    if (supabase) {
      try {
        await supabase
          .from('orders')
          .update({ status: 'refunded' })
          .eq('id', target.order_id);
      } catch (e) {
        console.warn('Supabase update order status error:', e);
      }
    }
  }

  toast.success(`Return #${target.return_id} status updated to ${nextStatus}!`);
  return true;
}
