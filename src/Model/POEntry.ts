import type { TimestampModel } from "./Date";


interface variant {
    size: string;
    color: string;
    quantityOrdered: number;
    unitPrice: number;
    total: number;
}
interface Products {
    name: string;
    description: string;
    variants: variant[];
}


export interface POEntry {
    supplier: string;
    poNumber: string;
    poDate: TimestampModel;
    products: Products[];
    deliveryDate: TimestampModel;
    paymentStatus: string;
    remarks: string;
    totalAmount: number;
    status: string;
    createdAt: TimestampModel;
    updatedAt: TimestampModel;

}