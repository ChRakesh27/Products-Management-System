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
import { poReceivedAPI } from "./firebasePOsReceived";

// collection name
const COLLECTION = "dailyProduction";
let usersDetails: any;
const storedUser = localStorage.getItem("user");
const loginData = JSON.parse(storedUser)
if (storedUser && loginData.siteName == "prod-mang-sys") {
    usersDetails = {
        ...loginData,
    };
}
const col = collection(db, "companies", usersDetails.asCompanies[0].companyId, COLLECTION);


// find doc for a given ISO date
export async function getDailyDocByDate(dateTS) {
    const q = query(col, where("date", "==", dateTS), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...(d.data() as DailyProductionModel) };
}
export async function getDailyDocByCurrentMonth() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const startTS = Timestamp.fromDate(start);
    const endTS = Timestamp.fromDate(end);
    const q = query(
        col,
        where("date", ">=", startTS),
        where("date", "<=", endTS)
    );
    const snap = await getDocs(q);
    if (snap.empty) return [];
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as DailyProductionModel) }));
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
export async function upsertDailyProductionForDate(dateTS, productId: string, value: any, poId: string, products: any) {
    const existing = await getDailyDocByDate(dateTS);
    const updatedProducts = products.map(p => {
        if (p.id == productId) {
            if (existing?.id) {
                p.productionQty += value.output - (existing[productId]?.output || 0)
            } else {
                p.productionQty += value.output || 0;
            }
        }
        return p
    })
    await poReceivedAPI.updateProduction(poId, updatedProducts)

    if (existing?.id) {
        const ref = doc(db, "companies", usersDetails.asCompanies[0].companyId, COLLECTION, existing.id);
        await updateDoc(ref, {
            [productId]: value,
            updatedAt: Timestamp.now(),
        });
        const fresh = await getDoc(ref);
        return { id: existing.id, ...(fresh.data() as DailyProductionModel) };
    }
    const payload: DailyProductionModel = {
        date: dateTS,
    }
    payload[productId] = value;
    return createDailyDoc(payload);
}
