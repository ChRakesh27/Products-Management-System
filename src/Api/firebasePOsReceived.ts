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
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../firebase";
import type { POReceivedModel } from "../Model/POEntry";
import type { ProductPoReceivedModel } from "../Model/ProductModel";
import type { RawMaterialPoReceivedModel } from "../Model/RawMaterial";
import { productsAPI } from "./firebaseProducts";

// ---------- Firestore wiring ----------
const COLLECTION = "poReceivedManagement"; // keep the same name you used elsewhere
let usersDetails: any;
const storedUser = localStorage.getItem("user");
const loginData = JSON.parse(storedUser)
if (storedUser && loginData.siteName == "prod-mang-sys") {
    usersDetails = {
        ...loginData,
    };
}
const poCol = collection(db, "companies", usersDetails.asCompanies[0].companyId, COLLECTION);

// ---------- API ----------
export const poReceivedAPI = {
    async getAll(): Promise<any[]> {
        const q = query(poCol, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },

    async get(id: string): Promise<POReceivedModel | null> {
        const ref = doc(db, "companies", usersDetails.asCompanies[0].companyId, COLLECTION, id);
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
        let downloadURL = null;
        if (input?.fileUrl && input?.fileUrl?.name) {
            const storageRef = ref(storage, `poCustomers/${input.fileUrl.name}`);
            await uploadBytes(storageRef, input.fileUrl);
            downloadURL = await getDownloadURL(storageRef);
        }

        const payload = {
            ...input,
            fileUrl: downloadURL,
            createdAt: serverTimestamp() as any,
            updatedAt: serverTimestamp() as any,
        };



        const docRef = await addDoc(poCol, payload);
        for (const p of input.products) {
            const pPayload: ProductPoReceivedModel = {
                type: "PoReceived",
                refId: docRef.id,
                poNo: input.poNo,
                quantity: +p.quantityOrdered,
                unitPrice: +p.unitPrice,
                gst: +p.gst || 0,
                total: p.totalAmount,
            }
            await addDoc(collection(db, "companies", usersDetails.asCompanies[0].companyId, "poProducts", p.id, "logs"), pPayload);
            for (const rm of p.rawMaterials) {
                const qty = +rm.quantity * +p.quantityOrdered;
                const rmPayload: RawMaterialPoReceivedModel = {
                    type: "PoReceived",
                    refId: docRef.id,
                    poNo: input.poNo,
                    quantity: +qty,
                    estimatedPrice: rm.estimatedPrice,
                    gst: +rm.gst || 0,
                    total: qty * rm.estimatedPrice,
                }
                await addDoc(collection(db, "companies", usersDetails.asCompanies[0].companyId, "poRawMaterials", rm.materialId, "logs"), rmPayload);
            }
        }

        return { id: docRef.id, ...payload }
    },

    async remove(id: string): Promise<void> {
        const ref = doc(db, "companies", usersDetails.asCompanies[0].companyId, COLLECTION, id);
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
        const ref = doc(db, "companies", usersDetails.asCompanies[0].companyId, COLLECTION, id)
        await updateDoc(ref, {
            ...patch,
            products,
            updatedAt: serverTimestamp() as any,
        } as any);
    },
    async updateProduction(id: string, products): Promise<void> {
        const ref = doc(db, "companies", usersDetails.asCompanies[0].companyId, COLLECTION, id)
        await updateDoc(ref, {
            products,
            updatedAt: serverTimestamp() as any,
        } as any);
    },
    async updateStatus(id: string, patch: Partial<POReceivedModel>): Promise<void> {
        const ref = doc(db, "companies", usersDetails.asCompanies[0].companyId, COLLECTION, id)
        await updateDoc(ref, {
            ...patch,
            updatedAt: serverTimestamp() as any,
        } as any);
    },
};


