// FILE: src/components/registers/RegisterForm.tsx
// PURPOSE: Reusable form for creating/editing registers
// API: POST/PUT /registers/

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { registerSchema, type RegisterInput, type Register } from '../../features/registers/schemas';

interface RegisterFormProps {
  /** Existing register for edit mode, undefined for create mode */
  register?: Register;
  /** Callback fired on successful submit */
  onSuccess?: (register: Register) => void;
  /** Callback fired on cancel */
  onCancel?: () => void;
  /** Show cancel button */
  showCancel?: boolean;
  /** External loading state (for mutations) */
  isSubmitting?: boolean;
  /** External submit handler (for mutations) */
  onSubmit?: (data: RegisterInput) => void;
}

/**
 * RegisterForm Component
 * 
 * Renders a form for creating or editing registers.
 * 
 * Features:
 * - All fields: name, register_type, description
 * - Validation with Zod schema
 * - Create/edit modes
 * - External submit handler support (for mutations)
 * 
 * Usage:
 * ```tsx
 * // With external mutation
 * const createMutation = useCreateRegister();
 * 
 * <RegisterForm 
 *   onSubmit={(data) => createMutation.mutate(data)}
 *   isSubmitting={createMutation.isPending}
 *   onSuccess={() => closeModal()}
 *   showCancel
 * />
 * ```
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({
  register,
  onCancel,
  showCancel = false,
  isSubmitting = false,
  onSubmit: externalOnSubmit,
}) => {
  const isEditMode = !!register;

  const {
    register: registerField,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: register
      ? {
          name: register.name,
          credit: register.credit,
          debit: register.debit,
          description: register.description || '',
        }
      : {
          credit: true,
          debit: true,
          description: '',
        },
  });

  // Reset form when register changes (useful in modals)
  useEffect(() => {
    if (register) {
      reset({
        name: register.name,
        credit: register.credit,
        debit: register.debit,
        description: register.description || '',
      });
    }
  }, [register, reset]);

  const onSubmitHandler = (data: RegisterInput) => {
    if (externalOnSubmit) {
      externalOnSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1.5">
          Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          type="text"
          placeholder="e.g., Cash, Bank Account, Credit Card"
          {...registerField('name')}
          error={errors.name?.message}
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500 mt-1">
          A descriptive name for this register (max 100 characters)
        </p>
      </div>

      {/* Transaction Types */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Transaction Types <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          <div className="flex items-center">
            <Controller
              name="debit"
              control={control}
              render={({ field }) => (
                <input
                  id="debit"
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-[var(--brand-500)] bg-[var(--surface)] border-[var(--border)] rounded focus:ring-[var(--brand-500)] focus:ring-2"
                />
              )}
            />
            <label htmlFor="debit" className="ml-2 text-sm text-[var(--text)]">
              Debit (Expenses - money going out)
            </label>
          </div>
          <div className="flex items-center">
            <Controller
              name="credit"
              control={control}
              render={({ field }) => (
                <input
                  id="credit"
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-[var(--brand-500)] bg-[var(--surface)] border-[var(--border)] rounded focus:ring-[var(--brand-500)] focus:ring-2"
                />
              )}
            />
            <label htmlFor="credit" className="ml-2 text-sm text-[var(--text)]">
              Credit (Income - money coming in)
            </label>
          </div>
        </div>
        {(errors.credit || errors.debit) && (
          <p className="text-sm text-red-500 mt-1">{errors.credit?.message || errors.debit?.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Select at least one transaction type for this register
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1.5">
          Description (Optional)
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="Additional notes about this register..."
          {...registerField('description')}
          disabled={isSubmitting}
          className={`
            w-full px-3 py-2 rounded-lg border transition-colors bg-[var(--surface)] text-[var(--text)]
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${errors.description ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">Maximum 500 characters</p>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t">
        {showCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} className="flex-1">
          {isEditMode ? 'Update Register' : 'Create Register'}
        </Button>
      </div>
    </form>
  );
};
