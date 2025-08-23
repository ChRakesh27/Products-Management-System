import type { TimestampModel } from "./Date";

export interface VendorModel {
    id?: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    pinCode: string;
    state: string;
    gstNumber: string;
    createdAt: TimestampModel;
}
