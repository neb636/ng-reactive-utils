export interface StorageSerializer<T> {
  /**
   * Deserialize value from storage string
   */
  read: (value: string) => T;
  /**
   * Serialize value to storage string
   */
  write: (value: T) => string;
}

export interface UseStorageOptions<T> {
  /**
   * Custom serializer for complex types.
   * @default JSON serializer
   */
  serializer?: StorageSerializer<T>;
  /**
   * Write default value to storage on initialization if not present.
   * @default true
   */
  writeDefaults?: boolean;
}
