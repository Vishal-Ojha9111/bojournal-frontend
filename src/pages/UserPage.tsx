import React from "react";
import {useNavigate} from 'react-router-dom'
import { useAuth } from "../context/AuthContext";


const UserPage : React.FC  =  () => {
        const navigate = useNavigate()
        const {user} = useAuth()

        return <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-semibold mb-4">User Profile</h1>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-500">First Name</p>
                    <p className="font-medium">{user?.first_name}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Last Name</p>
                    <p className="font-medium">{user?.last_name}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">OTP Verified</p>
                    <input type="radio" checked={user?.otp_verification} readOnly />
                </div>
            </div>
            <div className="mt-4">
                <p className="text-sm text-gray-500">Registers</p>
                <div className="mt-2 space-y-2">
                    {user?.register_types.map((register:string,index)=>{
                        return <div key={index} className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">{index+1}.</span>
                            <p className="font-medium">{register}</p>
                        </div>
                    })}
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-500">First Opening Balance</p>
                    <p className="font-medium">{user?.first_opening_balance}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">First Opening Balance Date</p>
                    <p className="font-medium">{user?.first_opening_balance_date ? String(user.first_opening_balance_date) : ''}</p>
                </div>
            </div>
            <div className="mt-6 flex gap-3">
                <button onClick={()=>navigate('/changefirstopeningbalance')} className="px-3 py-2 bg-indigo-600 text-white rounded">{(user?.first_opening_balance) ? "Change" : "Set"} First Opening Balance</button>
                <button onClick={()=>navigate('/changepassword')} className="px-3 py-2 border rounded">Change Password</button>
            </div>
        </div>
};

export default UserPage; 