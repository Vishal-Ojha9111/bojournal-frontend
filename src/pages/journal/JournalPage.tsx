// FILE: src/pages/journal/JournalPage.tsx
// PURPOSE: Main journal page displaying transaction summaries grouped by date with filters
// API: GET /journal/

import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useJournalEntries } from '../../features/journal/hooks';
import { useRegisters } from '../../features/registers/hooks';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import type { JournalFilters } from '../../features/journal/schemas';
import type { Register } from '../../features/registers/schemas';
import { formatCurrency } from '../../lib/currency';

interface JournalTransaction {
  id: number;
  user: number;
  amount: string;
  transaction_type: string;
  date: string;
  register: number;
  description: string | null;
  created_at: string;
  image_keys: string[];
  image_urls: string[];
}

interface JournalDayEntry {
  is_holiday?: boolean;
  holiday_reason?: string;
  date: string;
  opening_balance?: number;
  debits?: {
    td: JournalTransaction[];
    ippb: JournalTransaction[];
  };
  credits?: {
    td: JournalTransaction[];
    ippb: JournalTransaction[];
  };
  total_debit?: number;
  total_credit?: number;
  net_balance?: number;
  closing_balance?: number;
}

interface JournalAPIResponse {
  journal: JournalDayEntry[];
  status: boolean;
  message: string;
}

/**
 * JournalPage Component
 * 
 * Displays journal entries with filters and table view showing transactions grouped by register
 */
