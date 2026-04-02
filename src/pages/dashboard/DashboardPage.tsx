// FILE: src/pages/dashboard/DashboardPage.tsx
// PURPOSE: Main dashboard with today's journal, recent transactions, and holidays
// API: GET /api/v2/journal?date=today, GET /api/v2/transactions?limit=10, GET /api/v2/holiday

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Skeleton } from '../../components/ui';
import { useTodayJournal } from '../../features/journal/hooks';
import { useTransactions } from '../../features/transactions/hooks';
import { useHolidays } from '../../features/holidays/hooks';
import type { Transaction } from '../../features/transactions/schemas';
import { formatCurrency } from '../../lib/currency';

/**
 * PageStructure:
 * Grid Layout (responsive):
 * - lg: 3 columns (1fr 2fr 1fr) -> Journal | Transactions | Holidays
 * - md: 2 columns -> Journal stacked with Transactions | Holidays
 * - Mobile: single column -> Journal, Transactions, Holidays
 * 
 * Column 1: Today's Journal Card
 * - Date header
 * - opening_balance, closing_balance, total_debit, total_credit
 * 
 * Column 2: Recent Transactions (Last 10 for today)
 * - Show last 10 transactions for today
 * - Create Transaction button at bottom (if transactions exist)
 * - Show only create button if no transactions
 * 
 * Column 3: Holidays
 * - Show 5 holidays: upcoming first, then past to fill
 * 
 * APIs: 
 * - GET /api/v2/journal?date=today
 * - GET /api/v2/transactions?limit=10&date=today
 * - GET /api/v2/holiday
 */

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Fetch today's journal entry
  const { data: todayJournalResponse, isLoading: isLoadingJournal } = useTodayJournal();
  // Support both response-wrapped shape ({ data: ... }) and direct object
  // Allow flexible response shape: either { data: JournalEntry } or JournalEntry directly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const todayJournal = (todayJournalResponse as any)?.data ?? (todayJournalResponse as any);
  
  // Get today's date for transactions filter
  const today = new Date().toISOString().split('T')[0];
  
  // Fetch today's transactions (page_size 10)
  const { data: transactionsResponse, isLoading: isLoadingTransactions } = useTransactions({ 
    date: today,
    page_size: 10 
  });
  
  // Fetch holidays
  const { data: holidaysResponse, isLoading: isLoadingHolidays } = useHolidays();
  
  // Extract transactions from the response
  const todayTransactions = transactionsResponse?.data || [];
  
  // Process holidays: sort by date, prioritize upcoming, then past to fill 5 total
  const processedHolidays = React.useMemo(() => {
    if (!holidaysResponse?.data) return [];
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const upcoming = holidaysResponse.data
      .filter(h => new Date(h.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const past = holidaysResponse.data
      .filter(h => new Date(h.date) < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return [...upcoming, ...past].slice(0, 5);
  }, [holidaysResponse]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text)]">Dashboard</h1>
          <p className="text-[var(--muted)] mt-1">
            Welcome back! Here's your overview.
          </p>
        </div>
      </div>

      {/* Date Header */}
      {todayJournal && (
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[var(--text)]">
            {formatDate(todayJournal.date)}
          </h2>
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Column 1: Today's Journal */}
        <div className="md:col-span-2 lg:col-span-6 lg:order-1">
          <Card variant="elevated">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--text)]">
                Today's Journal
              </h2>
            </div>

            {isLoadingJournal ? (
              <div className="space-y-3">
                <Skeleton variant="rectangular" height={24} />
                <Skeleton variant="rectangular" height={24} />
                <Skeleton variant="rectangular" height={24} />
              </div>
            ) : todayJournal ? (
              <div className="space-y-4">
                {/* Display today's journal data */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-[var(--muted)] mb-1">Opening Balance</p>
                    <p className="text-lg font-semibold text-[var(--text)]">
                      {formatCurrency(todayJournal.opening_balance)}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-xs text-[var(--muted)] mb-1">Closing Balance</p>
                    <p className="text-lg font-semibold text-[var(--text)]">
                      {formatCurrency(todayJournal.closing_balance)}
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <p className="text-xs text-[var(--muted)] mb-1">Total Debit</p>
                    <p className="text-lg font-semibold text-[var(--error)]">
                      {formatCurrency(todayJournal.total_debit)}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <p className="text-xs text-[var(--muted)] mb-1">Total Credit</p>
                    <p className="text-lg font-semibold text-[var(--success)]">
                      {formatCurrency(todayJournal.total_credit)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[var(--muted)] mb-4">No journal entry for today</p>
              </div>
            )}
          </Card>
        </div>

        {/* Column 2: Recent Transactions (Today) */}
        <div className="md:col-span-2 lg:col-span-6 lg:order-2">
          <Card variant="elevated">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--text)]">
                Today's Transactions
              </h2>
              <Link to="/app/transactions">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {isLoadingTransactions ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rectangular" height={80} />
                ))}
              </div>
            ) : todayTransactions.length > 0 ? (
              <div className="space-y-3">
                {todayTransactions.map((transaction: Transaction) => (
                  <div
                    key={transaction.id}
                    className="p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--background-elevated)] transition-colors cursor-pointer"
                    onClick={() => navigate(`/app/transactions/${transaction.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--text)]">
                          {transaction.register}
                        </p>
                        {transaction.description && (
                          <p className="text-sm text-[var(--muted)] truncate mt-0.5">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 text-right">
                        <p className={`font-semibold ${
                          transaction.transaction_type === 'credit' 
                            ? 'text-[var(--success)]' 
                            : 'text-[var(--error)]'
                        }`}>
                          {transaction.transaction_type === 'credit' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-[var(--muted)] capitalize">
                          {transaction.transaction_type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Create Transaction Button */}
                <div className="pt-4">
                  <Link to="/app/transactions/create">
                    <Button variant="primary" size="sm" fullWidth>
                      Create Transaction for Today
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-[var(--muted)] mb-4">
                  No transactions for today
                </p>
                <Link to="/app/transactions/create">
                  <Button variant="primary">Create Transaction for Today</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Column 3: Holidays */}
        <div className="md:col-span-2 lg:col-span-6 lg:order-3">
          <Card variant="elevated">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text)]">Holidays</h2>
              <Link to="/app/holidays">
                <Button variant="ghost" size="sm">+ Add</Button>
              </Link>
            </div>

            {isLoadingHolidays ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rectangular" height={60} />
                ))}
              </div>
            ) : processedHolidays.length > 0 ? (
              <div className="space-y-2">
                {processedHolidays.map((holiday, index) => {
                  const holidayDate = new Date(holiday.date);
                  const now = new Date();
                  now.setHours(0, 0, 0, 0);
                  const isUpcoming = holidayDate >= now;
                  
                  return (
                    <div 
                      key={`${holiday.date}-${index}`}
                      className={`p-3 rounded-lg border transition-colors ${
                        isUpcoming 
                          ? 'border-[var(--brand-500)] bg-[var(--brand-50)]' 
                          : 'border-[var(--border)] bg-[var(--background-elevated)]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[var(--text)] text-sm">
                            {holiday.holiday_reason}
                          </p>
                          <p className="text-xs text-[var(--muted)] mt-1">
                            {new Date(holiday.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        {isUpcoming && (
                          <span className="ml-2 px-2 py-1 text-xs font-medium bg-[var(--brand-500)] text-white rounded">
                            Upcoming
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {holidaysResponse && holidaysResponse.data.length > 5 && (
                  <Link to="/app/holidays">
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      View all {holidaysResponse.data.length} holidays
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-[var(--muted)] mb-3">
                  Mark days when business is closed
                </p>
                <Link to="/app/holidays">
                  <Button variant="primary" size="sm">Mark Holiday</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
