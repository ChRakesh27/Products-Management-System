import type { TimestampModel } from "./Date";
import type { ProductMaterialModel } from "./ProductModel";


interface PartyModel {
    id: string;
    type: "Vendor" | "Customer";
    name: string;
    email: string;
    phone: string;
    address: string;
    pinCode: string;
    state: string;
    gstNumber: string;
}

interface ProductModel {
    id: string;
    name: string;
    description: string;
    size: string;
    color: string;
    unitType: string;
    quantityOrdered: number;
    productionQty: number;
    unitPrice: number;
    totalAmount: number;
    rawMaterials: ProductMaterialModel[];
    gst: number;
}


export interface POReceivedModel {
    id?: string;
    supplier: PartyModel | null;
    poNo: string;
    poDate: TimestampModel;
    deliveryDate: TimestampModel;
    paymentStatus: string;
    status: string;
    remarks: string;
    products: ProductModel[];
    totalAmount: number;
    createdAt?: TimestampModel;
    updatedAt?: TimestampModel;
    notes: string;
    termConditions: string;
    preparedBy: string;
    verifiedBy: string;
    approvedBy: string;
    acceptedBy: string;
}

interface RawMaterialModel {
    id: string;
    materialId: string;
    name: string;
    description: string;
    size: string;
    color: string;
    unitType: string;
    quantity: number;
    estimatePrice: number;
    actualPrice: number;
    total: number;
    gst: number;

}


export interface POGivenModel {
    id?: string;
    supplier: PartyModel | null;
    poNo: string;
    poReceivedNumber: string;
    poReceivedId: string;
    poDate: TimestampModel;
    deliveryDate: TimestampModel;
    paymentStatus: string;
    status: string;
    remarks: string;
    products: RawMaterialModel[];
    totalAmount: number;
    createdAt?: TimestampModel;
    updatedAt?: TimestampModel;
    notes: string;
    termConditions: string;
}
