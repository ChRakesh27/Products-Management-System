import type { TimestampModel } from "./Date";

export interface RawMaterialModel {
    id?: string;
    uid: string;
    name: string;
    description: string;
    size: string;
    color: string;
    unitType: string;
    gst: number;
    quantity: number;
    quantityUsed: number;
    quantityWastage: number;
    estimatedPrice: number;
    actualPrice: number;
    createdAt?: TimestampModel;
    updatedAt?: TimestampModel;
}

// sub-collection
export interface RawMaterialProductModel {
    id?: string;
    type: "Product",
    refId: string;
    name: string;
    quantity: number;
    gst: number;
    estimatedPrice: number;
    total: number;
}
export interface RawMaterialPoReceivedModel {
    id?: string;
    type: "PoReceived",
    refId: string;
    poNo: string;
    quantity: number;
    gst: number;
    estimatedPrice: number;
    total: number;
}
export interface RawMaterialPoGivenModel {
    id?: string;
    type: "PoGiven",
    refId: string;
    gst: number;
    poNo: string;
    quantity: number;
    estimatedPrice: number;
    actualPrice: string;
    total: number;
}



