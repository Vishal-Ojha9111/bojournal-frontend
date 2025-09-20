

export interface Transaction {
    amount:number|null;
    transaction_type:string;
    register:string|null;
    date:string|null;
    image_keys: string[];
    description:string;
}

export interface ImageFile {
    file: File|null;
    preview: string;
    key?: string;
    presignedUrl?: string;
}

export interface PresignedUrl {
    key: string;
    upload_url: string;
}