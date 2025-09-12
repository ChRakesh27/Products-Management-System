import {
    addDoc,
    collection,
    doc,
    getDoc,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../firebase";
import type { Company } from "../Model/CompanyModel";

let usersDetails: any;
const storedUser = localStorage.getItem("user");
const loginData = JSON.parse(storedUser)
if (storedUser && loginData.siteName == "prod-mang-sys") {
    usersDetails = {
        ...loginData,
    };
}

export async function getCompanyById(): Promise<Company | null> {
    const companyDocRef = doc(db, "companies", usersDetails.asCompanies[0].companyId);
    const snap = await getDoc(companyDocRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Company) };
}

export async function updateCompany(payload: Partial<Company>) {
    const companyDocRef = doc(db, "companies", usersDetails.asCompanies[0].companyId);
    await updateDoc(companyDocRef, {
        ...payload,
        updatedAt: serverTimestamp(),
    });
    return companyDocRef;
}

export async function addCompanyAudit(
    entry: { section: string; action: string; description?: string }
) {
    return addDoc(collection(db, "companies", usersDetails.asCompanies[0].companyId, "audit"), {
        ...entry,
        date: serverTimestamp(),
    });
}

export async function uploadCompanyLogo(file: File, pathPrefix = "logos"): Promise<string> {
    const storageRef = ref(storage, `${pathPrefix}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
}
