import React, {useState} from "react";
import { toast } from "react-hot-toast";
import dayjs,{Dayjs} from "dayjs";
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

import type { HolidayJournal, Journal as JournalType, TransactionType } from "../types/apis/Journals"
import type { PickerValue } from "@mui/x-date-pickers/internals";
import serverUrl from "../var/serverUrl";



const Journal : React.FC  =  () => {
    const [journals,setJournals] = useState<JournalType[]|HolidayJournal[]>([])
    const [mode,setMode] = useState<string>()
    const [rangeMode,setRangeMode] = useState<boolean>(false)
    const [dateMode,setDateMode] = useState<boolean>(false)
    const [date,setDate] = useState<Dayjs|null|string>(dayjs(new Date()).format('YYYY-MM-DD'))
    const [fromDate,setFromDate] = useState<Dayjs|null|string>(dayjs(new Date()).format('YYYY-MM-DD'))
    const [tillDate,setTillDate] = useState<Dayjs|null|string>(dayjs(new Date()).format('YYYY-MM-DD'))
    const fetchJournals = async () =>{
        try{
        const res = await fetch(`${serverUrl}api/journal?${dateMode?`date=${dayjs(date).format('YYYY-MM-DD')}`:''}${rangeMode?(fromDate&&tillDate)?`start_date=${dayjs(fromDate).format('YYYY-MM-DD')}&end_date=${dayjs(tillDate).format('YYYY-MM-DD')}`:fromDate?`start_date=${dayjs(fromDate).format('YYYY-MM-DD')}`:tillDate?`end_date=${dayjs(tillDate).format('YYYY-MM-DD')}`:'':''}`,{
            method:'GET',
            credentials:'include',
            headers:{
                'Content-Type':'application/json'
            }
        })
        if(res.status>=500){
                throw new Error('Internal Server Error: Fetching Journal.')
            }
            if (!res.ok) { 
                const errorData = await res.json();
                throw new Error(errorData.message || 'Some error occurred while fetching journals.');
            }
        const data = await res.json();
        toast.success(data.message)
        setJournals(data.journal)
    }catch(error: unknown) {
            console.error('There was a problem with the fetch operation:', error);
            if (error instanceof Error){
                toast.error(error.message)
            }
        }
}
    const handleGetJournal=()=>{
        if(mode==='dateMode'){
            if(!date){
                toast.error('Please select a date')
                return
            }
            fetchJournals();
        }else if(mode==='rangeMode'){
          console.log(fromDate, tillDate)
            if(!fromDate&&!tillDate){
                toast.error('Please select a date range');
                return;
            }
            if(tillDate && fromDate){
                if(tillDate<fromDate){
                    toast.error('Invalid date range.')
                    return
                }
            }
            fetchJournals();
        }else{
            fetchJournals();
        }
    }

    const isHolidayJournal = (journal: JournalType | HolidayJournal): journal is HolidayJournal => {
    return 'is_holiday' in journal;
    };

    const getTableHeaders = (journals: JournalType[]|HolidayJournal[]): string[] => {
        if(journals.length===0) return [];
        const isAllHoliday = journals.every(journal=> isHolidayJournal(journal));
        if(isAllHoliday) return ['S.No.', 'Date', 'Holiday Reason'];
        const headers: string[] = ['S.No.', 'Date', 'Opening Balance'];
        const debitKeys = Object.keys(journals[0].debits);
        headers.push(...debitKeys);
        headers.push('Total Debits', 'Net Balance');
        const creditKeys = Object.keys(journals[0].credits);
        headers.push(...creditKeys);
        headers.push('Total Credits', 'Closing Balance');
        return headers;
    };

    const getTotals = (transactions: TransactionType) => {
        const totalAmount = Object.values(transactions).map(transactionsArray =>{
            return transactionsArray.reduce((total:number, transaction)=>total + Number(transaction.amount), 0)
        })
        return totalAmount
    }
    return (
      <div className="">
        <h1 className="text-2xl font-semibold mb-4">Journal</h1>

        <div className="bg-white p-4 rounded shadow mb-4 flex flex-col ">
              <button type="button" onClick={()=>{setDate(null); setFromDate(null); setTillDate(null); setJournals([]); setMode(''); setRangeMode(false); setDateMode(false )}} className="px-3 py-2 border self-end rounded bg-red-500">Clear Selection</button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4">
                <span>Get Journal by :</span>
              <div className="flex items-center gap-2">
                <input id="rangeMode" name="mode" type="radio" checked={rangeMode} onChange={()=>{setRangeMode(true);setDateMode(false);setJournals([]);setMode('rangeMode')}} className="h-4 w-4  text-blue-600" />
                <label htmlFor="rangeMode" className="text-sm">Range</label>
              </div>

              <div className="flex items-center gap-2">
                <input id="dateMode" name="mode" type="radio" checked={dateMode} onChange={()=>{setRangeMode(false);setDateMode(true);setJournals([]);setMode('dateMode')}} className="h-4 w-4 text-blue-600" />
                <label htmlFor="dateMode" className="text-sm">Date</label>
              </div>
            </div>
          </div>
          {!mode &&

            <span className="self-center">Or</span>
          }

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {dateMode && (
                <div>
                          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Select Date</label>
                          <DatePicker name='date' format='DD-MM-YYYY' value={date ? dayjs(date) : dayjs(new Date())} onChange={(value: PickerValue) => setDate(value ? String((value as Dayjs).format('YYYY-MM-DD')) : '')} />
                </div>
            )}

            {rangeMode && (
              <>
                <div>
                          <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700">From date</label>
                          <DatePicker name='fromDate' format='DD-MM-YYYY' value={fromDate ? dayjs(fromDate) : dayjs(new Date())} onChange={(value: PickerValue) => setFromDate(value ? String((value as Dayjs).format('YYYY-MM-DD')) : '')} />
                </div><div>
                          <label htmlFor="toDate" className="block text-sm font-medium text-gray-700">To date</label>
                          <DatePicker name='toDate' format='DD-MM-YYYY' value={tillDate ? dayjs(tillDate) : dayjs(new Date())} onChange={(value: PickerValue) => setTillDate(value ? String((value as Dayjs).format('YYYY-MM-DD')) : '')} />
                </div>
              </>
            )}
          </div>
              <button type="button" onClick={()=>handleGetJournal()} className="px-4 py-2 bg-blue-600 text-white self-center mt-2 rounded hover:bg-blue-700">Get{!dateMode && !rangeMode ? " Full" : ""} Journal</button>
        </div>

        {journals && journals.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {getTableHeaders(journals).map((header, index) => (
                    <th key={index} className="px-4 py-2 text-left text-sm font-medium text-gray-600">{header}</th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {journals.map((journal: JournalType|HolidayJournal, index: number) => {
                  return (
                    isHolidayJournal(journal) ? (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{index+1}</td>
                        <td className="px-4 py-3 text-sm">{journal.date}</td>
                        <td className="px-4 py-3 text-sm" colSpan={7}>{journal.holiday_reason}</td>
                      </tr>
                    ) : (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{index+1}</td>
                        <td className="px-4 py-3 text-sm">{journal.date}</td>
                        <td className="px-4 py-3 text-sm">{journal.opening_balance}</td>
                        {getTotals(journal.debits).map((totalAmount:number, idx:number) => (
                          <td key={`d-${idx}`} className="px-4 py-3 text-sm">{totalAmount}</td>
                        ))}
                        <td className="px-4 py-3 text-sm">{journal.total_debits}</td>
                        <td className="px-4 py-3 text-sm">{journal.net_balance}</td>
                        {getTotals(journal.credits).map((totalAmount:number, idx:number) => (
                          <td key={`c-${idx}`} className="px-4 py-3 text-sm">{totalAmount}</td>
                        ))}
                        <td className="px-4 py-3 text-sm">{journal.total_credits}</td>
                        <td className="px-4 py-3 text-sm">{journal.closing_balance}</td>
                      </tr>
                    )
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-6">No journals to display</div>
        )}
      </div>
    );
};

export default Journal;