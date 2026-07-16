import { db } from "@/lib/db";

/**
 * Server-side audit log helper. Call from API routes to record user actions.
 * Safe to call without awaiting (fire-and-forget) — failures are swallowed.
 */
export function audit(params: {
  userId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}): void {
  try {
    db.auditLog
      .create({
        data: {
          userId: params.userId ?? null,
          action: params.action,
          entity: params.entity ?? null,
          entityId: params.entityId ?? null,
          metadata: params.metadata ? JSON.stringify(params.metadata) : null,
          ipAddress: params.ipAddress ?? null,
        },
      })
      .catch(() => {
        // swallow — audit logging must never break the request
      });
  } catch {
    // swallow
  }
}
