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
import { getCompanyById } from "./firebaseCompany";
import { rawMaterialsAPI } from "./firebaseRawMaterial";



// ---------- Firestore wiring ----------
const COLLECTION = "poGivenManagement"; // keep the same name you used elsewhere
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
export const poGivenAPI = {
    async getAll(): Promise<any[]> {
        const q = query(poCol, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },

    async get(id: string): Promise<POGivenModel | null> {
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
        return payload as POGivenModel;
    },

    async create(input: Omit<POGivenModel, "createdAt" | "updatedAt">): Promise<any> {
        const companyDetails = await getCompanyById()
        const payload = {
            ...input,
            billFrom: {
                id: companyDetails.id || "",
                name: companyDetails.name || "",
                phone: companyDetails.phone || "",
                email: companyDetails.email || "",
                website: companyDetails.website || "",
                panNumber: companyDetails.panNumber || "",
                companyLogo: companyDetails.companyLogo || "",
                gst: companyDetails.gst || "",
                nature: companyDetails.nature || "",
                address: companyDetails.address || "",
                city: companyDetails.city || "",
                state: companyDetails.state || "",
                stateCode: companyDetails.stateCode || "",
                pinCode: companyDetails.pinCode || "",
            },
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
                gst: rm.gst || 0,
                total: rm.total
            }
            await addDoc(collection(db, "companies", usersDetails.asCompanies[0].companyId, "poRawMaterials", rm.materialId, "logs"), RawMaterialProductPayload);

        }
        return { id: docRef.id, ...payload }
    },

    async remove(id: string): Promise<void> {
        const ref = doc(db, "companies", usersDetails.asCompanies[0].companyId, COLLECTION, id);
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
        const ref = doc(db, "companies", usersDetails.asCompanies[0].companyId, COLLECTION, id)
        await updateDoc(ref, {
            ...patch,
            // products,
            updatedAt: serverTimestamp() as any,
        } as any);
    },

    async updateStatus(id: string, patch: Partial<POGivenModel>): Promise<void> {
        const ref = doc(db, "companies", usersDetails.asCompanies[0].companyId, COLLECTION, id)
        await updateDoc(ref, {
            ...patch,
            updatedAt: serverTimestamp() as any,
        } as any);
    },
};


