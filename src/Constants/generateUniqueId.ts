import { v4 as uuidv4 } from "uuid";

// Function to generate a unique ID
function generateUUID(): string {
    return uuidv4();
}

export default generateUUID;