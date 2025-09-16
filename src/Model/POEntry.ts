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
    sizeQty: {
        size: string;
        quantity: number;
    }[];
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
    terms: string;
    preparedBy: string;
    verifiedBy: string;
    approvedBy: string;
    acceptedBy: string;
    bank: BankModel;
    currency: {
        code: string;
        name: string;
        symbol: string;
    };
    fileUrl: any;
    destination: string;
    paymentTerms: string;
    poType: string;
    dispatchTrough: "Air" | "Water" | "Road" | "Track";
    billFrom: {
        id: string;
        name: string;
        phone?: string; 0
        email?: string;
        website?: string;
        panNumber?: string;
        companyLogo?: string;
        gst?: string;
        nature?: string;
        address?: string;
        city?: string;
        state?: string;
        stateCode?: string;
        pinCode?: string;
    };

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
    terms: string;
    destination: string;
    paymentTerms: string;
    poType: string;
    dispatchTrough: "Air" | "Water" | "Road" | "Track";
    currency: {
        code: string;
        name: string;
        symbol: string;
    };
    preparedBy: string;
    verifiedBy: string;
    approvedBy: string;
    acceptedBy: string;
    bank: BankModel;
    billFrom: {
        id: string;
        name: string;
        phone?: string; 0
        email?: string;
        website?: string;
        panNumber?: string;
        companyLogo?: string;
        gst?: string;
        nature?: string;
        address?: string;
        city?: string;
        state?: string;
        stateCode?: string;
        pinCode?: string;
    };
}


interface BankModel {
    beneficiaryName: string;
    bank: string;
    bankAddress: string;
    bankAccount: string;
    swiftCode: string;
    ifscCode: string;
}