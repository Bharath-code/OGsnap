"use client";

import { useMutation, useQuery } from "convex/react";
import type { FunctionReference } from "convex/server";

export interface DashboardKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: number;
  lastUsedAt?: number;
  revokedAt?: number;
  status: "active" | "revoked";
}

export interface DashboardRender {
  id: string;
  originalUrl: string;
  title?: string;
  cacheHit: boolean;
  renderTimeMs: number;
  createdAt: number;
}

export interface DashboardUsage {
  month: string;
  plan: "free" | "hobby" | "pro" | "scale";
  rendersUsed: number;
  renderLimit: number;
  remaining: number;
}

export interface DashboardKeysPayload {
  success: true;
  user: {
    id: string;
    clerkId: string;
    email?: string;
    fullName?: string;
  };
  usage: DashboardUsage;
  keys: DashboardKey[];
}

export interface DashboardRendersPayload {
  success: true;
  user: {
    id: string;
    clerkId: string;
    email?: string;
    fullName?: string;
  };
  usage: DashboardUsage;
  renders: DashboardRender[];
}

const keysDashboardQuery = "dashboard/queries:getKeysPanelByClerkId" as unknown as FunctionReference<"query">;
const rendersDashboardQuery = "dashboard/queries:getRendersPanelByClerkId" as unknown as FunctionReference<"query">;
const createApiKeyMutation = "apiKeys/mutations:create" as unknown as FunctionReference<"mutation">;

export function useKeysDashboardData(clerkId: string | null | undefined): DashboardKeysPayload | null | undefined {
  return useQuery(keysDashboardQuery, clerkId ? { clerkId, apiKeyLimit: 50 } : "skip") as
    | DashboardKeysPayload
    | null
    | undefined;
}

export function useRendersDashboardData(
  clerkId: string | null | undefined,
): DashboardRendersPayload | null | undefined {
  return useQuery(rendersDashboardQuery, clerkId ? { clerkId, renderLimit: 25 } : "skip") as
    | DashboardRendersPayload
    | null
    | undefined;
}

export function useCreateApiKey(): (args: {
  userId: string;
  name: string;
}) => Promise<{ rawKey: string; keyPrefix: string }> {
  return useMutation(createApiKeyMutation) as (args: {
    userId: string;
    name: string;
  }) => Promise<{ rawKey: string; keyPrefix: string }>;
}
