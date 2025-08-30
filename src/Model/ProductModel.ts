import type { TimestampModel } from "./Date";

export interface ProductRawMaterialModel {
    id: string;
    name: string;
    description: string;
    poNumber?: string;
    size: string;
    color: string;
    unitType: string;
    quantity: number; // default 0
    unitPrice: number;
    total: number;
}


export interface ProductModel {
    id?: string;
    name: string;
    description: string;
    poNumber?: string;
    size: string;
    color: string;
    unitType: string;
    quantityOrdered: number;
    productionQty: number;
    unitPrice: number;
    total: number;
    deliveryDate?: TimestampModel;
    totalRaw: number;
    rawMaterials: ProductRawMaterialModel[];
    createdAt?: TimestampModel;
    updatedAt?: TimestampModel;
}