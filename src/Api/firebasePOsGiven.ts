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
import type { POGivenModel } from "../Model/POEntry";
import { rawMaterialsAPI } from "./firebaseRawMaterial";



// ---------- Firestore wiring ----------
const COLLECTION = "poGivenManagement"; // keep the same name you used elsewhere
const poCol = collection(db, COLLECTION);

// ---------- API ----------
export const poGivenAPI = {
    async getAll(): Promise<any[]> {
        const q = query(poCol, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },

    async get(id: string): Promise<POGivenModel | null> {
        const ref = doc(db, COLLECTION, id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            return null
        }
        const data = snap.data()
        const payload = {
            id: snap.id,
            ...data,
        }
        return payload as POGivenModel;
    },

    async create(input: Omit<POGivenModel, "createdAt" | "updatedAt">): Promise<any> {
        const payload = {
            ...input,
            createdAt: serverTimestamp() as any,
            updatedAt: serverTimestamp() as any,
        };
        const docRef = await addDoc(poCol, payload);
        // const products = await Promise.all(input.products.map(async (item) => {
        //     item.poNo = input.poNo;
        //     const res = await rawMaterialsAPI.create(item)
        //     return res.id;
        // }))
        for (const rm of input.products) {
            rawMaterialsAPI.update(rm.materialId, {
                actualPrice: rm.actualPrice
            })
            const RawMaterialProductPayload = {
                type: "PoGiven",
                refId: docRef.id,
                poNo: input.poNo,
                quantity: rm.quantity,
                estimatedPrice: rm.estimatePrice,
                actualPrice: rm.actualPrice,
                total: rm.total
            }
            await addDoc(collection(db, "poRawMaterials", rm.materialId, "logs"), RawMaterialProductPayload);

        }
        return { id: docRef.id, ...payload }
    },

    async remove(id: string): Promise<void> {
        const ref = doc(db, COLLECTION, id);
        await deleteDoc(ref);
    },

    async update(id: string, patch: Partial<POGivenModel>): Promise<void> {
        // const products = await Promise.all(patch.products.map(async (item) => {
        //     if (item.id) {
        //         await rawMaterialsAPI.update(item.id, item)
        //         return item.id
        //     } else {
        //         item.poNo = patch.poNo;
        //         const res = await rawMaterialsAPI.create(item)
        //         return res.id;
        //     }
        // }))
        const ref = doc(db, COLLECTION, id)
        await updateDoc(ref, {
            ...patch,
            // products,
            updatedAt: serverTimestamp() as any,
        } as any);
    },

    async updateStatus(id: string, patch: Partial<POGivenModel>): Promise<void> {
        const ref = doc(db, COLLECTION, id)
        await updateDoc(ref, {
            ...patch,
            updatedAt: serverTimestamp() as any,
        } as any);
    },
};


