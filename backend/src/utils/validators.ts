// src/utils/validators.ts

export class Validators {

    // Validate email format
    static isEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Validate password strength (min 8 chars, 1 uppercase, 1 number)
    static isStrongPassword(password: string): boolean {
        const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(password);
    }

    // Validate non-empty string
    static isNonEmptyString(value: any): boolean {
        return typeof value === "string" && value.trim().length > 0;
    }

    // Validate numeric range
    static isNumberInRange(value: number, min: number, max: number): boolean {
        return typeof value === "number" && value >= min && value <= max;
    }

    // Validate date
    static isValidDate(date: any): boolean {
        return !isNaN(Date.parse(date));
    }

    // Validate positive integer
    static isPositiveInt(value: number): boolean {
        return Number.isInteger(value) && value > 0;
    }
}
