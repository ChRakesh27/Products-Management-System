// src/hooks/useAudit.ts
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  logAudit,
  type AuditEventType,
  type AuditLogInput,
} from "../Api/firebaseAudit";
import generateUUID from "../Constants/generateUniqueId";

export function useAudit() {
  const sessionIdRef = useRef<string>(generateUUID());
  const queueRef = useRef<AuditLogInput[]>([]);
  const flushingRef = useRef(false);

  const enqueue = useCallback((evt: Omit<AuditLogInput, "sessionId">) => {
    queueRef.current.push({ ...evt, sessionId: sessionIdRef.current });
    if (!flushingRef.current) flushSoon();
  }, []);

  const flush = useCallback(async () => {
    if (flushingRef.current) return;
    flushingRef.current = true;
    try {
      while (queueRef.current.length) {
        const evt = queueRef.current.shift()!;
        await logAudit(evt);
      }
    } finally {
      flushingRef.current = false;
    }
  }, []);

  const flushSoon = useCallback(() => {
    // micro-queue: flush after short delay; coalesce multiple adds
    setTimeout(() => {
      flush().catch(() => {
        /* swallow */
      });
    }, 50);
  }, [flush]);

  useEffect(() => {
    const onBeforeUnload = () => {
      if (!queueRef.current.length) return;
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  return useMemo(
    () => ({
      log: enqueue,
      logType: (
        type: AuditEventType,
        action: string,
        payload: Omit<AuditLogInput, "sessionId" | "type" | "action">
      ) => enqueue({ type, action, ...payload }),
      sessionId: sessionIdRef.current,
      flush,
    }),
    [enqueue, flush]
  );
}
