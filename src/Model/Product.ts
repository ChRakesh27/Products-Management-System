import type { TimestampModel } from "./Date";

export interface productModel {
    id?: string;
    name: string;
    description: string;
    variants: VariantModel[];
    createdAt: TimestampModel;
    updatedAt: TimestampModel;
}
export interface VariantModel {
    size: string;
    color: string;
    quantityOrdered: number;
    unitPrice: number;
    total: number;

}