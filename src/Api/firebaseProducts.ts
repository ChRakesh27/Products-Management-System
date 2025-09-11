// src/Api/firebaseProducts.ts
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
    updateDoc,
    where
} from "firebase/firestore";
import { db } from "../firebase";
import type { ProductMaterialModel, ProductModel } from "../Model/ProductModel";
import type { RawMaterialModel } from "../Model/RawMaterial";
import { rawMaterialsAPI } from "./firebaseRawMaterial";

const COLLECTION = "poProducts";
const productsCol = collection(db, COLLECTION);

function formatNumber(prefix, num) {
    return prefix + "-" + String(num).padStart(5, "0");
}
export const productsAPI = {
    async list(onlyApproved = false): Promise<ProductModel[]> {
        let q = query(productsCol, orderBy("createdAt", "desc"));
        if (onlyApproved) {
            q = query(productsCol, where("status", "==", "Approved"), orderBy("createdAt", "desc"));
        }
        const snap = await getDocs(q);
        return snap.docs.map((d) => {
            const data = d.data() as ProductModel;
            return { id: d.id, ...data };
        })
    },

    async get(id: string): Promise<ProductModel | null> {
        const ref = doc(db, COLLECTION, id);
        const snap = await getDoc(ref);
        if (!snap.exists()) return null;
        const data = snap.data();
        const rawMaterials = await Promise.all(data.rawMaterials.map(async (r) => {
            const materialData = await rawMaterialsAPI.get(r.materialId)
            return {
                id: materialData.id,
                name: materialData.name,
                description: materialData.description,
                size: materialData.size,
                color: materialData.color,
                unitType: materialData.unitType,
                ...r,
            }
        }));
        return { id: snap.id, ...(snap.data() as ProductModel), rawMaterials };
    },

    async create(input: Omit<ProductModel, "id">) {
        const { rawMaterials, ...rest } = input;
        const updatedRawMaterials: ProductMaterialModel[] = []
        const querySnapshotPC = await getDocs(productsCol);
        const productCount = (querySnapshotPC.size || 0) + 1
        const querySnapshotMC = await getDocs(collection(db, "rawMaterials"));
        let materialCount = (querySnapshotMC.size || 0) + 1

        if (rawMaterials?.length) {
            for (const rm of rawMaterials) {
                let materialId = rm.materialId;
                if (!materialId) {
                    const RawMaterialPayload: RawMaterialModel = {
                        uid: formatNumber("MA", materialCount),
                        gst: +rm.gst,
                        name: rm.name,
                        description: rm.description,
                        size: rm.size,
                        color: rm.color,
                        unitType: rm.unitType,
                        estimatedPrice: rm.estimatedPrice,
                        actualPrice: 0,
                        quantity: 0,
                        quantityUsed: 0,
                        quantityWastage: 0,
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now(),
                    }
                    const ref = await rawMaterialsAPI.create(RawMaterialPayload);
                    materialCount++;
                    // logAudit({
                    //     type: "CREATE",
                    //     action: "material.create",
                    //     ref: ref.id,
                    //     from: "material",
                    //     message: "Created the new Material",
                    //     data: ref,
                    //     sessionId: generateUUID(),
                    // })
                    materialId = ref.id;
                }
                updatedRawMaterials.push({
                    id: rm.id,
                    materialId,
                    estimatedPrice: rm.estimatedPrice,
                    quantity: rm.quantity,
                    gst: rm.gst,
                    totalAmount: rm.totalAmount,
                })
            }
        }
        const payload: ProductModel = {
            ...rest,
            uid: formatNumber("PR", productCount),
            rawMaterials: updatedRawMaterials,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        }
        const docRef = await addDoc(productsCol, payload);
        const fresh = { id: docRef.id, ...payload }
        if (updatedRawMaterials?.length) {
            for (const rm of updatedRawMaterials) {
                const RawMaterialProductPayload = {
                    type: "Product",
                    refId: docRef.id,
                    name: payload.name,
                    quantity: rm.quantity,
                    estimatedPrice: rm.estimatedPrice,
                    total: rm.totalAmount,
                }
                await addDoc(collection(db, "poRawMaterials", rm.materialId, "logs"), RawMaterialProductPayload);
            }
        }
        return fresh!;
    },

    async update(id: string, patch: Partial<ProductModel>) {
        const { rawMaterials, ...rest } = patch;
        const ref = doc(db, COLLECTION, id);
        await updateDoc(ref, { ...rest, updatedAt: Timestamp.now() });
        if (rawMaterials) {
            const rawCol = collection(ref, "rawMaterials");
            const snap = await getDocs(rawCol);
            for (const r of snap.docs) {
                await deleteDoc(r.ref);
            }
            for (const rm of rawMaterials) {
                await addDoc(rawCol, {
                    ...rm,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                });
            }
        }
    },
    async updateStatus(id: string, value: string) {
        const ref = doc(db, COLLECTION, id);
        await updateDoc(ref, { status: value, updatedAt: Timestamp.now() });
    },

    // async update(id: string, patch: Partial<ProductModel>) {
    //     const { rawMaterials, ...rest } = patch;
    //     const ref = doc(db, COLLECTION, id);
    //     await updateDoc(ref, { ...rest, updatedAt: Timestamp.now() });
    //     if (rawMaterials) {
    //         const rawCol = collection(ref, "rawMaterials");
    //         const snap = await getDocs(rawCol);
    //         for (const r of snap.docs) {
    //             await deleteDoc(r.ref);
    //         }
    //         for (const rm of rawMaterials) {
    //             await addDoc(rawCol, {
    //                 ...rm,
    //                 createdAt: Timestamp.now(),
    //                 updatedAt: Timestamp.now(),
    //             });
    //         }
    //     }
    // },

    async remove(id: string) {
        const ref = doc(db, COLLECTION, id);
        await deleteDoc(ref);
    },
    async getLogs(id) {
        const snap = await getDocs(collection(productsCol, id, "logs"));
        return snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    },
};
