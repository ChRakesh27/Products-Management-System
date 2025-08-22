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
    serverTimestamp,
    updateDoc,
    type DocumentData,
    type FirestoreDataConverter,
    type QueryDocumentSnapshot,
    type SnapshotOptions,
    type UpdateData,
    type WithFieldValue,
} from "firebase/firestore";
import { db } from "../firebase";
import type { productModel } from "../Model/Product";



// If you prefer stricter create types
export type ProductCreate = Omit<productModel, "id" | "createdAt" | "updatedAt">;

// ----- Collection / converter --------------------------------------------
const COLLECTION = "poProducts";

const productConverter: FirestoreDataConverter<productModel> = {
    toFirestore(p: WithFieldValue<productModel>): DocumentData {
        const { id, ...rest } = p;
        return rest;
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): productModel {
        const data = snapshot.data(options) as Omit<productModel, "id">;
        return {
            id: snapshot.id,
            ...data,
        };
    },
};

const productsCol = collection(db, COLLECTION).withConverter(productConverter);

// ----- API ---------------------------------------------------------------
export const productsAPI = {
    async list(): Promise<productModel[]> {
        const q = query(productsCol, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map((d) => d.data());
    },

    // Get one product by id
    async get(id: string): Promise<productModel | null> {
        const ref = doc(db, COLLECTION, id).withConverter(productConverter);
        const snap = await getDoc(ref);
        return snap.exists() ? snap.data() : null;
    },

    // Create a product
    async create(input: ProductCreate): Promise<productModel> {
        const payload: WithFieldValue<productModel> = {
            ...input,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        const ref = await addDoc(productsCol, payload);
        const fresh = await getDoc(ref); // to return with id + resolved fields
        return fresh.data() as productModel;
    },

    // Update partial fields
    async update(id: string, patch: UpdateData<productModel>): Promise<void> {
        const ref = doc(db, COLLECTION, id).withConverter(productConverter);
        await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() });
    },

    // Delete
    async remove(id: string): Promise<void> {
        const ref = doc(db, COLLECTION, id);
        await deleteDoc(ref);
    },
};
