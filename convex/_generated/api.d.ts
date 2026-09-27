/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as apiKeys_mutations from "../apiKeys/mutations.js";
import type * as apiKeys_queries from "../apiKeys/queries.js";
import type * as billing_http from "../billing/http.js";
import type * as billing_mutations from "../billing/mutations.js";
import type * as billing_queries from "../billing/queries.js";
import type * as billing_webhooks from "../billing/webhooks.js";
import type * as brand_actions from "../brand/actions.js";
import type * as brand_mutations from "../brand/mutations.js";
import type * as brand_queries from "../brand/queries.js";
import type * as dashboard_http from "../dashboard/http.js";
import type * as dashboard_queries from "../dashboard/queries.js";
import type * as dev_http from "../dev/http.js";
import type * as http from "../http.js";
import type * as leads_http from "../leads/http.js";
import type * as leads_mutations from "../leads/mutations.js";
import type * as lib_cache from "../lib/cache.js";
import type * as lib_llm from "../lib/llm.js";
import type * as lib_security from "../lib/security.js";
import type * as onboarding_http from "../onboarding/http.js";
import type * as render_actions from "../render/actions.js";
import type * as render_http from "../render/http.js";
import type * as render_mutations from "../render/mutations.js";
import type * as render_queries from "../render/queries.js";
import type * as render_template from "../render/template.js";
import type * as sites_actions from "../sites/actions.js";
import type * as sites_http from "../sites/http.js";
import type * as sites_mutations from "../sites/mutations.js";
import type * as sites_queries from "../sites/queries.js";
import type * as usage_mutations from "../usage/mutations.js";
import type * as usage_queries from "../usage/queries.js";
import type * as users_http from "../users/http.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "apiKeys/mutations": typeof apiKeys_mutations;
  "apiKeys/queries": typeof apiKeys_queries;
  "billing/http": typeof billing_http;
  "billing/mutations": typeof billing_mutations;
  "billing/queries": typeof billing_queries;
  "billing/webhooks": typeof billing_webhooks;
  "brand/actions": typeof brand_actions;
  "brand/mutations": typeof brand_mutations;
  "brand/queries": typeof brand_queries;
  "dashboard/http": typeof dashboard_http;
  "dashboard/queries": typeof dashboard_queries;
  "dev/http": typeof dev_http;
  http: typeof http;
  "leads/http": typeof leads_http;
  "leads/mutations": typeof leads_mutations;
  "lib/cache": typeof lib_cache;
  "lib/llm": typeof lib_llm;
  "lib/security": typeof lib_security;
  "onboarding/http": typeof onboarding_http;
  "render/actions": typeof render_actions;
  "render/http": typeof render_http;
  "render/mutations": typeof render_mutations;
  "render/queries": typeof render_queries;
  "render/template": typeof render_template;
  "sites/actions": typeof sites_actions;
  "sites/http": typeof sites_http;
  "sites/mutations": typeof sites_mutations;
  "sites/queries": typeof sites_queries;
  "usage/mutations": typeof usage_mutations;
  "usage/queries": typeof usage_queries;
  "users/http": typeof users_http;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
