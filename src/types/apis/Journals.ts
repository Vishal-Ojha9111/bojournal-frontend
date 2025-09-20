

export interface Journal {
    date: string;
    opening_balance: number;
    credits: TransactionType;
    debits: TransactionType;
    net_balance: number;
    closing_balance: number;
    total_debits: number;
    total_credits: number;
}

export interface HolidayJournal {
    date: string;
    holiday_reason: string;
    is_holiday: boolean;
}

export interface TransactionType {
    [key: string]: Array<Transaction>;
}

export interface Transaction {
    amount: number;
    date: string;
    description: string|null;
    register: string;
    transaction_type: string;
    user: number;
    image_keys: Array<string>;
    image_urls: Array<string>;
    id: number;
    created_at: string;
}