// firebaseProducts.ts
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
    type DocumentData,
    type FirestoreDataConverter,
    type QueryDocumentSnapshot,
    type SnapshotOptions,
    type UpdateData,
    type WithFieldValue
} from "firebase/firestore";
import { db } from "../firebase";
import type { RawMaterialModel } from "../Model/RawMaterial";



// If you prefer stricter create types
export type MaterialCreate = Omit<RawMaterialModel, "id" | "createdAt" | "updatedAt">;

// ----- Collection / converter --------------------------------------------
const COLLECTION = "poRawMaterial";

const materialConverter: FirestoreDataConverter<RawMaterialModel> = {
    toFirestore(p: WithFieldValue<RawMaterialModel>): DocumentData {
        const { id, ...rest } = p;
        return rest;
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): RawMaterialModel {
        const data = snapshot.data(options) as Omit<RawMaterialModel, "id">;
        return {
            id: snapshot.id,
            ...data,
        };
    },
};

const materialsCol = collection(db, COLLECTION).withConverter(materialConverter);

// ----- API ---------------------------------------------------------------
export const materialsAPI = {
    async getAll(): Promise<RawMaterialModel[]> {
        const q = query(materialsCol, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map((d) => d.data());
    },

    // Get one material by id
    async get(id: string): Promise<RawMaterialModel | null> {
        const ref = doc(db, COLLECTION, id).withConverter(materialConverter);
        const snap = await getDoc(ref);
        return snap.exists() ? snap.data() : null;
    },

    // Create a material
    async create(input: MaterialCreate): Promise<RawMaterialModel> {
        const payload: WithFieldValue<RawMaterialModel> = {
            ...input,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
        const ref = await addDoc(materialsCol, payload);
        const fresh = await getDoc(ref); // to return with id + resolved fields
        return fresh.data() as RawMaterialModel;
    },

    // Update partial fields
    async update(id: string, patch: UpdateData<RawMaterialModel>): Promise<void> {
        const ref = doc(db, COLLECTION, id).withConverter(materialConverter);
        await updateDoc(ref, { ...patch, updatedAt: Timestamp.now() });
    },

    // Delete
    async delete(id: string): Promise<void> {
        const ref = doc(db, COLLECTION, id);
        await deleteDoc(ref);
    },
};
