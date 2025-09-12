import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../firebase";
import type { UserDoc } from "../Model/UserModel";

export async function getUserById(userId: string): Promise<UserDoc | null> {
    const userDocRef = doc(db, "users", userId);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as UserDoc) };
}

export async function updateUserById(userId: string, payload: Partial<UserDoc>) {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, { ...payload, updatedAt: serverTimestamp() });
    return userDocRef;
}

export async function uploadUserPhoto(file: File): Promise<string> {
    const storageRef = ref(storage, `users/${auth.currentUser?.uid}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
}

export async function isPhoneTaken(local10DigitPhone: string): Promise<boolean> {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("phone", "==", local10DigitPhone));
    const snap = await getDocs(q);
    return !snap.empty;
}

export async function addCompanyAudit(companyId: string, userId: string) {
    const entry = {
        ref: doc(db, "users", userId),
        date: serverTimestamp(),
        section: "settings",
        action: "Update",
        description: "user profile details updated",
    };
    return addDoc(collection(db, "companies", companyId, "audit"), entry);
}
