import type { TimestampModel } from "./Date";

export interface MaterialRow {
    id: string
    used: number;
    wastage: number; // "
    unit: string;
    notes: string;
};

export type MachineRow = {
    name: string;
    type: string;
    runningHours: number; // hours for the day
    downtime: number;     // hours for the day
    maintenanceType: "" | "routine" | "preventive" | "breakdown" | "repair";
    efficiency: number;   // 0-100
    operator: string;
    notes: string;
};


interface ProductionEntry {
    planned: number;
    actual: number;
    staff: number;
    machines: number;
    supervisor: string;
    remarks?: string;
}


export interface productionModel {
    cutting: ProductionEntry;
    sewing: ProductionEntry;
    quality: ProductionEntry;
    finishing: ProductionEntry;
    packaging: ProductionEntry;
    inspection: ProductionEntry;
}

export interface DailyProductionModel {
    id?: string;
    date: TimestampModel;
    production: productionModel | {};
    materials: MaterialRow[] | [];
    machines: MaterialRow[] | [];
    createdAt?: TimestampModel;
    updatedAt?: TimestampModel;
}

export interface ManufactureModel {
    id?: string;
    products: string[];
    poId: string;
    poNumber: string;
    remarks: string;
    startDate: TimestampModel | null;
    endDate: TimestampModel | null;
    planedUnits: number;
    createdAt?: TimestampModel;
    updatedAt?: TimestampModel;
}