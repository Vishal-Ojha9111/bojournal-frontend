import React from "react";
import dayjs from "dayjs";
import { TrashIcon, PencilSquareIcon } from "@heroicons/react/16/solid";

interface TransactionProps {
    id: number;
    amount: number;
    transaction_type: string;
    date: string;
    register: string;
    description?: string;
    image_urls?: string[];
    onDelete?: () => void;
    onEdit?: () => void;
}

const Transaction: React.FC<TransactionProps> = ({
    amount,
    transaction_type,
    date,
    register,
    description,
    image_urls,
    onDelete,
    onEdit
}) => {
    return (
        <div className="bg-white shadow rounded-lg p-4 flex flex-col">
            <div className="flex flex-row justify-between top-0 w-full">

                <div>
                    <div className="text-sm text-gray-500">{dayjs(date).format('DD-MM-YYYY')}</div>
                    <div className="text-lg font-semibold">₹{amount}</div>
                    <div className="text-sm text-gray-600">{transaction_type} • {register}</div>
                    {description && <div className="text-sm text-gray-700 mt-2">{description}</div>}
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                    {onEdit && <button onClick={onEdit} className=" h-8 p-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"><PencilSquareIcon className="h-5 w-5" /></button>}
                    {onDelete && <button onClick={onDelete} className="h-8 p-1  bg-red-500 text-white rounded hover:bg-red-600"><TrashIcon className="h-5 w-5" /></button>}
                </div>
            </div>
            {image_urls && image_urls.length > 0 && (
                <div className="flex gap-2 items-center w-full justify-left mt-4 overflow-x-auto">
                    {image_urls.map((url, idx) => (
                        <div className="relative border rounded-lg p-2 bg-gray-50" key={idx}>
                            <div className='h-52 w-32'>
                                <img src={url} alt={`doc-${idx}`} className="h-52 w-32 object-cover rounded cursor-pointer" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default Transaction;