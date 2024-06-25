/**
 * Extends a service implementation
 */
export function overwriteImpl<T extends {}>(impl: T) {
  return (overwrite: Partial<T> = {}): T => ({
    ...impl,
    ...overwrite,
  });
}
