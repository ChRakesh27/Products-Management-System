// src/Api/firebasePO.ts
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc
} from "firebase/firestore";
import { db } from "../firebase";
import type { POEntry } from "../Model/POEntry";
import { productsAPI } from "./firebaseProducts";



// ---------- Firestore wiring ----------
const COLLECTION = "poReceivedManagement"; // keep the same name you used elsewhere
const poCol = collection(db, COLLECTION);

// ---------- API ----------
export const poReceivedAPI = {
    async getAll(): Promise<any[]> {
        const q = query(poCol, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },

    async get(id: string): Promise<POEntry | null> {
        const ref = doc(db, COLLECTION, id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            return null
        }
        const data = snap.data()
        const products = await Promise.all(data.products.map(async (pId) => {
            const res = await productsAPI.get(pId)
            return { id: res.id, ...res }
        }))
        const payload = {
            id: snap.id,
            ...data,
            products,
        }
        return payload as POEntry;
    },

    async create(input: Omit<POEntry, "createdAt" | "updatedAt">): Promise<any> {
        const products = await Promise.all(input.products.map(async (item: any) => {
            item.poNumber = input.poNumber;
            const res = await productsAPI.create(item)
            return res.id;
        }))
        const payload = {
            ...input,
            products,
            createdAt: serverTimestamp() as any,
            updatedAt: serverTimestamp() as any,
        };
        const ref = await addDoc(poCol, payload);
        return { id: ref.id }
    },

    async remove(id: string): Promise<void> {
        const ref = doc(db, COLLECTION, id);
        await deleteDoc(ref);
    },

    async update(id: string, patch: Partial<POEntry>): Promise<void> {
        const products = await Promise.all(patch.products.map(async (item: any) => {
            if (item.id) {
                await productsAPI.update(item.id, item)
                return item.id
            } else {
                item.poNumber = patch.poNumber;
                const res = await productsAPI.create(item)
                return res.id;
            }
        }))
        const ref = doc(db, COLLECTION, id)
        await updateDoc(ref, {
            ...patch,
            products,
            updatedAt: serverTimestamp() as any,
        } as any);
    },
};


