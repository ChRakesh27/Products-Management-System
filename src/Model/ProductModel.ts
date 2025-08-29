import type { TimestampModel } from "./Date";
import type { RawMaterialVariantModel } from "./RawMaterial";

export interface variantModel {
    id: string;
    size: string;
    color: string;
    quantityOrdered: number;
    unitPrice: number;
    total: number;
    rawMaterials: RawMaterialVariantModel[]
}


export interface ProductModel {
    id?: string;
    name: string;
    description: string;
    variants: variantModel[]
    createdAt?: TimestampModel;
    updatedAt?: TimestampModel;
    poNumber?: string;
}