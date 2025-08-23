import {
    addDoc,
    collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, Timestamp, updateDoc, type DocumentData, type FirestoreDataConverter,
    type QueryDocumentSnapshot,
    type SnapshotOptions,
    type UpdateData,
    type WithFieldValue
} from "firebase/firestore";
import { db } from "../firebase";
import type { TimestampModel } from "../Model/Date";
import type { VendorModel } from "../Model/VendorModel";

export type VendorCreate = Omit<VendorModel, "id" | "createdAt" | "updatedAt">;

const COLLECTION = "poVendors";
// Converter: map Firestore Timestamp <-> JS Date for createdAt
const vendorConverter: FirestoreDataConverter<VendorModel> = {
    toFirestore(v: WithFieldValue<VendorModel>): DocumentData {
        const { id, createdAt, ...rest } = v as VendorModel;
        return {
            ...rest,
            createdAt: createdAt instanceof Date ? createdAt : Timestamp.now(),
        };
    },
    fromFirestore(snap: QueryDocumentSnapshot, options: SnapshotOptions): VendorModel {
        const data = snap.data(options) as Omit<VendorModel, "id"> & { createdAt?: TimestampModel };
        return {
            id: snap.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt : Timestamp.now(),
        };
    },
};


const vendorsCol = collection(db, COLLECTION).withConverter(vendorConverter);


export const vendorsAPI = {
    async list(): Promise<VendorModel[]> {
        try {
            const q = query(vendorsCol, orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            return snap.docs.map((d) => d.data());
        } catch {
            const snap = await getDocs(vendorsCol);
            return snap.docs.map((d) => d.data());
        }
    },
    async get(id: string): Promise<VendorModel | null> {
        const ref = doc(db, COLLECTION, id).withConverter(vendorConverter);
        const snap = await getDoc(ref);
        return snap.exists() ? snap.data() : null;
    },
    async create(input: Omit<VendorModel, "id">): Promise<VendorModel> {
        const payload: WithFieldValue<VendorModel> = {
            ...input,
            createdAt: input.createdAt ?? Timestamp.now(),
        };
        const ref = await addDoc(vendorsCol, payload);
        const fresh = await getDoc(ref);
        return fresh.data()!;
    },
    async update(id: string, patch: UpdateData<VendorModel>): Promise<void> {
        const ref = doc(db, COLLECTION, id).withConverter(vendorConverter);
        await updateDoc(ref, patch);
    },
    async remove(id: string): Promise<void> {
        const ref = doc(db, COLLECTION, id);
        await deleteDoc(ref);
    },
};