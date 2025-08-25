// data/products.ts
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    runTransaction,
    Timestamp
} from "firebase/firestore";
import { db } from "../firebase";
import type { ProductModel } from "../Model/ProductModel";
import type { RawMaterialModel, RawMaterialVariantModel } from "../Model/RawMaterial";





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
    async get(id: string): Promise<(ProductModel & { id: string, totalAmount: number }) | null> {
        const ref = doc(db, COLLECTION, id);
        const snap = await getDoc(ref);
        if (!snap.exists()) return null;
        const data = snap.data() as ProductModel;
        const totalAmount = (data.rawMaterials ?? []).reduce((s, r) => s + (r.total || 0), 0);
        return { id: snap.id, ...data, totalAmount };
    },

    async create(input: ProductModel) {
        if (!input.name.trim()) throw new Error("Product name is required");
        if (!input.rawMaterials?.length) throw new Error("At least one raw material is required");
        const aggregated = aggregateRows(input.rawMaterials);

        return await runTransaction(db, async (tx) => {
            // 1) Validate and stage material updates
            const materialUpdates = new Map<
                string,
                { ref: ReturnType<typeof doc>; variants: RawMaterialVariantModel[] }
            >();

            // Read each material only once
            const uniqueMaterialIds = [...new Set(aggregated.map((a) => a.materialId))];

            // Preload materials
            const materialsById = new Map<string, { ref: ReturnType<typeof doc>; data: RawMaterialModel }>();
            for (const materialId of uniqueMaterialIds) {
                const ref = doc(db, COLLECTIONMaterial, materialId);
                const snap = await tx.get(ref);
                if (!snap.exists()) throw new Error(`Raw material not found: ${materialId}`);
                materialsById.set(materialId, { ref, data: snap.data() as RawMaterialModel });
            }

            // Apply decrements in-memory
            for (const { materialId, id, qty } of aggregated) {
                const mat = materialsById.get(materialId)!;
                const variants = [...(mat.data.variants ?? [])];

                const idx = variants.findIndex((v) => v.id === id);
                if (idx === -1) throw new Error(`Variant not found: ${id} in material ${materialId}`);

                const v = { ...variants[idx] };
                const available = (Number(v.quantityOrdered) - Number(v.quantityUsed)) || 0;
                if (available < qty) {
                    throw new Error(`Insufficient stock for material=${materialId} variant=${id}. Available: ${available}`)
                }

                v.quantityUsed = Number(v.quantityUsed) + qty;
                variants[idx] = v;
                materialUpdates.set(materialId, { ref: mat.ref, variants });
            }

            // 2) Create product
            const prodRef = doc(productsCol); // pre-allocate id
            tx.set(prodRef, {
                ...input,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            // 3) Write all material updates
            for (const { ref, variants } of materialUpdates.values()) {
                tx.update(ref, { variants, updatedAt: Timestamp.now() });
            }

            return { id: prodRef.id };
        });
    },

    async update(id: string, patch: Partial<ProductModel>) {
        type AggRow = { materialId: string; id: string; qty: number };
        function toKey(materialId: string, id: string) {
            return `${materialId}__${id}`;
        }
        return await runTransaction(db, async (tx) => {
            // 1) Load existing product
            const prodRef = doc(db, COLLECTION, id);
            const prodSnap = await tx.get(prodRef);
            if (!prodSnap.exists()) {
                throw new Error("Product not found");
            }
            const existing = prodSnap.data() as ProductModel;



            // If no rawMaterials provided in patch, do a simple product update
            if (!patch.rawMaterials) {
                tx.update(prodRef, {
                    ...patch,
                    updatedAt: Timestamp.now(),
                });
                return { id };
            }

            // 2) Aggregate old and new
            const oldAgg = aggregateRows(existing.rawMaterials || []);
            const newAgg = aggregateRows(patch.rawMaterials || []);

            // Build maps for quick lookup
            const oldMap = new Map<string, AggRow>();
            for (const r of oldAgg) oldMap.set(toKey(r.materialId, r.id), r);
            const newMap = new Map<string, AggRow>();
            for (const r of newAgg) newMap.set(toKey(r.materialId, r.id), r);

            // 3) Compute diffs: delta = newQty - oldQty
            const touchedKeys = new Set<string>([
                ...oldMap.keys(),
                ...newMap.keys(),
            ]);

            type Delta = { materialId: string; id: string; delta: number };
            const deltas: Delta[] = [];
            for (const key of touchedKeys) {
                const [materialId, id] = key.split("__");
                const oldQty = oldMap.get(key)?.qty ?? 0;
                const newQty = newMap.get(key)?.qty ?? 0;
                const delta = newQty - oldQty;
                if (delta !== 0) {
                    deltas.push({ materialId, id, delta });
                }
            }

            // If nothing changes in materials, just patch product fields
            if (deltas.length === 0) {
                tx.update(prodRef, {
                    ...patch,
                    updatedAt: Timestamp.now(),
                });
                return { id };
            }

            // 4) Preload all materials that will change
            const materialIds = [...new Set(deltas.map((d) => d.materialId))];
            const materialsById = new Map<
                string,
                { ref: ReturnType<typeof doc>; variants: RawMaterialVariantModel[] }
            >();

            for (const materialId of materialIds) {
                const ref = doc(db, COLLECTIONMaterial, materialId);
                const snap = await tx.get(ref);
                if (!snap.exists()) throw new Error(`Raw material not found: ${materialId}`);
                const mat = snap.data() as RawMaterialModel;
                materialsById.set(materialId, {
                    ref,
                    variants: [...(mat.variants ?? [])],
                });
            }

            // 5) Apply deltas in-memory with validations
            for (const { materialId, id, delta } of deltas) {
                const mat = materialsById.get(materialId)!;
                const { variants } = mat;

                const idx = variants.findIndex((v) => v.id === id);
                if (idx === -1) throw new Error(`Variant not found: ${id} in material ${materialId}`);

                const v = { ...variants[idx] };
                const ordered = Number(v.quantityOrdered) || 0;
                const used = Number(v.quantityUsed) || 0;

                if (delta > 0) {
                    // Need to consume more
                    const available = ordered - used;
                    if (available < delta) {
                        throw new Error(
                            `Insufficient stock for material=${materialId} variant=${id}. ` +
                            `Available: ${available}, Required: ${delta}`
                        );
                    }
                    v.quantityUsed = used + delta;
                } else if (delta < 0) {
                    // Return usage
                    const newUsed = used + delta; // delta is negative
                    if (newUsed < 0) {
                        throw new Error(
                            `Invalid reconciliation: quantityUsed would drop below 0 for material=${materialId} variant=${id}`
                        );
                    }
                    v.quantityUsed = newUsed;
                }

                variants[idx] = v;
            }

            const productPatch = {
                ...patch,
                updatedAt: Timestamp.now(),
            };
            tx.update(prodRef, productPatch);

            for (const { ref, variants } of materialsById.values()) {
                tx.update(ref, { variants, updatedAt: Timestamp.now() });
            }

            return { id };
        });
    },

    async delete(id: string) {
        await deleteDoc(doc(db, COLLECTION, id));
    },

}