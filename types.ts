
export interface Income {
    id: string;
    date: string; // YYYY-MM-DD
    description: string;
    value: number;
}

export interface FixedCost {
    id: string;
    description: string;
    value: number;
    dueDate: number; // Day of the month
    paidMonths: { monthKey: string }[]; // YYYY-MM-01
}

export interface Installment {
    value: number;
    dueDate: string; // YYYY-MM-DD
    isPaid: boolean;
}

export interface Purchase {
    id: string;
    date: string; // YYYY-MM-DD
    description: string;
    value: number;
    installments: Installment[];
}

export interface CreditCard {
    id: string;
    name: string;
    dueDate: number; // Day of the month
    purchases: Purchase[];
}

export interface AppData {
    entradas: Income[];
    fixas: FixedCost[];
    cartoes: CreditCard[];
    lastProcessedMonth: string | null; // YYYY-MM-01
}
