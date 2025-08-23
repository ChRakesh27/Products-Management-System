import type { TimestampModel } from "./Date";


interface RawMaterialModel {
    id: string;
    variantId: string;
    size: string;
    color: string;
    quantityOrdered: number;
    quantityUsed: number;
    unitPrice: number;
    total: number;
}

export interface ProductModel {
    id?: string;
    name: string;
    description: string;
    rawMaterials: RawMaterialModel[]
    createdAt?: TimestampModel;
    updatedAt?: TimestampModel;
}