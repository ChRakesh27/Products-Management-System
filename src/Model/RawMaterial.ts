import type { TimestampModel } from "./Date";

export interface RawMaterialModel {
    id?: string;
    name: string;
    description: string;
    variants: RawMaterialVariantModel[];
    createdAt?: TimestampModel;
    updatedAt?: TimestampModel;
    poNumber?: string;
}
export interface RawMaterialVariantModel {
    id: string;
    materialId?: string;
    size: string;
    color: string;
    quantityOrdered: number;
    quantityUsed: number;  // default 0
    unitPrice: number;
    total: number;
}