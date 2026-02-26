// Temporary scaffold stubs.
// Convex codegen will replace this file when `convex dev` or `convex codegen` runs.

type HandlerConfig = {
  args?: unknown;
  handler: (...args: any[]) => any;
};

export function query<T extends HandlerConfig>(config: T): any {
  return config;
}

export function mutation<T extends HandlerConfig>(config: T): any {
  return config;
}

export function action<T extends HandlerConfig>(config: T): any {
  return config;
}

export function httpAction<T extends (...args: any[]) => any>(handler: T): any {
  return handler;
}
