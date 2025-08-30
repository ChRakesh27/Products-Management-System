// utils/numberUtils.ts
export function sanitizeNumberInput(value: string): number {
    // Keep only digits
    const val = value.replace(/[^0-9]/g, "");
    return val === "" ? 0 : Number(val);
}
