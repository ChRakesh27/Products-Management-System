// data/products.ts
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc
} from "firebase/firestore";
import { db } from "../firebase";
import type { ProductModel } from "../Model/ProductModel";
import type { RawMaterialVariantModel } from "../Model/RawMaterial";





const COLLECTION = "poProducts";
const COLLECTIONMaterial = "poRawMaterial";

// --- Collections ---
const productsCol = collection(db, COLLECTION);

function aggregateRows(rows: RawMaterialVariantModel[]) {
    const map = new Map<string, { materialId: string; id: string; qty: number }>();
    for (const r of rows) {
        if (!r.materialId || !r.id) {
            throw new Error("rawMaterials must include materialId and id");
        }
        const key = `${r.materialId}__${r.id}`;
        const prev = map.get(key);
        map.set(key, {
            materialId: r.materialId,
            id: r.id,
            qty: (prev?.qty ?? 0) + Number(r.quantityOrdered || 0),
        });
    }
    return [...map.values()];
}


export const productsAPI = {
    async getAll(): Promise<(ProductModel)[]> {
        const q = query(productsCol, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map((d) => {
            const data = d.data() as ProductModel;
            return {
                id: d.id,
                ...data,
            };
        })
    },
    async get(id: string): Promise<(ProductModel) | null> {
        const ref = doc(db, COLLECTION, id);
        const snap = await getDoc(ref);
        if (!snap.exists()) return null;
        const data = snap.data() as ProductModel;
        return { id: snap.id, ...data };
    },

    async create(input: ProductModel) {
        if (!input.name.trim()) throw new Error("Product name is required");
        const res = await addDoc(productsCol, {
            ...input,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
        return { id: res.id }
    },

    async update(id: string, patch: Partial<ProductModel>) {
        if (!patch.name.trim()) throw new Error("Product name is required");
        const ref = doc(db, COLLECTION, id);
        await updateDoc(ref, {
            ...patch,
            updatedAt: Timestamp.now(),
        });
    },

    async delete(id: string) {
        await deleteDoc(doc(db, COLLECTION, id));
    },

}