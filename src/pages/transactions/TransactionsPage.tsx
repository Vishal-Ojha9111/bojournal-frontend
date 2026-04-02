// FILE: src/pages/transactions/TransactionsPage.tsx
// PURPOSE: Main transactions list page with filters, sorting, edit/delete, and pagination
// API: GET /transactions/

import { useState, useMemo, useCallback } from 'react';
import { useTransactions, useDeleteTransaction } from '../../features/transactions/hooks';
import { useRegisters } from '../../features/registers/hooks';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import type { TransactionFilters, Transaction } from '../../features/transactions/schemas';
import { formatCurrency } from '../../lib/currency';
import { getRegisterNameById } from '../../lib/userStorage';
import { Link, useSearchParams } from 'react-router-dom';

/**
 * TransactionsPage Component
 * 
 * Displays paginated list of transactions with filtering, sorting, edit, and delete.
 */
export const TransactionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(true);
  const [showResults, setShowResults] = useState(false); // Show results only after filter apply
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  // Parse filters from URL
  const filters: TransactionFilters = {
    date: searchParams.get('date') || undefined,
    start_date: searchParams.get('start_date') || undefined,
    end_date: searchParams.get('end_date') || undefined,
    transaction_type: (searchParams.get('transaction_type') as 'debit' | 'credit') || undefined,
    register: searchParams.get('register') ? Number(searchParams.get('register')) : undefined,
  };

  const sortBy = searchParams.get('sort_by') || 'date_desc';
  const page = Number(searchParams.get('page')) || 1;
  const groupBy = searchParams.get('group_by') || 'none';

  // Fetch transactions (note: pagination is handled by the API via filters)
  const { data, isLoading, isError } = useTransactions(filters);
  const deleteMutation = useDeleteTransaction();

  // Fetch registers for dropdown and name display
  const { data: registersData } = useRegisters();

  // Helper to get register name
  const getRegisterName = useCallback((registerId: number): string => {
    // Try localStorage first (faster)
    const storedName = getRegisterNameById(registerId);
    if (storedName) return storedName;
    
    // Fallback to fetched registers data
    const register = registersData?.results?.find(r => r.id === registerId);
    return register?.name || `Register #${registerId}`;
  }, [registersData]);

  // Form state for filter inputs
  const [filterForm, setFilterForm] = useState<TransactionFilters>(filters);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    
    if (filterForm.date) params.set('date', filterForm.date);
    if (filterForm.start_date) params.set('start_date', filterForm.start_date);
    if (filterForm.end_date) params.set('end_date', filterForm.end_date);
    if (filterForm.transaction_type) params.set('transaction_type', filterForm.transaction_type);
    if (filterForm.register) params.set('register', String(filterForm.register));
    if (sortBy) params.set('sort_by', sortBy);
    
    params.set('page', '1'); // Reset to first page on filter change
    setSearchParams(params);
    setShowFilters(false); // Collapse filters after applying
    setShowResults(true); // Show results after applying filters
  };

  const handleFetchAll = () => {
    setFilterForm({});
    const params = new URLSearchParams();
    if (sortBy) params.set('sort_by', sortBy);
    params.set('page', '1');
    setSearchParams(params);
    setShowFilters(false);
    setShowResults(true); // Show results when fetching all
  };

  const hasActiveFilters = !!(
    filters.date ||
    filters.start_date ||
    filters.end_date ||
    filters.transaction_type ||
    filters.register
  );

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort_by', newSort);
    params.set('page', '1'); // Reset to first page on sort change
    setSearchParams(params);
  };

  // Sort transactions client-side
  const sortedTransactions = useMemo(() => {
    if (!data?.results) return [];
    
    const transactionsCopy = [...data.results];
    
    switch (sortBy) {
      case 'date_asc':
        return transactionsCopy.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'date_desc':
        return transactionsCopy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'amount_asc':
        return transactionsCopy.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
      case 'amount_desc':
        return transactionsCopy.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
      case 'type_debit':
        return transactionsCopy.sort((a, b) => {
          if (a.transaction_type === 'debit' && b.transaction_type !== 'debit') return -1;
          if (a.transaction_type !== 'debit' && b.transaction_type === 'debit') return 1;
          return 0;
        });
      case 'type_credit':
        return transactionsCopy.sort((a, b) => {
          if (a.transaction_type === 'credit' && b.transaction_type !== 'credit') return -1;
          if (a.transaction_type !== 'credit' && b.transaction_type === 'credit') return 1;
          return 0;
        });
      default:
        return transactionsCopy;
    }
  }, [data?.results, sortBy]);

  // Group transactions based on groupBy parameter
  const groupedTransactions = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Transactions': sortedTransactions };
    }

    const groups: Record<string, Transaction[]> = {};

    sortedTransactions.forEach((transaction) => {
      let groupKey = '';

      switch (groupBy) {
        case 'date':
          groupKey = transaction.date;
          break;
        case 'week': {
          const date = new Date(transaction.date);
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          groupKey = `Week of ${startOfWeek.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`;
          break;
        }
        case 'month': {
          const monthDate = new Date(transaction.date);
          groupKey = monthDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
          break;
        }
        case 'type':
          groupKey = transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1);
          break;
        case 'register':
          groupKey = getRegisterName(transaction.register);
          break;
        default:
          groupKey = 'All Transactions';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(transaction);
    });

    return groups;
  }, [sortedTransactions, groupBy, getRegisterName]);

  const handleGroupByChange = (newGroupBy: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('group_by', newGroupBy);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleDelete = () => {
    if (!deletingTransaction) return;
    
    deleteMutation.mutate(deletingTransaction.id, {
      onSuccess: () => {
        setDeletingTransaction(null);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-inherit py-6 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text)]">Transactions</h1>
            <p className="text-gray-600 mt-1 text-[var(--muted)]">Manage your debits and credits</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Single Date */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Date</label>
                    <Input
                      type="date"
                      value={filterForm.date || ''}
                      onChange={(e) =>
                        setFilterForm({ ...filterForm, date: e.target.value || undefined })
                      }
                    />
                  </div>

                  {/* Date Range */}
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

                  <div>
                    <label className="block text-sm font-medium mb-1.5">End Date</label>
                    <Input
                      type="date"
                      value={filterForm.end_date || ''}
                      onChange={(e) =>
                        setFilterForm({ ...filterForm, end_date: e.target.value || undefined })
                      }
                    />
                  </div>

                  {/* Transaction Type */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Type</label>
                    <Select
                      value={filterForm.transaction_type || ''}
                      onChange={(e) =>
                        setFilterForm({
                          ...filterForm,
                          transaction_type: (e.target.value as 'debit' | 'credit') || undefined,
                        })
                      }
                      options={[
                        { value: '', label: 'All' },
                        { value: 'debit', label: 'Debit' },
                        { value: 'credit', label: 'Credit' },
                      ]}
                    />
                  </div>

                  {/* Register */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Register</label>
                    <Select
                      value={filterForm.register?.toString() || ''}
                      onChange={(e) =>
                        setFilterForm({
                          ...filterForm,
                          register: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      options={[
                        { value: '', label: 'All Registers' },
                        ...(registersData?.results || []).map((reg) => ({
                          value: reg.id.toString(),
                          label: reg.name,
                        })),
                      ]}
                    />
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={handleApplyFilters} className="flex-1 sm:flex-none">
                    Apply Filter
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleFetchAll}
                    className="flex-1 sm:flex-none"
                  >
                    Fetch All Transactions
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Show results only after user clicks Apply Filter or Fetch All */}
        {showResults && (
          <>
            {/* Active Filter Tags & Sorting */}
            {!isLoading && !isError && data && sortedTransactions.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {hasActiveFilters && (
                    <>
                      {filters.date && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          Date: {filters.date}
                        </span>
                      )}
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
                      {filters.transaction_type && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          Type: {filters.transaction_type}
                        </span>
                      )}
                      {filters.register && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          Register: {getRegisterName(filters.register)}
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

                {/* Sorting and Grouping Dropdowns */}
                <div className="flex items-center gap-4">
                  {/* Group By Dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Group by:</label>
                    <Select
                      value={groupBy}
                      onChange={(e) => handleGroupByChange(e.target.value)}
                      options={[
                        { value: 'none', label: 'None' },
                        { value: 'date', label: 'Date' },
                        { value: 'week', label: 'Week' },
                        { value: 'month', label: 'Month' },
                        { value: 'type', label: 'Type' },
                        { value: 'register', label: 'Register' },
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
                        { value: 'amount_desc', label: 'Amount (High to Low)' },
                        { value: 'amount_asc', label: 'Amount (Low to High)' },
                        { value: 'type_debit', label: 'Debits First' },
                        { value: 'type_credit', label: 'Credits First' },
                      ]}
                      className="min-w-[200px]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-24" />
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load transactions</h3>
                <p className="text-gray-600 mb-4">There was an error fetching your transactions.</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </Card>
            )}

            {/* Transaction List */}
            {!isLoading && !isError && data && (
          <>
            {sortedTransactions.length === 0 ? (
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {hasActiveFilters ? 'No transactions found' : 'No transactions yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {hasActiveFilters
                    ? 'Try adjusting your filters to see more results.'
                    : 'Get started by creating your first transaction.'}
                </p>
                {hasActiveFilters ? (
                  <Button variant="secondary" onClick={handleFetchAll}>
                    Fetch All Transactions
                  </Button>
                ) : (
                  <Link to="/app/transactions/create">
                    <Button>Create Transaction</Button>
                  </Link>
                )}
              </Card>
            ) : (
              <>
                {/* Grouped Transaction Display */}
                <div className="space-y-6 mb-6">
                  {Object.entries(groupedTransactions).map(([groupName, transactions]) => (
                    <div key={groupName}>
                      {/* Group Header (only if grouping is active) */}
                      {groupBy !== 'none' && (
                        <div className="mb-4">
                          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {groupName}
                            <span className="text-sm font-normal text-gray-500">
                              ({transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'})
                            </span>
                          </h2>
                          <div className="h-0.5 bg-gradient-to-r from-blue-500 to-transparent mt-2"></div>
                        </div>
                      )}

                      {/* Transaction Grid for this group */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {transactions.map((transaction: Transaction) => (
                    <Card
                      key={transaction.id}
                      className="p-4 hover:shadow-lg transition-shadow"
                    >
                      {/* Transaction Type Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.transaction_type === 'debit'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {transaction.transaction_type.toUpperCase()}
                        </span>
                        {transaction.image_url && (
                          <span className="text-xs text-gray-500">
                            📎 1
                          </span>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="mb-2">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </div>
                      </div>

                      {/* Date */}
                      <div className="text-sm text-gray-600 mb-2">{transaction.date}</div>

                      {/* Description */}
                      {transaction.description && (
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {transaction.description}
                        </p>
                      )}

                      {/* Register Name */}
                      <div className="text-xs text-gray-500 mb-3">
                        Register: {getRegisterName(transaction.register)}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3 border-t">
                        <Link to={`/app/transactions/edit/${transaction.id}`} className="flex-1">
                          <Button variant="secondary" className="w-full text-sm">
                            ✏️ Edit
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingTransaction(transaction);
                          }}
                          className="flex-1 text-sm"
                        >
                          🗑️ Delete
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
                      </div>
                    ))}
                </div>

                {/* Pagination */}
                {data.count > 10 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, data.count)} of{' '}
                      {data.count} transactions
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={!data.previous || page === 1}
                      >
                        ← Previous
                      </Button>
                      <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium">
                        Page {page} of {Math.ceil(data.count / 10)}
                      </span>
                      <Button
                        variant="secondary"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={!data.next || page >= Math.ceil(data.count / 10)}
                      >
                        Next →
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </>
    )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingTransaction && (
        <Modal
          isOpen={!!deletingTransaction}
          onClose={() => setDeletingTransaction(null)}
          title="Confirm Delete"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Transaction Details:</div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">{formatCurrency(deletingTransaction.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className={`font-semibold ${
                    deletingTransaction.transaction_type === 'debit' ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {deletingTransaction.transaction_type.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold">{deletingTransaction.date}</span>
                </div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This will permanently remove the transaction from your records.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setDeletingTransaction(null)}
                className="flex-1"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                className="flex-1"
                loading={deleteMutation.isPending}
              >
                Delete Transaction
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Sticky FAB - Create Transaction */}
      <Link to="/app/transactions/create">
        <button
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 z-50 group"
          aria-label="Create Transaction"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Create Transaction
          </span>
        </button>
      </Link>
    </div>
  );
};
