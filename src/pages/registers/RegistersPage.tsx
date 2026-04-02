// FILE: src/pages/registers/RegistersPage.tsx
// PURPOSE: Main registers list page with grid layout and CRUD operations
// API: GET /registers/, POST /registers/, PUT /registers/:id/, DELETE /registers/:id/

import { useState } from 'react';
import { useRegisters, useCreateRegister, useUpdateRegister, useDeleteRegister } from '../../features/registers/hooks';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { RegisterForm } from '../../components/registers/RegisterForm';
import type { Register, RegisterInput } from '../../features/registers/schemas';

/**
 * RegistersPage Component
 * 
 * Displays all registers in a responsive grid with CRUD operations.
 * 
 * Structure:
 * - Header with title and "Create" button
 * - Responsive grid of register cards (1/2/3 columns)
 * - Create/Edit modal with RegisterForm
 * - Delete confirmation modal
 * - Empty states, loading, and error handling
 * 
 * Features:
 * - Create register (modal)
 * - Edit register (modal with prefilled form)
 * - Delete register (with confirmation)
 * - Register type badges (color-coded)
 * - Responsive grid layout
 * 
 * Routes:
 * - /app/registers
 */
export const RegistersPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRegister, setEditingRegister] = useState<Register | null>(null);
  const [deletingRegister, setDeletingRegister] = useState<Register | null>(null);

  // Fetch registers
  const { data, isLoading, isError } = useRegisters();
  
  // Mutations
  const createMutation = useCreateRegister();
  const updateMutation = useUpdateRegister();
  const deleteMutation = useDeleteRegister();

  const handleCreate = (data: RegisterInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setShowCreateModal(false);
      },
    });
  };

  const handleEdit = (data: RegisterInput) => {
    if (!editingRegister) return;
    
    updateMutation.mutate(
      { id: editingRegister.id, data },
      {
        onSuccess: () => {
          setEditingRegister(null);
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deletingRegister) return;
    
    deleteMutation.mutate(deletingRegister.id, {
      onSuccess: () => {
        setDeletingRegister(null);
      },
    });
  };

  const getRegisterTypeBadge = (register: Register) => {
    // Determine type based on credit and debit booleans
    let type: 'debit' | 'credit' | 'both';
    if (register.debit && register.credit) {
      type = 'both';
    } else if (register.debit) {
      type = 'debit';
    } else {
      type = 'credit';
    }

    const config = {
      debit: { label: 'Debit', color: 'bg-red-100 text-red-700' },
      credit: { label: 'Credit', color: 'bg-green-100 text-green-700' },
      both: { label: 'Debit & Credit', color: 'bg-blue-100 text-blue-700' },
    };

    const { label, color } = config[type];
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-inherit py-6 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text)]">Registers</h1>
            <p className="text-[var(--muted)] mt-1">Manage your transaction registers</p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-32 mb-3" />
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-16 w-full" />
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load registers</h3>
            <p className="text-gray-600 mb-4">There was an error fetching your registers.</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </Card>
        )}

        {/* Register List */}
        {!isLoading && !isError && data && (
          <>
            {data.results.length === 0 ? (
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No registers yet</h3>
                <p className="text-gray-600 mb-4">
                  Get started by creating your first register to track transactions.
                </p>
                <Button onClick={() => setShowCreateModal(true)}>Create Register</Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {data.results.map((register) => (
                  <Card
                    key={register.id}
                    className="p-4 rounded-lg border hover:border-blue-600 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Register Header */}
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-[var(--text)] text-lg">
                            {register.name}
                          </h3>
                          {getRegisterTypeBadge(register)}
                        </div>

                        {/* Description */}
                        {register.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {register.description}
                          </p>
                        )}

                        {/* Created Date */}
                        {register.created_at && (
                          <p className="text-xs text-gray-500">
                            Created: {new Date(register.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingRegister(register)}
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
                          onClick={() => setDeletingRegister(register)}
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
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Register"
      >
        <RegisterForm
          onSubmit={handleCreate}
          isSubmitting={createMutation.isPending}
          onCancel={() => setShowCreateModal(false)}
          showCancel
        />
      </Modal>

      {/* Edit Modal */}
      {editingRegister && (
        <Modal
          isOpen={!!editingRegister}
          onClose={() => setEditingRegister(null)}
          title="Edit Register"
        >
          <RegisterForm
            register={editingRegister}
            onSubmit={handleEdit}
            isSubmitting={updateMutation.isPending}
            onCancel={() => setEditingRegister(null)}
            showCancel
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRegister && (
        <Modal
          isOpen={!!deletingRegister}
          onClose={() => setDeletingRegister(null)}
          title="Confirm Delete"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete this register? This action cannot be undone.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Register Details:</div>
              <div className="font-semibold text-gray-900 mt-1">{deletingRegister.name}</div>
              <div className="text-sm text-gray-600 mt-1">
                Type: {deletingRegister.debit && deletingRegister.credit ? 'Debit & Credit' : deletingRegister.debit ? 'Debit' : 'Credit'}
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Transactions associated with this register may be
                affected.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setDeletingRegister(null)}
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
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Sticky FAB - Create Register */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 z-50 group"
        aria-label="Create Register"
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
          Create Register
        </span>
      </button>
    </div>
  );
};
