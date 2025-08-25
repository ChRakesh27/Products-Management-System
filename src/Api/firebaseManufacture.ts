// src/Api/firebaseManufacture.ts
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
import type { ManufactureModel } from "../Model/DailyProductionModel";


const COL = "poManufactures";
const colRef = collection(db, COL);

export const manufacturesAPI = {
    async getAll(): Promise<ManufactureModel[]> {
        const q = query(colRef, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...(d.data() as ManufactureModel) }));
    },

    async get(id: string): Promise<ManufactureModel | null> {
        const ref = doc(db, COL, id);
        const snap = await getDoc(ref);
        return snap.exists() ? ({ id: snap.id, ...(snap.data() as ManufactureModel) }) : null;
    },

    async create(input: Omit<ManufactureModel, "id" | "createdAt" | "updatedAt">) {
        const payload = {
            ...input,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
        const ref = await addDoc(colRef, payload);
        return { id: ref.id };
    },

    async update(id: string, patch: Partial<ManufactureModel>) {
        const ref = doc(db, COL, id);
        const safePatch: any = {
            ...patch,
            updatedAt: Timestamp.now(),
        };
        await updateDoc(ref, safePatch);
        return true;
    },

    async delete(id: string) {
        await deleteDoc(doc(db, COL, id));
    },
};
