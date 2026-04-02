// FILE: src/pages/holidays/HolidaysPage.tsx
// PURPOSE: Holidays management page - list, create, and delete holidays
// API: GET /api/v2/holiday, POST /api/v2/holiday, DELETE /api/v2/holiday

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Button, Skeleton, Modal, Select } from '../../components/ui';
import { useHolidays, useCreateHoliday, useDeleteHoliday, useUpdateHoliday } from '../../features/holidays/hooks';
import toast from 'react-hot-toast';

interface EditHolidayState {
  isOpen: boolean;
  originalDate: string;
  date: string;
  reason: string;
}

export const HolidaysPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: holidaysResponse, isLoading } = useHolidays();
  const createHolidayMutation = useCreateHoliday();
  const deleteHolidayMutation = useDeleteHoliday();
  const updateHolidayMutation = useUpdateHoliday();
  
  // Get groupBy from URL
  const groupBy = searchParams.get('group_by') || 'none';
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    date: '',
    reason: ''
  });

  const [editHoliday, setEditHoliday] = useState<EditHolidayState>({
    isOpen: false,
    originalDate: '',
    date: '',
    reason: ''
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    date: string;
    reason: string;
  }>({
    isOpen: false,
    date: '',
    reason: ''
  });

  // Sort holidays: upcoming first, then past
  const sortedHolidays = React.useMemo(() => {
    if (!holidaysResponse?.data) return [];
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const upcoming = holidaysResponse.data
      .filter(h => new Date(h.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const past = holidaysResponse.data
      .filter(h => new Date(h.date) < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return [...upcoming, ...past];
  }, [holidaysResponse]);

  // Group holidays by month or year
  const groupedHolidays = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Holidays': sortedHolidays };
    }

    const groups: Record<string, typeof sortedHolidays> = {};
    
    sortedHolidays.forEach((holiday) => {
      const date = new Date(holiday.date);
      let groupKey = '';
      
      switch (groupBy) {
        case 'month': {
          groupKey = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          });
          break;
        }
        case 'year': {
          groupKey = date.getFullYear().toString();
          break;
        }
        default:
          groupKey = 'All Holidays';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(holiday);
    });
    
    return groups;
  }, [sortedHolidays, groupBy]);

  const handleGroupByChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'none') {
      params.delete('group_by');
    } else {
      params.set('group_by', value);
    }
    setSearchParams(params);
  };

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newHoliday.date || !newHoliday.reason.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    createHolidayMutation.mutate(newHoliday, {
      onSuccess: () => {
        setNewHoliday({ date: '', reason: '' });
        setShowCreateForm(false);
      }
    });
  };

  const handleEditHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editHoliday.date || !editHoliday.reason.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    updateHolidayMutation.mutate({
      oldDate: editHoliday.originalDate,
      newData: {
        date: editHoliday.date,
        reason: editHoliday.reason
      }
    }, {
      onSuccess: () => {
        setEditHoliday({
          isOpen: false,
          originalDate: '',
          date: '',
          reason: ''
        });
      }
    });
  };

  const handleDeleteHoliday = () => {
    deleteHolidayMutation.mutate({ date: deleteConfirm.date }, {
      onSuccess: () => {
        setDeleteConfirm({
          isOpen: false,
          date: '',
          reason: ''
        });
      }
    });
  };

  const openEditModal = (date: string, reason: string) => {
    setEditHoliday({
      isOpen: true,
      originalDate: date,
      date: date,
      reason: reason
    });
  };

  const openDeleteModal = (date: string, reason: string) => {
    setDeleteConfirm({
      isOpen: true,
      date: date,
      reason: reason
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isUpcoming = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return date >= now;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text)]">Holidays</h1>
          <p className="text-[var(--muted)] mt-1">
            Manage days when your business is closed
          </p>
        </div>
      </div>

      {/* Create Holiday Form */}
      {showCreateForm && (
        <Card variant="elevated">
          <form onSubmit={handleCreateHoliday} className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--text)]">Mark New Holiday</h2>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Date
              </label>
              <input
                type="date"
                value={newHoliday.date}
                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] bg-[var(--bg)] text-[var(--text)]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Reason
              </label>
              <input
                type="text"
                value={newHoliday.reason}
                onChange={(e) => setNewHoliday({ ...newHoliday, reason: e.target.value })}
                placeholder="e.g., Christmas, New Year, etc."
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] bg-[var(--bg)] text-[var(--text)]"
                required
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                loading={createHolidayMutation.isPending}
              >
                Mark Holiday
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewHoliday({ date: '', reason: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Holidays List */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-[var(--text)]">
              All Holidays
            </h2>
            {holidaysResponse?.data && (
              <span className="text-sm text-[var(--muted)]">
                {holidaysResponse.data.length} holidays
              </span>
            )}
          </div>

          {/* Group By Dropdown */}
          {sortedHolidays.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Group by:</label>
              <Select
                value={groupBy}
                onChange={(e) => handleGroupByChange(e.target.value)}
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'month', label: 'Month' },
                  { value: 'year', label: 'Year' },
                ]}
                className="min-w-[150px]"
              />
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rectangular" height={80} />
            ))}
          </div>
        ) : sortedHolidays.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedHolidays).map(([groupName, holidays]) => (
              <div key={groupName}>
                {/* Group Header */}
                {groupBy !== 'none' && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {groupName}
                      <span className="ml-2 text-sm font-normal text-gray-600">
                        ({holidays.length} {holidays.length === 1 ? 'holiday' : 'holidays'})
                      </span>
                    </h3>
                    <div className="h-0.5 bg-gradient-to-r from-blue-500 to-transparent mt-2"></div>
                  </div>
                )}
                
                {/* Group Holidays */}
                <div className="space-y-3">
                  {holidays.map((holiday, index) => {
              const upcoming = isUpcoming(holiday.date);
              
              return (
                <div
                  key={`${holiday.date}-${index}`}
                  className={`p-4 rounded-lg border transition-colors ${
                    upcoming
                      ? 'border-[var(--brand-500)] bg-[var(--brand-50)]'
                      : 'border-[var(--border)] bg-[var(--background-elevated)]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-[var(--text)]">
                          {holiday.holiday_reason}
                        </h3>
                        {upcoming && (
                          <span className="px-2 py-1 text-xs font-medium bg-[var(--brand-500)] text-white rounded">
                            Upcoming
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--muted)]">
                        {formatDate(holiday.date)}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(holiday.date, holiday.holiday_reason)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteModal(holiday.date, holiday.holiday_reason)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🗓️</div>
            <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
              No holidays marked
            </h3>
            <p className="text-[var(--muted)] mb-4">
              Mark days when your business is closed
            </p>
            <Button
              variant="primary"
              onClick={() => setShowCreateForm(true)}
            >
              Mark First Holiday
            </Button>
          </div>
        )}
      </Card>

      {/* Edit Holiday Modal */}
      <Modal
        isOpen={editHoliday.isOpen}
        onClose={() => setEditHoliday({ isOpen: false, originalDate: '', date: '', reason: '' })}
        title="Edit Holiday"
      >
        <form onSubmit={handleEditHoliday} className="space-y-6">
          <p className="text-sm text-[var(--muted)]">
            Update the holiday details below.
          </p>

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={editHoliday.date}
              onChange={(e) => setEditHoliday({ ...editHoliday, date: e.target.value })}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] bg-[var(--bg)] text-[var(--text)]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editHoliday.reason}
              onChange={(e) => setEditHoliday({ ...editHoliday, reason: e.target.value })}
              placeholder="e.g., Christmas, New Year, etc."
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] bg-[var(--bg)] text-[var(--text)]"
              required
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              variant="primary"
              loading={updateHolidayMutation.isPending}
              className="flex-1"
            >
              Update Holiday
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditHoliday({ isOpen: false, originalDate: '', date: '', reason: '' })}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, date: '', reason: '' })}
        title="Remove Holiday"
      >
        <div className="space-y-6">
          <div>
            <p className="text-[var(--text)] mb-4">
              Are you sure you want to remove this holiday?
            </p>
            <div className="bg-[var(--background-elevated)] p-4 rounded-lg border border-[var(--border)]">
              <p className="font-semibold text-[var(--text)] mb-1">
                {deleteConfirm.reason}
              </p>
              <p className="text-sm text-[var(--muted)]">
                {deleteConfirm.date && formatDate(deleteConfirm.date)}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="danger"
              onClick={handleDeleteHoliday}
              loading={deleteHolidayMutation.isPending}
              className="flex-1"
            >
              Remove Holiday
            </Button>
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirm({ isOpen: false, date: '', reason: '' })}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Sticky FAB - Mark Holiday */}
      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 z-50 group"
        aria-label="Mark Holiday"
      >
        {showCreateForm ? (
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
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
        )}
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {showCreateForm ? 'Cancel' : 'Mark Holiday'}
        </span>
      </button>
    </div>
  );
};

export default HolidaysPage;
