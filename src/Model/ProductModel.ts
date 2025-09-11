import type { TimestampModel } from "./Date";

export interface ProductModel {
    id?: string;
    uid: string;
    name: string;
    description: string;
    size: string;
    color: string;
    unitType: string;
    totalRawAmount: number;
    gst: number;
    rawMaterials: ProductMaterialModel[];
    createdAt: TimestampModel;
    updatedAt: TimestampModel;
    status: string;
    margin: number;
    transport: number;
    wastage: number;
    miscellaneous: number;
}


export interface ProductMaterialModel {
    id: string;
    materialId: string;
    estimatedPrice: number;
    quantity: number;
    gst: number;
    totalAmount: number;
    name?: string;
    description?: string;
    size?: string;
    color?: string;
    unitType?: string;
}


export interface ProductPoReceivedModel {
    id?: string;
    type: "PoReceived",
    refId: string;
    poNo: string;
    quantity: number;
    gst: number;
    unitPrice: number;
    total: number;
}