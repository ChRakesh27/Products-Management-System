import type { TimestampModel } from "./Date";
import type { RawMaterialModel } from "./RawMaterial";

export interface POEntry {
    id?: string;
    supplier: string;
    poNumber: string;
    poDate: TimestampModel;
    products: RawMaterialModel[];
    deliveryDate: TimestampModel;
    paymentStatus: string;
    remarks: string;
    totalAmount: number;
    createdAt?: TimestampModel;
    updatedAt?: TimestampModel;

}