export const JournalPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(true);
  const [showResults, setShowResults] = useState(false); // Show results only after filter apply

  // Parse filters from URL
  const filters: JournalFilters = {
    start_date: searchParams.get('start_date') || undefined,
    end_date: searchParams.get('end_date') || undefined,
  };

  const sortBy = searchParams.get('sort_by') || 'date_desc';
  const groupBy = searchParams.get('group_by') || 'none';

  // Fetch journal entries
  const { data, isLoading, isError } = useJournalEntries(filters);

  // Fetch user's registers for dynamic column generation
  const { data: registersData } = useRegisters();

  // Separate registers by type
  const { creditRegisters, debitRegisters } = useMemo(() => {
    if (!registersData?.results) {
      return { creditRegisters: [], debitRegisters: [] };
    }

    const credits: Register[] = [];
    const debits: Register[] = [];

    registersData.results.forEach((register) => {
      if (register.credit) credits.push(register);
      if (register.debit) debits.push(register);
    });

    return { creditRegisters: credits, debitRegisters: debits };
  }, [registersData]);

  // Helper to aggregate transactions by register for a given day
  const getRegisterAmount = (entry: JournalDayEntry, registerId: number, type: 'credit' | 'debit'): number => {
    if (entry.is_holiday) return 0;

    // This assumes the API groups transactions by register name/key
    // Since current API uses hardcoded td/ippb, we need to match by register ID
    // For now, we'll work with the existing structure and map register names

    // Get all transactions of the given type
    const transactionsGroup = type === 'credit' ? entry.credits : entry.debits;
    if (!transactionsGroup) return 0;

    // Sum transactions for this specific register
    // Since API groups by register name (td, ippb), we need to map register ID to name
    // For a dynamic solution, we'd need the API to provide register IDs in the grouping
    let total = 0;

    // Check all register groups in the transactions
    Object.values(transactionsGroup).forEach((transactions: JournalTransaction[]) => {
      transactions.forEach((transaction) => {
        if (transaction.register === registerId) {
          total += parseFloat(transaction.amount);
        }
      });
    });

    return total;
  };

  // Form state for filters
  const [filterForm, setFilterForm] = useState<JournalFilters>(filters);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    if (filterForm.start_date) params.set('start_date', filterForm.start_date);
    if (filterForm.end_date) params.set('end_date', filterForm.end_date);
    if (sortBy) params.set('sort_by', sortBy);

    setSearchParams(params);
    setShowFilters(false);
    setShowResults(true); // Show results after applying filters
  };

  const handleFetchAll = () => {
    setFilterForm({});
    setSearchParams(sortBy ? { sort_by: sortBy } : {});
    setShowFilters(false);
    setShowResults(true); // Show results when fetching all
  };

  const hasActiveFilters = !!(filters.start_date || filters.end_date);

  // Sort the journal data
  const sortedJournal = useMemo(() => {
    // Handle both 'journal' and 'journals' response formats
    const journalData = (data as unknown as JournalAPIResponse)?.journal || data?.journals || [];
    if (!journalData.length) return [];

    const journalCopy = [...journalData];

    switch (sortBy) {
      case 'date_asc':
        return journalCopy.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'date_desc':
        return journalCopy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'balance_asc':
        return journalCopy.sort((a, b) => (a.closing_balance || 0) - (b.closing_balance || 0));
      case 'balance_desc':
        return journalCopy.sort((a, b) => (b.closing_balance || 0) - (a.closing_balance || 0));
      case 'debit_desc':
        return journalCopy.sort((a, b) => (b.total_debit || 0) - (a.total_debit || 0));
      case 'credit_desc':
        return journalCopy.sort((a, b) => (b.total_credit || 0) - (a.total_credit || 0));
      default:
        return journalCopy;
    }
  }, [data, sortBy]);

  // Group journal entries based on groupBy parameter
  const groupedJournal = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Entries': sortedJournal };
    }

    const groups: Record<string, JournalDayEntry[]> = {};

    sortedJournal.forEach((entry) => {
      let groupKey = '';

      switch (groupBy) {
        case 'week': {
          const date = new Date(entry.date);
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          groupKey = `Week of ${startOfWeek.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`;
          break;
        }
        case 'month': {
          const monthDate = new Date(entry.date);
          groupKey = monthDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
          break;
        }
        default:
          groupKey = 'All Entries';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(entry);
    });

    return groups;
  }, [sortedJournal, groupBy]);

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort_by', newSort);
    setSearchParams(params);
  };

  const handleGroupByChange = (newGroupBy: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('group_by', newGroupBy);
    setSearchParams(params);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-inherit py-6 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text)]">Journal</h1>
            <p className="text-[var(--muted)] mt-1">View your daily financial summaries</p>
          </div>
        </div>

        {/* Filter Section */}
        <Card className="mb-6">
          <div className="p-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-between w-full text-left"
              >
              <h2 className="text-lg font-semibold text-[var(--text)]">Filters</h2>
              <svg
                className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showFilters && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Start Date</label>
                    <Input
                      type="date"
                      value={filterForm.start_date || ''}
                      onChange={(e) =>
                        setFilterForm({ ...filterForm, start_date: e.target.value || undefined })
                      }
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">End Date</label>
                    <Input
                      type="date"
                      value={filterForm.end_date || ''}
                      min={filterForm.start_date || ''}
                      
                      onChange={(e) =>
                        setFilterForm({ ...filterForm, end_date: e.target.value || undefined })
                      }
                    />
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={handleApplyFilters} className="flex-1 sm:flex-none">
                    Filter Results
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleFetchAll}
                    className="flex-1 sm:flex-none"
                  >
                    Fetch All Journal
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Show results only after user clicks Filter Results or Fetch All */}
        {showResults && (
          <>
            {/* Active Filter Tags & Sorting */}
            {!isLoading && !isError && data && sortedJournal.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {hasActiveFilters && (
                    <>
                      {filters.start_date && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          From: {filters.start_date}
                        </span>
                      )}
                      {filters.end_date && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          To: {filters.end_date}
                        </span>
                      )}
                      <button
                        onClick={handleFetchAll}
                        className="text-sm text-gray-600 hover:text-gray-900 underline"
                      >
                        Clear filters
                      </button>
                    </>
                  )}
                </div>

                {/* Group By and Sorting Dropdowns */}
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Group By Dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Group by:</label>
                    <Select
                      value={groupBy}
                      onChange={(e) => handleGroupByChange(e.target.value)}
                      options={[
                        { value: 'none', label: 'None' },
                        { value: 'week', label: 'Week' },
                        { value: 'month', label: 'Month' },
                      ]}
                      className="min-w-[150px]"
                    />
                  </div>

                  {/* Sorting Dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Sort by:</label>
                    <Select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      options={[
                        { value: 'date_desc', label: 'Date (Newest First)' },
                        { value: 'date_asc', label: 'Date (Oldest First)' },
                        { value: 'balance_desc', label: 'Balance (High to Low)' },
                        { value: 'balance_asc', label: 'Balance (Low to High)' },
                        { value: 'debit_desc', label: 'Highest Debits' },
                        { value: 'credit_desc', label: 'Highest Credits' },
                      ]}
                      className="min-w-[200px]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="h-6 w-32 mb-3" />
                    <Skeleton className="h-32 w-full" />
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {isError && (
              <Card className="p-8 text-center">
                <svg
                  className="w-12 h-12 text-red-500 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Failed to load journal entries
                </h3>
                <p className="text-gray-600 mb-4">There was an error fetching your journal.</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </Card>
            )}


            {/* Journal Table */}
            {!isLoading && !isError && data && (
              <>
                {sortedJournal.length === 0 ? (
                  <Card className="p-8 text-center">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No journal entries found</h3>
                    <p className="text-gray-600 mb-4">
                      {hasActiveFilters
                        ? 'No entries match your filters. Try adjusting the date range.'
                        : 'No journal entries available for the selected period.'}
                    </p>
                  </Card>
                ) : (
                  /* New Dynamic Journal Table with Scrollable Design */
                  <div className="w-full overflow-hidden">
                    <Card className="overflow-hidden">
                      <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
                        <table className="w-max min-w-full">
                          <thead className="bg-gray-100 sticky top-0 z-20">
                            <tr className="border-b-2 border-gray-300">
                              <th className="text-left py-3 px-3 font-semibold text-gray-700 min-w-[60px] sticky left-0 bg-gray-100 z-30">
                                S.No
                              </th>
                              <th className="text-left py-3 px-3 font-semibold text-gray-700 min-w-[120px]">
                                Date
                              </th>
                              <th className="text-right py-3 px-3 font-semibold text-gray-700 min-w-[100px]">
                                Opening
                              </th>

                              {/* Dynamic Credit Register Columns */}
                              {creditRegisters.map((register) => (
                                <th
                                  key={`credit-${register.id}`}
                                  className="text-right py-3 px-3 font-semibold text-green-700 min-w-[100px] bg-green-50"
                                >
                                  {register.name} (Cr)
                                </th>
                              ))}

                              <th className="text-right py-3 px-3 font-semibold text-green-700 min-w-[110px] bg-green-100">
                                Total Credit
                              </th>
                              <th className="text-right py-3 px-3 font-semibold text-blue-700 min-w-[100px] bg-blue-50">
                                Net Balance
                              </th>

                              {/* Dynamic Debit Register Columns */}
                              {debitRegisters.map((register) => (
                                <th
                                  key={`debit-${register.id}`}
                                  className="text-right py-3 px-3 font-semibold text-red-700 min-w-[100px] bg-red-50"
                                >
                                  {register.name} (Dr)
                                </th>
                              ))}

                              <th className="text-right py-3 px-3 font-semibold text-red-700 min-w-[110px] bg-red-100">
                                Total Debit
                              </th>
                              <th className="text-right py-3 px-3 font-semibold text-gray-700 min-w-[100px]">
                                Closing
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(groupedJournal).map(([groupName, entries]) => (
                              <>
                                {/* Group Header Row */}
                                {groupBy !== 'none' && (
                                  <tr className="bg-blue-50 border-y-2 border-blue-200">
                                    <td
                                      colSpan={3 + creditRegisters.length + debitRegisters.length + 4}
                                      className="py-3 px-3"
                                    >
                                      <div className="flex items-center justify-between">
                                        <h3 className="text-base font-semibold text-blue-900">
                                          {groupName}
                                          <span className="ml-2 text-sm font-normal text-blue-700">
                                            ({entries.length} {entries.length === 1 ? 'entry' : 'entries'})
                                          </span>
                                        </h3>
                                      </div>
                                    </td>
                                  </tr>
                                )}

                                {/* Group Entries */}
                                {entries.map((entry) => {
                                  const index = sortedJournal.findIndex(e => e.date === entry.date && e.opening_balance === entry.opening_balance);
                                  // Skip holidays in table, show them separately
                                  if (entry.is_holiday) {
                                    return (
                                      <tr key={index} className="bg-yellow-50">
                                        <td className="py-3 px-3 sticky left-0 bg-yellow-50 z-10">
                                          {index + 1}
                                        </td>
                                        <td colSpan={3 + creditRegisters.length + debitRegisters.length + 4} className="py-3 px-3">
                                          <div className="flex items-center gap-2">
                                            <span className="text-yellow-600 text-lg">🌟</span>
                                            <span className="font-semibold text-gray-900">{formatDate(entry.date)}</span>
                                            <span className="text-sm text-yellow-700">- Holiday: {entry.holiday_reason}</span>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  }

                                  return (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                      <td className="py-3 px-3 text-gray-900 sticky left-0 bg-white hover:bg-gray-50 z-10">
                                        {index + 1}
                                      </td>
                                      <td className="py-3 px-3 text-gray-900 bg-gray-100 font-medium">
                                        {formatDate(entry.date)}
                                      </td>
                                      <td className="py-3 px-3 text-right font-semibold bg-gray-100 text-gray-900">
                                        {formatCurrency(entry.opening_balance || 0)}
                                      </td>

                                      {/* Dynamic Credit Register Amounts */}
                                      {creditRegisters.map((register) => {
                                        const amount = getRegisterAmount(entry, register.id, 'credit');
                                        return (
                                          <td
                                            key={`credit-${register.id}`}
                                            className="py-3 px-3 text-right text-green-700 font-medium bg-green-50"
                                          >
                                            {amount > 0 ? formatCurrency(amount) : '-'}
                                          </td>
                                        );
                                      })}

                                      <td className="py-3 px-3 text-right font-bold text-green-700 bg-green-100">
                                        {formatCurrency(entry.total_credit || 0)}
                                      </td>
                                      <td className="py-3 px-3 text-right font-bold text-blue-700 bg-blue-50">
                                        {formatCurrency(entry.net_balance || 0)}
                                      </td>

                                      {/* Dynamic Debit Register Amounts */}
                                      {debitRegisters.map((register) => {
                                        const amount = getRegisterAmount(entry, register.id, 'debit');
                                        return (
                                          <td
                                            key={`debit-${register.id}`}
                                            className="py-3 px-3 text-right text-red-700 font-medium bg-red-50"
                                          >
                                            {amount > 0 ? formatCurrency(amount) : '-'}
                                          </td>
                                        );
                                      })}

                                      <td className="py-3 px-3 text-right font-bold text-red-700 bg-red-100">
                                        {formatCurrency(entry.total_debit || 0)}
                                      </td>
                                      <td className="py-3 px-3 text-right font-semibold bg-gray-100 text-gray-900">
                                        {formatCurrency(entry.closing_balance || 0)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Table Legend */}
                      <div className="p-4 bg-gray-50 border-t text-xs text-gray-600 flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-100 border border-green-300"></div>
                          <span>Credit Registers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-100 border border-red-300"></div>
                          <span>Debit Registers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-50 border border-blue-300"></div>
                          <span>Net Balance</span>
                        </div>
                        <span className="ml-auto">💡 Scroll horizontally to view all registers</span>
                      </div>
                    </Card>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
