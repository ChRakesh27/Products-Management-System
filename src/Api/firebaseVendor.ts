import {
    addDoc,
    collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, Timestamp, updateDoc, where, type DocumentData, type FirestoreDataConverter,
    type QueryDocumentSnapshot,
    type SnapshotOptions,
    type UpdateData,
    type WithFieldValue
} from "firebase/firestore";
import { db } from "../firebase";
import type { TimestampModel } from "../Model/Date";
import type { PartnerModel } from "../Model/VendorModel";

export type VendorCreate = Omit<PartnerModel, "id" | "createdAt" | "updatedAt">;

const COLLECTION = "poVendors";
// Converter: map Firestore Timestamp <-> JS Date for createdAt
const vendorConverter: FirestoreDataConverter<PartnerModel> = {
    toFirestore(v: WithFieldValue<PartnerModel>): DocumentData {
        const { id, createdAt, ...rest } = v as PartnerModel;
        return {
            ...rest,
            createdAt: createdAt instanceof Date ? createdAt : Timestamp.now(),
        };
    },
    fromFirestore(snap: QueryDocumentSnapshot, options: SnapshotOptions): PartnerModel {
        const data = snap.data(options) as Omit<PartnerModel, "id"> & { createdAt?: TimestampModel };
        return {
            id: snap.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt : Timestamp.now(),
        };
    },
};


const vendorsCol = collection(db, COLLECTION).withConverter(vendorConverter);


export const vendorsAPI = {
    async list(party = "all"): Promise<PartnerModel[]> {
        let q = query(vendorsCol, orderBy("createdAt", "desc"));
        if (party != "all") {
            q = query(vendorsCol, where("type", "==", party), orderBy("createdAt", "desc"));
        }
        const snap = await getDocs(q);
        return snap.docs.map((d) => d.data());
    },
    async get(id: string): Promise<PartnerModel | null> {
        const ref = doc(db, COLLECTION, id).withConverter(vendorConverter);
        const snap = await getDoc(ref);
        return snap.exists() ? snap.data() : null;
    },
    async create(input: Omit<PartnerModel, "id">): Promise<PartnerModel> {
        const payload: WithFieldValue<PartnerModel> = {
            ...input,
            createdAt: input.createdAt ?? Timestamp.now(),
        };
        const ref = await addDoc(vendorsCol, payload);
        const fresh = await getDoc(ref);
        return fresh.data()!;
    },
    async update(id: string, patch: UpdateData<PartnerModel>): Promise<void> {
        const ref = doc(db, COLLECTION, id).withConverter(vendorConverter);
        await updateDoc(ref, patch);
    },
    async remove(id: string): Promise<void> {
        const ref = doc(db, COLLECTION, id);
        await deleteDoc(ref);
    },
};