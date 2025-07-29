import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const updatedSingleDataCompanyDetails = async (
  companyId,
  field,
  addData,
  deleteData = ""
) => {
  try {
    const companyRef = doc(db, "companies", companyId);
    const fieldName = field?.name;
    const fieldType = field?.type;

    if (!fieldName || !fieldType) {
      console.warn("Field name or type missing");
      return;
    }

    // Case: Both add and delete (only applicable for arrays)
    if (addData && deleteData && fieldType === "array") {
      const companyDoc = await getDoc(companyRef);
      const currentArray = companyDoc.data()?.[fieldName] || [];

      const updatedArray = currentArray.map((item) =>
        item === deleteData ? addData : item
      );

      await updateDoc(companyRef, { [fieldName]: updatedArray });
      return;
    }

    // Case: Delete only
    if (deleteData) {
      const updatePayload =
        fieldType === "string"
          ? { [fieldName]: deleteData }
          : fieldType === "array"
          ? { [fieldName]: arrayRemove(deleteData) }
          : null;

      if (updatePayload) {
        await updateDoc(companyRef, updatePayload);
      }
    }

    // Case: Add only
    if (addData) {
      const updatePayload =
        fieldType === "string"
          ? { [fieldName]: addData }
          : fieldType === "array"
          ? { [fieldName]: arrayUnion(addData) }
          : null;

      if (updatePayload) {
        await updateDoc(companyRef, updatePayload);
      }
    }
  } catch (error) {
    console.error("🔥 Error updating company details:", error);
  }
};

export default updatedSingleDataCompanyDetails;
