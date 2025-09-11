// utils/numberUtils.ts
export function sanitizeNumberInput(value: string): string {
    let val = value.replace(/[^0-9.]/g, "");
    val = val.replace(/(\..*?)\./g, "$1");
    return val;
}
