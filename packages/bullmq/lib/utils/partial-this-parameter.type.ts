export type PartialThisParameter<T, K extends keyof T> =
  T extends Record<K, infer U> ? Omit<T, K> & Partial<Record<K, U>> : T;
