// Company & related interfaces
export interface Company {
    id?: string;
    userName?: string;
    name: string;
    phone?: string;
    email?: string;
    website?: string;
    panNumber?: string;
    companyLogo?: string; // URL/base64
    gst?: string;
    nature?: string; // "Retail" | "Manufacturer" | ...
    address?: string;
    city?: string;
    state?: string;
    stateCode?: string; // e.g. "36"
    pinCode?: string;
    dateFormat?: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
    createdAt?: any;
    updatedAt?: any;
}

export interface CompanyAudit {
    ref: any;
    date: any;
    section: "settings" | string;
    action: "Create" | "Update" | "Delete" | string;
    description?: string;
}

export interface GSTFetchedPayload {
    name?: string;
    gst?: string;
    nature?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    stateCode?: string;
    pinCode?: string;
    status?: string;
    [k: string]: unknown;
}
