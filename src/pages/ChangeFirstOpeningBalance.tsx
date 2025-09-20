import React from 'react'
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import type { PickerValue } from '@mui/x-date-pickers/internals';

import serverUrl from '../var/serverUrl';

const ChangeFirstOpeningBalance: React.FC = () => {
  const { user, setUser, csrfToken } = useAuth();
  const [newOpeningBalance, setNewOpeningBalance] = React.useState<number>(user?.first_opening_balance || 0);
  const [date, setDate] = React.useState<Dayjs|null|string>(user?.first_opening_balance_date||dayjs(new Date()).format('YYYY-MM-DD'));

  const handleSave = async () => {
    if (newOpeningBalance == null ) {
      toast.error("Please enter a valid opening balance.");
      return;
    }
    try {
      const response = await fetch(`${serverUrl}/api/journal/`, {
        method: user?.first_opening_balance ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify({ opening_balance: newOpeningBalance, date: user?.first_opening_balance_date? user?.first_opening_balance_date : date }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Network response was not ok");
      }

      const data = await response.json();

      if (data.status) {
        // Update user object by reading current user and replacing fields
        if (user) {
          setUser({
            ...user,
            first_opening_balance: newOpeningBalance,
            first_opening_balance_date: date || '',
          });
        } else {
          setUser(user);
        }
        const bojUser = localStorage.getItem('boj-user');
        if (bojUser) {
          const parsedUser = JSON.parse(bojUser);
          localStorage.setItem('boj-user', JSON.stringify({
            ...parsedUser,
            first_opening_balance: newOpeningBalance,
          }));
        }
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to update opening balance.");
      }
    } catch (error) {
      console.log(error);
      toast.error(error instanceof Error ? error.message : "An error occurred while updating opening balance.");
    }
  }
  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">{(user?.first_opening_balance) ? "Change" : "Set"} First Opening Balance</h1>
      <div className="space-y-4">
        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-1">Date</label>
                            <DatePicker disabled={Boolean(user?.first_opening_balance_date)} value={user?.first_opening_balance_date ? dayjs(user.first_opening_balance_date) : dayjs(new Date())} onChange={(value: PickerValue) => setDate(value ? String((value as Dayjs).format('YYYY-MM-DD')) : '' )} />
                        </div>
        <div>
              <label htmlFor="amount" className="w-fit text-sm/6 font-medium text-black">
                Amount
              </label>
              <div className="mt-1 max-w-80">
                      <div className="flex items-center rounded-md bg-gray-200 pl-3 outline-1 -outline-offset-1 outline-gray-600 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-0">
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="Amount"
                    value={newOpeningBalance}
                    onChange={(e) => setNewOpeningBalance(Number(e.target.value))}
                    className="block min-w-0 grow bg-inherit rounded-full py-1.5 pr-3 pl-1 text-base text-black placeholder:text-gray-700 focus:outline-none sm:text-sm/6"
                  />            
                </div>
              </div>
            </div>
        <div className="flex justify-end">
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  )
}

export default ChangeFirstOpeningBalance