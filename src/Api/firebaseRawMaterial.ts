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
    type WithFieldValue,
} from "firebase/firestore";
import { db } from "../firebase";
import type { RawMaterialModel } from "../Model/RawMaterial";

const COLLECTION = "poRawMaterials";
let usersDetails: any;
const storedUser = localStorage.getItem("user");
const loginData = JSON.parse(storedUser)
if (storedUser && loginData.siteName == "prod-mang-sys") {
    usersDetails = {
        ...loginData,
    };
}
const rawMaterialsCol = collection(db, "companies", usersDetails.asCompanies[0].companyId, COLLECTION);


function formatNumber(prefix, num) {
    return prefix + "-" + String(num).padStart(5, "0");
}

export const rawMaterialsAPI = {
    async list(): Promise<(RawMaterialModel & { id: string })[]> {
        const q = query(rawMaterialsCol, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...(d.data() as RawMaterialModel) }));
    },

    async get(id: string): Promise<RawMaterialModel & { id: string } | null> {
        const ref = doc(db, "companies", usersDetails.asCompanies[0].companyId, COLLECTION, id);
        const snap = await getDoc(ref);
        return snap.exists() ? { id: snap.id, ...(snap.data() as RawMaterialModel) } : null;
    },

    async create(input: Omit<RawMaterialModel, "id">) {
        const querySnapshotMC = await getDocs(rawMaterialsCol);
        let materialCount = (querySnapshotMC.size || 0) + 1
        const payload: WithFieldValue<RawMaterialModel> = {
            ...input,
            uid: formatNumber("MA", materialCount),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
        const ref = await addDoc(rawMaterialsCol, payload);
        const fresh = { id: ref.id, ...payload };

        return { id: ref.id, ...(fresh as RawMaterialModel) };
    },

    async update(id: string, patch: Partial<RawMaterialModel>) {
        const ref = doc(db, "companies", usersDetails.asCompanies[0].companyId, COLLECTION, id);
        await updateDoc(ref, { ...patch, updatedAt: Timestamp.now() });
    },

    async remove(id: string) {
        const ref = doc(db, "companies", usersDetails.asCompanies[0].companyId, COLLECTION, id);
        await deleteDoc(ref);
    },
    async getLogs(id) {
        const snap = await getDocs(collection(rawMaterialsCol, id, "logs"));
        return snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    },
};
