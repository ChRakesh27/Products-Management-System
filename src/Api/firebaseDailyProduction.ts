// data/firebaseDailyProduction.ts
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    Timestamp,
    updateDoc,
    where,
    type DocumentData,
    type WithFieldValue
} from "firebase/firestore";
import { db } from "../firebase";
import type { DailyProductionModel } from "../Model/DailyProductionModel";

// collection name
const COLLECTION = "dailyProduction";

const col = collection(db, COLLECTION);

// midnight Timestamp for YYYY-MM-DD
const tsForISODate = (yyyyMmDd: string) => {
    const d = new Date(`${yyyyMmDd}T00:00:00`);
    return Timestamp.fromDate(d);
};



// find doc for a given ISO date
export async function getDailyDocByDate(dateTS) {
    // const dateTS = tsForISODate(yyyyMmDd);
    const q = query(col, where("date", "==", dateTS), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...(d.data() as DailyProductionModel) };
}

// create a new daily doc (when none exists)
async function createDailyDoc(payload: DailyProductionModel) {
    const toWrite: WithFieldValue<DailyProductionModel> = {
        ...payload,
        createdAt: Timestamp.now(),
    };
    const ref = await addDoc(col, toWrite as DocumentData);
    const fresh = await getDoc(ref);
    return { id: ref.id, ...(fresh.data() as DailyProductionModel) };
}

// update machines for date (non-destructive to other fields)
export async function upsertDailyProductionForDate(dateTS, field: string, value: unknown) {
    const existing = await getDailyDocByDate(dateTS);

    if (existing?.id) {
        const ref = doc(db, COLLECTION, existing.id);
        await updateDoc(ref, {
            [field]: value,
            updatedAt: Timestamp.now(),
        });
        const fresh = await getDoc(ref);
        return { id: existing.id, ...(fresh.data() as DailyProductionModel) };
    }
    const payload: DailyProductionModel = {
        date: dateTS,
        production: {},
        materials: [],
        machines: [],
    }
    payload[field] = value;
    return createDailyDoc(payload);
}
