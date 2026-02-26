// Temporary scaffold stubs.
// Convex codegen will replace this file when `convex dev` or `convex codegen` runs.

type AnyRecord = Record<string, any>;

function createProxy(): AnyRecord {
  return new Proxy(
    {},
    {
      get(_target, _prop) {
        return createProxy();
      },
    },
  ) as AnyRecord;
}

export const api = createProxy();
