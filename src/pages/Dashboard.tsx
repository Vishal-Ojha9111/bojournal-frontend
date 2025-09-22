import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import serverUrl from '../var/serverUrl';

const Dashboard : React.FC = () => {

    type TxItem = { id: string | number; amount: number; description?: string };

    const [balance,setBalance] = useState<{
        closing_balance: number;
        credits: Record<string, TxItem[]>;
        date: string;
        debits: Record<string, TxItem[]>;
        net_balance: number;
        opening_balance: number;
        total_credit: number;
        total_debit: number;
    } | null>(null);

    const [noJournal,setNoJournal] = useState<boolean>(false)

    const navigate = useNavigate();

    const fetchBalances = async () => {
        try {
            const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-'); // Get current date in YYYY-MM-DD format
            const res = await fetch(`${serverUrl}/api/journal?date=${date}`,{
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!res.ok) {
                const errorData = await res.json();
                if (res.status === 400) {
                    setNoJournal(true);
                    throw new Error("Journal not found for this user.");
                }
                throw new Error(errorData.message || "Failed to fetch journal data.");
            }
            const data = await res.json();
            toast.success(data.message)
            setBalance(data.journal[0]);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
        }
    }
    useEffect(() => {
    fetchBalances();
    }, []);

    const checkBalances = (balances: Record<string, unknown> | undefined | null) => {
        if (!balances) return false
        const entries = Object.values(balances)
        let count = 0
        entries.forEach((value) => {
            // value might be an array or unknown; guard accordingly
            if (Array.isArray(value) && value.length === 0) {
                count++
            }
        })
        return count !== entries.length
    }

    
    if (!balance && noJournal === false) {
        return <div className="flex items-center justify-center h-64">Loading...</div>;
    }
    else if (noJournal) {
        return <div className="flex flex-col gap-3 items-center justify-center h-64 text-center px-4">
            <p className="text-black">Journal not found for this user. Please set first opening balance from user settings.</p>
            <button onClick={() => navigate('/changefirstopeningbalance')} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Set Opening Balance</button>
        </div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white shadow sm:rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Journal Summary</h2>
                    <div className="text-sm text-gray-500">Date: {balance?.date}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded">
                        <div className="text-sm text-gray-500">Opening Balance</div>
                        <div className="text-2xl font-bold">₹{balance?.opening_balance}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded">
                        <div className="text-sm text-gray-500">Net Balance</div>
                        <div className="text-2xl font-bold">₹{balance?.net_balance}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded">
                        <div className="text-sm text-gray-500">Closing Balance</div>
                        <div className="text-2xl font-bold">₹{balance?.closing_balance}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white shadow sm:rounded-lg p-6">
                    <h3 className="font-semibold mb-3 md:text-lg">Credits</h3>
                    {balance && checkBalances(balance.credits) ? <div>
                    {Object.entries(balance!.credits).map(([key, value], index) => (
                         value.length === 0 ? <></>:
                         <div key={index} className="mb-2">
                             <div className="text-sm font-medium text-gray-600">{key}</div>
                             <ul className="list-disc ml-5 mt-1 text-gray-700">
                                {Array.isArray(value) ? value.map((val) => (
                                    <li key={val.id}>₹{val.amount}{val.description?` :(${val.description})`:""}</li>
                                )) : null}
                             </ul>
                         </div>
                     ))}
                     <div className="mt-4 text-sm text-gray-600">Total Credit: <span className="font-semibold">₹{balance?.total_credit}</span></div></div>
                    : <div className="md:text-xl text-md text-gray-600">No transactions</div>}
                 </div>

                 <div className="bg-white shadow sm:rounded-lg p-6">
                     <h3 className="font-semibold mb-3 md:text-lg">Debits</h3>
                     {balance && checkBalances(balance.debits) ? <div>
                     {Object.entries(balance!.debits).map(([key, value], index) => (
                        Array.isArray(value) && value.length === 0 ? <></>:
                         <div key={index} className="mb-2">
                             <div className="text-sm font-medium text-gray-600">{key}</div>
                             <ul className="list-disc ml-5 mt-1 text-gray-700">
                                {Array.isArray(value) ? value.map((val) => (
                                    <li key={val.id}>₹{val.amount}{val.description?` :(${val.description})`:""}</li>
                                )) : null}
                             </ul>
                         </div>
                     ))}
                     <div className="mt-4 text-sm text-gray-600">Total Debit: <span className="font-semibold">₹{balance?.total_debit}</span></div></div>
                     : <div className='md:text-xl text-md text-gray-600'>No transactions</div>}
                 </div>
             </div>
         </div>
     )
 }
 
 export default Dashboard;