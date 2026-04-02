import React, { useState, useEffect, Fragment, useRef } from "react";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useAuth } from "../context/AuthContext";
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'
import Transaction from "../components/Transaction";
import toast from "react-hot-toast";
import { CheckIcon, ChevronDoubleUpIcon, ChevronUpDownIcon } from "@heroicons/react/16/solid";
import type { PickerValue } from "@mui/x-date-pickers/internals";
import type { Register_type } from "../types/client/User";
import serverUrl from "../var/serverUrl";



interface TransactionType {
    id: number;
    amount: number;
    transaction_type: string;
    date: string;
    register: string;
    description?: string;
    image_urls?: string[];
}

interface PaginatedResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: TransactionType[];
}

const Transactions: React.FC = () => {
    const { user, csrfToken } = useAuth();
    const [filtersOpen, setFiltersOpen] = useState<boolean>(true);
    const [transactions, setTransactions] = useState<TransactionType[]>([]);
    const [fromDate, setFromDate] = useState<Dayjs | null | string>(null);
    const [toDate, setToDate] = useState<Dayjs | null | string>(null);
    const [transactionType, setTransactionType] = useState<string>("");
    const [registers, setRegisters] = useState<Register_type[] | undefined>(undefined);
    const [selectedRegister, setSelectedRegister] = useState<string>("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<TransactionType | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalCount, setTotalCount] = useState<number>(0);
    const PAGE_SIZE = 10;
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [rotate, setRotate] = useState<number>(0);
    const [fetched, setFetched] = useState<boolean>(false)

    // close filters when clicking/touching outside the container
    useEffect(() => {
        const handleOutside = (event: MouseEvent | TouchEvent) => {
  if (!filtersOpen) return;
  const target = event.target as Node | null;

  // get composedPath for Shadow DOM support; fallback to (event as any).path
  // const path: EventTarget[] = (event as any).composedPath
  //   ? (event as any).composedPath()
  //   : (event as any).path || [];

  const path: EventTarget[] = 'composedPath' in event && typeof (event as Event & { composedPath?: () => EventTarget[] }).composedPath === 'function'
  ? (event as Event & { composedPath: () => EventTarget[] }).composedPath()
  : ((event as Event & { path?: EventTarget[] }).path ?? []);

  // helper to test whether node is part of the picker popper/dialog
  const pathContainsPicker = path.some((node) => {
    if (!(node instanceof HTMLElement)) return false;
    // match common MUI picker classes/roles - covers most versions
    return (
      containerRef.current?.contains(node) ||
      node.closest('.MuiPickersPopper-root, .MuiCalendarPicker-root, .MuiDatePicker, .MuiPickersDay-root, [role="dialog"], .MuiCalendarOrClockPicker-root')
    );
  });

  if (!path.length) {
    // fallback: original containment check
    if (containerRef.current && target && !containerRef.current.contains(target) && fetched) {
      setFiltersOpen(false);
    }
    return;
  }

  if (!pathContainsPicker && fetched) {
    setFiltersOpen(false);
  }
};

        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('touchstart', handleOutside);

        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('touchstart', handleOutside);
        };
    }, [filtersOpen]);

    const handleGetTransactions = async (e?: React.FormEvent, page: number = currentPage) => {
        e?.preventDefault();
        const queryParams = new URLSearchParams();
        if (fromDate) queryParams.append('date_gte', fromDate as string);
        if (toDate) queryParams.append('date_lte', toDate as string);
        if (transactionType) queryParams.append('transaction_type', transactionType);
        if (selectedRegister) queryParams.append('register', selectedRegister);
        queryParams.append('page', page.toString());

        try {
            const response = await fetch(`${serverUrl}/api/transactions/?${queryParams}`, { method: 'GET', credentials: 'include' });
            const data: PaginatedResponse = await response.json();
            
            if (!response.ok) {
                // response may not include structured message; use statusText or generic
                const maybeMsg = (data as unknown as { message?: string })?.message;
                throw new Error(maybeMsg || response.statusText || 'Failed to fetch transactions');
            }
            
            setTransactions(data.results);
            setTotalCount(data.count);
            setTotalPages(Math.ceil(data.count / PAGE_SIZE));
            setCurrentPage(page);
            setFiltersOpen(false)
            setFetched(true)
            if(data.count === 0){
              toast.error('No transaction found.')
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to fetch transactions.');
        }
    };

    const handleEdit = (transaction: TransactionType) => {
        setEditingId(transaction.id);
        setEditData(transaction);
    };

    const handleUpdate = async (id: number) => {
        if (!editData) return;

        try {
            const response = await fetch(`${serverUrl}/api/transactions/${id}/`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'x-CSRFToken': csrfToken || '' },
                body: JSON.stringify(editData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setTransactions(prev => prev.map(t => t.id === id ? data : t));
            setEditingId(null);
            setEditData(null);
            toast.success('Transaction updated successfully');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update transaction');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) return;

        try {
            const response = await fetch(`${serverUrl}/api/transactions/${id}/`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'x-CSRFToken': csrfToken || '' }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message);
            }

            setTransactions(prev => prev.filter(t => t.id !== id));
            toast.success('Transaction deleted successfully');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete transaction');
        }
    };

    const handlePageChange = (newPage: number) => {
        handleGetTransactions(undefined, newPage);
    };
    useEffect(() => {
        setRotate(rotate + 180);
    }, [filtersOpen]);

    useEffect(() => {
      setRegisters(user?.register_types.filter((reg: Register_type) => transactionType == 'credit' ? reg.credit : transactionType == 'debit' ? reg.debit : false))
    },[transactionType]);

    return (
        <div className="space-y-6">
            <div ref={containerRef} className="h-11 bg-gray-300 rounded-sm flex flex-col rounded-t-lg">
            <button type="button" onClick={() => fetched? setFiltersOpen(f => !f):''} className={`text-black self-end h-7 w-10 mt-2 rounded bg-red-400 transform transition-transform rotate-[${rotate}] duration-100}`}><ChevronDoubleUpIcon className="h-7 w-10"/></button>
            <Transition
                  as={Fragment}
                  show={filtersOpen}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 -translate-y-2"
                  enterTo="transform opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="transform opacity-100 translate-y-0"
                  leaveTo="transform opacity-0 -translate-y-2"
                >
            <div className="bg-gray-300 z-10 rounded-b-lg p-6">
                <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold mb-4">Filter Transactions</h2>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => { setFromDate(null); setToDate(null); setTransactionType(''); setSelectedRegister(''); }} className="px-2 py-1 bg-red-500 text-white font-bold border rounded">Reset</button>
                </div>
                </div>
                
                <form onSubmit={(e) => handleGetTransactions(e, 1)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                              <label className="block text-sm font-medium text-gray-700">From date</label>
                              <DatePicker format="DD-MM-YYYY" value={fromDate ? dayjs(fromDate) : null} onChange={(value: PickerValue) => setFromDate(value ? String((value as Dayjs).format('YYYY-MM-DD')) : '' )} />
                            </div>
                    <div>
                              <label className="block text-sm font-medium text-gray-700">Till date</label>
                              <DatePicker format="DD-MM-YYYY" value={toDate ? dayjs(toDate) : null} onChange={(value: PickerValue) => setToDate(value ? String((value as Dayjs).format('YYYY-MM-DD')) : '' )} />
                            </div>
                    <div className="grid grid-rows-2 gap-0">
                              <Listbox value={transactionType} onChange={(e) => setTransactionType(e)}>
                                    <Label className="text-sm w-fit font-medium text-black">Transaction Type</Label>
                                    <div className="relative -mt-1 max-w-80">
                                      <ListboxButton type='button' className="grid w-full cursor-default grid-cols-1 rounded-md bg-gray-200 py-1.5 pr-2 pl-3 text-left text-black ring-1 ring-white/10 ring-offset-0 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-0 sm:text-sm sm:leading-6">
                                        <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                                          <span className="block truncate">{transactionType?transactionType.charAt(0).toUpperCase() + transactionType.slice(1):'Select transaction type'}</span>
                                        </span>
                                        <ChevronUpDownIcon aria-hidden="true" className="col-start-1 row-start-1 h-5 w-5 self-center justify-self-end text-gray-400 sm:h-4 sm:w-4" />
                                      </ListboxButton>
                              
                                      <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-150"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-100"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                      >
                                      <ListboxOptions className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base ring-1 ring-white/10 ring-offset-0 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm">
                                          <ListboxOption
                                            value="debit"
                                            className="group relative cursor-default py-2 pr-9 pl-3 text-white select-none data-focus:bg-indigo-500 data-focus:outline-hidden"
                                          >
                                            <div className="flex items-center">
                                              <span className="ml-3 block truncate font-normal group-data-selected:font-semibold">Debit</span>
                                            </div>
                                            {transactionType === 'debit' &&
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-400 group-not-data-selected:hidden group-data-focus:text-white">
                                              <CheckIcon aria-hidden="true" className="h-5 w-5" />
                                            </span>
                                            }
                                          </ListboxOption>
                                          <ListboxOption
                                            value="credit"
                                            className="group relative cursor-default py-2 pr-9 pl-3 text-white select-none data-focus:bg-indigo-500 data-focus:outline-hidden"
                                          >
                                            <div className="flex items-center">
                                              <span className="ml-3 block truncate font-normal group-data-selected:font-semibold">Credit</span>
                                            </div>
                                            {transactionType === 'credit' &&
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-400 group-not-data-selected:hidden group-data-focus:text-white">
                                              <CheckIcon aria-hidden="true" className="h-5 w-5" />
                                            </span>
                                            }
                                </ListboxOption>
                              </ListboxOptions>
                              </Transition>
                                    </div>
                                  </Listbox>
                                  </div>
                    <div className="grid grid-rows-2 gap-0">
          <Listbox value={selectedRegister} onChange={(e) => setSelectedRegister( e )}>
            <Label className="block text-sm/6 font-medium w-fit text-black">Register</Label>
            <div className="relative -mt-1 max-w-80">
              <ListboxButton type='button' className="grid w-full cursor-default grid-cols-1 rounded-md bg-gray-200 py-1.5 pr-2 pl-3 text-left text-black ring-1 ring-white/10 ring-offset-0 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-0 sm:text-sm sm:leading-6">
                <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                  <span className="block truncate text-black">{selectedRegister?selectedRegister:'Select register'}</span>
                </span>
                <ChevronUpDownIcon aria-hidden="true" className="col-start-1 row-start-1 h-5 w-5 self-center justify-self-end text-gray-400 sm:h-4 sm:w-4" />
              </ListboxButton>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-100"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
              <ListboxOptions className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base ring-1 ring-white/10 ring-offset-0 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm">
               
                <ListboxOption
                    key={"All Register"}
                    value={"All Register"}
                    className="group relative cursor-default py-2 pr-9 pl-3 text-white select-none data-focus:bg-indigo-500 data-focus:outline-hidden"
                  >
                    <div className="flex items-center">
                      <span className="ml-3 block truncate font-normal group-data-selected:font-semibold">All Register</span>
                    </div>
                    {selectedRegister === "All Register" &&
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-400 group-not-data-selected:hidden group-data-focus:text-white">
                      <CheckIcon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    }
                  </ListboxOption>
                {registers?.map((reg) => (
                  <ListboxOption
                    key={reg.name}
                    value={reg.name}
                    className="group relative cursor-default py-2 pr-9 pl-3 text-white select-none data-focus:bg-indigo-500 data-focus:outline-hidden"
                  >
                    <div className="flex items-center">
                      <span className="ml-3 block truncate font-normal group-data-selected:font-semibold">{reg.name}</span>
                    </div>
                    {
                      reg.name === selectedRegister && 
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-400 group-not-data-selected:hidden group-data-focus:text-white">
                      <CheckIcon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    }
                  </ListboxOption>
                ))}
              </ListboxOptions>
              </Transition>
            </div>
          </Listbox>
        </div>

                    <div className="md:col-span-4 flex space-x-2">
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Apply Filters</button>
                        
                    </div>
                </form>
            </div>
                </Transition>
                </div>

            <div className="space-y-4">
              {
                transactions.length === 0 && 
                <div>No transactions found.</div>
              }
                {transactions.map(transaction => (
                    <div key={transaction.id}>
                        {editingId === transaction.id ? (
                            <div className="bg-white shadow p-4 rounded">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                    <input
                                        type="number"
                                        value={editData?.amount || 0}
                                        onChange={(e) => setEditData(prev => 
                                            prev ? {...prev, amount: Number(e.target.value)} : null
                                        )}
                                        className="border px-2 py-2 rounded"
                                    />
                                    <select
                                        value={editData?.transaction_type}
                                        onChange={(e) => setEditData(prev => 
                                            prev ? {...prev, transaction_type: e.target.value} : null
                                        )}
                                        className="border px-2 py-2 rounded"
                                    >
                                        <option value="credit">Credit</option>
                                        <option value="debit">Debit</option>
                                    </select>
                                    <DatePicker
                                        value={editData?.date ? dayjs(editData.date) : null}
                                        onChange={(newDate) => setEditData(prev => 
                                            prev ? {...prev, date: newDate ? newDate.format('YYYY-MM-DD') : ''} : null
                                        )}
                                    />
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleUpdate(transaction.id)} className="px-3 py-2 bg-green-500 text-white rounded">Save</button>
                                        <button onClick={() => { setEditingId(null); setEditData(null); }} className="px-3 py-2 border rounded">Cancel</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Transaction
                                {...transaction}
                                onEdit={() => handleEdit(transaction)}
                                onDelete={() => handleDelete(transaction.id)}
                            />
                        )}
                    </div>
                ))}
            </div>

            {totalCount > 0 && (
                <div className="bg-white shadow p-4 rounded flex items-center justify-between">
                    <p className="text-sm text-gray-600">Showing {transactions.length} of {totalCount} transactions</p>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => handlePageChange(index + 1)}
                                disabled={currentPage === index + 1}
                                className="px-3 py-1 border rounded disabled:opacity-50"
                            >
                                {index + 1}
                            </button>
                        ))}

                        <button 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;