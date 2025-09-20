import React, { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs,{ Dayjs } from "dayjs";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import type { PickerValue } from '@mui/x-date-pickers/internals'
import serverUrl from "../var/serverUrl";


const CreateHoliday : React.FC  =  () => {
        const [date,setDate] = useState<Dayjs|null|string>(dayjs(new Date()).format('YYYY-MM-DD'))
        const [reason,setReason] = useState<string|undefined>(undefined)
        const { csrfToken } = useAuth();

        const handleCreateHoliday = async () =>{
                try{
                        const formattedDate = dayjs(date).format('YYYY-MM-DD')
                const res = await fetch(`${serverUrl}api/holiday/`,{
                        method:'POST',
                        credentials: 'include',
                        headers:{
                                'Content-Type':'application/json',
                                'X-CSRFToken': csrfToken || '',
                        },
                        body:JSON.stringify({date:formattedDate,reason})
                })
                const data = await res.json();
                if(!data.status){
                        throw new Error(data.message)
                }
                toast.success(data.message)
                console.log(data)
                }catch(error: unknown) {
                        console.log((error as Error)?.message)
                        toast.error((error as Error)?.message)
                                console.error(error);
                        }
        }

        return <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-semibold mb-4 text-black">Create Holiday</h1>
            <div className="space-y-4">
                <div>
                    <label className="block text-lg font-medium text-black mb-1">Date</label>
                    <DatePicker value={date ? dayjs(date) : dayjs(new Date())} onChange={(value: PickerValue) => setDate(value ? String((value as Dayjs).format('YYYY-MM-DD')) : '' )} />
                </div>
                <div>
              <label htmlFor="holiday-reason" className="w-fit text-sm leading-6 font-medium text-black">
                Holiday Reason
              </label>
              <div className="mt-1 max-w-80">
                      <div className="flex items-center rounded-md bg-gray-200 pl-3 ring-1 ring-gray-600 ring-offset-0 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-0">
                  <input
                    id="reason"
                    name="reason"
                    type="text"
                    onChange={(e) => setReason(e.target.value)}
                    value={reason || ""}
                    placeholder="Holiday Reason"
                    className="block min-w-0 grow bg-inherit rounded-full py-1.5 pr-3 pl-1 text-base text-black placeholder:text-gray-700 focus:outline-none sm:text-sm sm:leading-6"
                  />            
                </div>
              </div>
            </div>
                <div className="flex justify-end">
                    <button onClick={handleCreateHoliday} className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                </div>
            </div>
        </div>
};

export default CreateHoliday; 