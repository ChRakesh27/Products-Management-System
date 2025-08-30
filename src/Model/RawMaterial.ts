
export interface RawMaterialModel {
    id?: string;
    name: string;
    description: string;
    poNumber?: string;
    size: string;
    color: string;
    unitType: string;
    quantityOrdered: number;
    quantityUsed: number;  // default 0
    unitPrice: number;
    total: number;
}
