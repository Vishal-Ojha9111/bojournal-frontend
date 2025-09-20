import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 p-8 bg-gradient-to-b from-blue-600 to-indigo-600 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Welcome to BO Journal</h1>
            <p className="text-sm md:text-base text-blue-100/90 mb-6">Keep track of your ledgers, journals and transactions with a clean, lightweight interface.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/journals')} className="px-4 py-2 bg-white text-blue-700 rounded-md font-semibold hover:bg-white/90">View Journals</button>
              <button onClick={() => navigate('/transactions')} className="px-4 py-2 bg-white/20 text-white rounded-md border border-white/20 hover:bg-white/10">View Transactions</button>
            </div>
          </div>

          <div className="md:w-1/2 p-8">
            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-5">
                <h2 className="text-lg font-semibold">Hello{user ? `, ${user.first_name}` : ''}!</h2>
                <p className="text-sm text-gray-600 mt-1">{user ? 'Manage your account and financial records from the dashboard.' : 'Sign up or login to start tracking your books.'}</p>
                <div className="mt-4 flex gap-3 items-center">
                  {user ? (
                    <button onClick={() => navigate('/dashboard')} className="px-3 py-2 bg-indigo-600 text-white rounded-md">Go to Dashboard</button>
                  ) : (
                    <>
                      <button onClick={() => navigate('/login')} className="px-3 py-2 bg-blue-500 text-white rounded-md">Login</button>
                      <button onClick={() => navigate('/signup')} className="px-3 py-2 border border-gray-200 rounded-md">Sign Up</button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border shadow-sm">
                  <h3 className="text-sm font-medium text-gray-700">Quick Add Transaction</h3>
                  <p className="text-xs text-gray-500 mt-1">Add credits or debits quickly from the Transactions page.</p>
                </div>
                <div className="p-4 bg-white rounded-lg border shadow-sm">
                  <h3 className="text-sm font-medium text-gray-700">Holidays & Reports</h3>
                  <p className="text-xs text-gray-500 mt-1">Create holidays and export reports as needed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home
