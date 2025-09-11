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
import type { POReceivedModel } from "../Model/POEntry";
import type { ProductPoReceivedModel } from "../Model/ProductModel";
import type { RawMaterialPoReceivedModel } from "../Model/RawMaterial";
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

    async get(id: string): Promise<POReceivedModel | null> {
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
        return payload as POReceivedModel;
    },

    async create(input: Omit<POReceivedModel, "createdAt" | "updatedAt">): Promise<any> {
        const payload = {
            ...input,
            createdAt: serverTimestamp() as any,
            updatedAt: serverTimestamp() as any,
        };

        const ref = await addDoc(poCol, payload);
        for (const p of input.products) {
            const pPayload: ProductPoReceivedModel = {
                type: "PoReceived",
                refId: ref.id,
                poNo: input.poNo,
                quantity: p.quantityOrdered,
                unitPrice: p.unitPrice,
                total: p.totalAmount,
            }
            await addDoc(collection(db, "poProducts", p.id, "logs"), pPayload);
            for (const rm of p.rawMaterials) {
                const qty = rm.quantity * p.quantityOrdered;
                const rmPayload: RawMaterialPoReceivedModel = {
                    type: "PoReceived",
                    refId: ref.id,
                    poNo: input.poNo,
                    quantity: qty,
                    estimatedPrice: rm.estimatedPrice,
                    // poPrice:rm
                    total: qty * rm.estimatedPrice,
                }
                await addDoc(collection(db, "poRawMaterials", rm.materialId, "logs"), rmPayload);
            }
        }

        return { id: ref.id, ...payload }
    },

    async remove(id: string): Promise<void> {
        const ref = doc(db, COLLECTION, id);
        await deleteDoc(ref);
    },

    async update(id: string, patch: Partial<POReceivedModel>): Promise<void> {
        const products = await Promise.all(patch.products.map(async (item: any) => {
            item.updatedAt = serverTimestamp();
            item.deliveryDate = patch.deliveryDate;
            delete item.quantityUsed
            if (item.id) {
                await productsAPI.update(item.id, item)
                return item.id
            } else {
                item.poNo = patch.poNo;
                item.rawMaterials = []
                item.totalRaw = 0
                item.productionQty = 0;
                item.createdAt = serverTimestamp();
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
    async updateStatus(id: string, patch: Partial<POReceivedModel>): Promise<void> {
        const ref = doc(db, COLLECTION, id)
        await updateDoc(ref, {
            ...patch,
            updatedAt: serverTimestamp() as any,
        } as any);
    },
};


