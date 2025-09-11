// src/api/audit.ts
import {
    addDoc,
    collection,
    serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";


export type AuditEventType =
    | "SIGN_IN" | "SIGN_OUT"
    | "CREATE" | "UPDATE" | "DELETE" | "VIEW"
    | "ERROR" | "CUSTOM";

export type AuditLogInput = {
    type: AuditEventType;
    action: string;                      // e.g., "product.update"
    ref: string;
    from: string;
    message?: string;
    data?: Record<string, any>;          // keep small, avoid PII
    sessionId?: string;                  // pass from app (uuid)
};

const AUDIT_COLLECTION = "auditLogs";

export async function logAudit(event: AuditLogInput,) {
    const doc = {
        type: event.type,
        action: event.action,
        ref: event.ref ?? null,
        from: event.from ?? null,
        message: event.message ?? null,
        data: event.data ?? null,
        sessionId: event.sessionId ?? null,
        date: serverTimestamp(),
    };

    await addDoc(collection(db, AUDIT_COLLECTION), doc);
}

/**
 * Convenience wrappers
 */
export const Audit = {
    create: (action: string, from: string, ref: string, data?: any) =>
        logAudit({ type: "CREATE", action, ref, from, data }),
    update: (action: string, from: string, ref: string, data?: any) =>
        logAudit({ type: "UPDATE", action, ref, from, data }),
    remove: (action: string, from: string, ref: string, data?: any) =>
        logAudit({ type: "DELETE", action, ref, from, data }),
    view: (action: string, from: string, ref: string, data?: any) =>
        logAudit({ type: "VIEW", action, ref, from, data }),
};
