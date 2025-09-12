export interface UserDoc {
    id?: string;
    uid?: string;
    displayName: string;
    email?: string;
    phone: string;            // 10-digit local number
    phone_number?: string;    // E.164 (+91...)
    photoURL?: string;
    createdAt?: any;
    updatedAt?: any;
    [key: string]: unknown;
}

export interface CompanyContext {
    companyId: string;
}

export interface RootState {
    users: {
        userId: string;
        phone: string;
        name: string;
        email?: string;
        asCompanies: { companyId: string }[];
        selectedCompanyIndex: number;
    };
}
