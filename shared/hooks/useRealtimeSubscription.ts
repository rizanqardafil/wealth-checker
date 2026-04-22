/**
 * Real-time Subscription Hook (Placeholder)
 *
 * This hook will be implemented differently in web and mobile:
 * - Web: Uses Supabase Realtime client with WebSocket
 * - Mobile: Uses Supabase Realtime client with WebSocket
 *
 * Phase 1: Basic implementation
 * Phase 2: Add offline support + local caching
 */

// For now, this is just a type definition
// Actual implementation will be in web/src/lib/ and mobile/src/lib/

export interface UseRealtimeSubscriptionOptions<T> {
  table: string;
  userId: string;
  onUpdate?: (newData: T) => void;
  onError?: (error: Error) => void;
}

export interface UseRealtimeSubscriptionReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  unsubscribe: () => void;
}

/**
 * Hook for real-time subscriptions
 *
 * Usage in Web:
 * ```tsx
 * const { data, loading } = useRealtimeSubscription({
 *   table: 'accounts',
 *   userId: user.id,
 *   onUpdate: (newAccounts) => console.log('Updated!'),
 * });
 * ```
 *
 * Usage in Mobile:
 * ```tsx
 * const { data, loading } = useRealtimeSubscription({
 *   table: 'accounts',
 *   userId: user.id,
 *   onUpdate: (newAccounts) => console.log('Updated!'),
 * });
 * ```
 */
export function useRealtimeSubscription<T>(
  options: UseRealtimeSubscriptionOptions<T>
): UseRealtimeSubscriptionReturn<T> {
  // This will be implemented in:
  // - web/src/lib/hooks/useRealtimeSubscription.ts
  // - mobile/src/lib/hooks/useRealtimeSubscription.ts

  return {
    data: null,
    loading: true,
    error: null,
    unsubscribe: () => {},
  };
}
