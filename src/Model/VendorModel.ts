import type { TimestampModel } from "./Date";
interface Address {
    address: string;
    pinCode: string;
    state: string;
    stateCode: string;
}
export interface PartnerModel {
    id?: string;
    type: "Vendor" | "Customer";
    name: string;
    email: string;
    phone: string;
    shippingAddress: Address;
    billingAddress: Address;
    panNo: string;
    cin: string;
    gstNumber: string;
    createdAt?: TimestampModel;
    updatedAt?: TimestampModel;
}
