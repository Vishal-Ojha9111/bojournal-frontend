import React, { useEffect, useState } from "react";
import {toast} from 'react-hot-toast'
import { TrashIcon } from "@heroicons/react/16/solid";
import { useAuth} from "../context/AuthContext";
import serverUrl from "../var/serverUrl";

const Holidays : React.FC  =  () => {

    type HolidayItem = { date: string; holiday_reason: string };
    const [holiday,setHoliday] = useState<HolidayItem[]>([])
    const {csrfToken} = useAuth();

    const fetchHolidays = async () =>{
        try {
            const res = await fetch(`${serverUrl}api/holiday/`,{
                method:'GET',
                credentials:'include',
                headers:{
                    "content-type":"application/json"
                },
            })
            const data = await res.json()
            if (!data.status) {
                throw new Error(data.message);
            }
            setHoliday(data.data)
            if(data.data.length===0){
              throw new Error(data.message)
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message)
            } else {
                toast.error('An unexpected error occurred')
            } 
        }
    }

    useEffect(()=>{
        fetchHolidays()
    },[])

    const deleteHoliday = async (date:string) =>{
        try {
            const res = await fetch(`${serverUrl}api/holiday/`,{
                method:"DELETE",
                credentials:'include',
                headers:{
                    "content-type":"application/json",
                    "X-CSRFToken": csrfToken || ''
                },
                body:JSON.stringify({date})
            })
            const data = await res.json()
            if(!data.status){
                throw new Error(data.message)
            }
            toast.success(data.message)
            setHoliday(previtems=>previtems.filter(item=>item.date!=date))
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message)
            } else {
                toast.error('An unexpected error occurred')
            }
            console.log(error)
        }
    }

    return (
      <div>
        <h1 className="text-2xl font-semibold mb-4 text-black">Holidays</h1>

        <div className="overflow-x-auto w-full bg-white rounded shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {holiday && holiday.length > 0 ? (
                holiday.map((h, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-700">{h.date}</td>
                    <td className="px-2 py-4 break-words text-sm text-gray-700 max-w-xl">{h.holiday_reason}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-right">
                      <button
                        type="button"
                        onClick={() => deleteHoliday(h.date)}
                        aria-label={`Delete holiday ${h.date}`}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-red-600 hover:bg-red-50 rounded"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-2 py-8 text-center text-sm text-gray-500">No holidays found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
};

export default Holidays;