'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Loader2,
  Save,
  X,
  Copy,
} from 'lucide-react';
import { CareerMovement, MovementType, Department } from '@/types';

interface CareerMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CareerMovementFormData) => Promise<void>;
  movement?: CareerMovement | null;
  departments: Department[];
  isLoading?: boolean;
  isAddingNew?: boolean;
  latestMovement?: CareerMovement | null;
}

export interface CareerMovementFormData {
  movementType: MovementType;
  effectiveDate: string;
  jobTitle: string;
  departmentId: string;
  salary: number;
  remarks: string;
}

// Only show these movement types (hire is automatic from hire date)
const availableMovementTypes: { value: MovementType; label: string }[] = [
  { value: 'promotion', label: 'Promotion' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'salary_adjustment', label: 'Salary Adjustment' },
];

// Define which fields are needed for each movement type
const movementTypeFields: Record<string, { jobTitle: boolean; department: boolean; salary: boolean }> = {
  promotion: { jobTitle: true, department: true, salary: true },
  transfer: { jobTitle: true, department: true, salary: true },
  salary_adjustment: { jobTitle: false, department: false, salary: true },
  hire: { jobTitle: true, department: true, salary: true },
};

export function CareerMovementModal({
  isOpen,
  onClose,
  onSave,
  movement,
  departments,
  isLoading = false,
  isAddingNew = false,
  latestMovement,
}: CareerMovementModalProps) {
  const isEditing = !!movement;
  const prevData = latestMovement;
  
  const [formData, setFormData] = useState<CareerMovementFormData>({
    movementType: 'promotion',
    effectiveDate: new Date().toISOString().split('T')[0],
    jobTitle: '',
    departmentId: '',
    salary: 0,
    remarks: '',
  });

  const currentFields = movementTypeFields[formData.movementType] || movementTypeFields.promotion;

  useEffect(() => {
    if (!isOpen) return;
    
    if (movement) {
      // Editing existing movement
      setFormData({
        movementType: movement.movementType,
        effectiveDate: movement.effectiveDate 
          ? new Date(movement.effectiveDate).toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0],
        jobTitle: movement.jobTitle || '',
        departmentId: movement.departmentId || '',
        salary: movement.salary || 0,
        remarks: movement.remarks || '',
      });
    } else if (isAddingNew) {
      // Adding new - start fresh
      setFormData({
        movementType: 'promotion',
        effectiveDate: new Date().toISOString().split('T')[0],
        jobTitle: '',
        departmentId: '',
        salary: 0,
        remarks: '',
      });
    }
  }, [movement, isOpen, isAddingNew]);

  // Auto-fill hidden fields with previous data when movement type is salary_adjustment
  useEffect(() => {
    if (!isEditing && prevData && formData.movementType === 'salary_adjustment') {
      setFormData(prev => ({
        ...prev,
        jobTitle: prevData.jobTitle || prev.jobTitle,
        departmentId: prevData.departmentId || prev.departmentId || '',
      }));
    }
  }, [formData.movementType, isEditing, prevData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleChange = (field: keyof CareerMovementFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClear = (field: keyof CareerMovementFormData) => {
    if (field === 'salary') {
      setFormData(prev => ({ ...prev, [field]: 0 }));
    } else {
      setFormData(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCopyFromPrevious = (field: 'jobTitle' | 'departmentId' | 'salary') => {
    if (!prevData) return;
    if (field === 'jobTitle' && prevData.jobTitle) {
      setFormData(prev => ({ ...prev, jobTitle: prevData.jobTitle }));
    } else if (field === 'departmentId' && prevData.departmentId) {
      setFormData(prev => ({ ...prev, departmentId: prevData.departmentId || '' }));
    } else if (field === 'salary' && prevData.salary) {
      setFormData(prev => ({ ...prev, salary: prevData.salary }));
    }
  };

  const getDepartmentName = (id: string | null) => {
    if (!id) return 'N/A';
    return departments.find(d => d.id === id)?.name || 'Unknown';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            {isEditing ? 'Edit Career Record' : 'Add Career Record'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the career movement details' 
              : 'Record a new career movement for this employee'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          {/* Movement Type - Button Group */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Movement Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {availableMovementTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleChange('movementType', type.value)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                    formData.movementType === type.value
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Effective Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Effective Date
            </label>
            <input
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => handleChange('effectiveDate', e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          {/* Job Title - conditionally shown */}
          {currentFields.jobTitle && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Job Title
                </label>
                <div className="flex gap-1">
                  {prevData?.jobTitle && !isEditing && (
                    <button
                      type="button"
                      onClick={() => handleCopyFromPrevious('jobTitle')}
                      className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                      title="Copy from previous"
                    >
                      <Copy className="h-3 w-3" />
                      Use current
                    </button>
                  )}
                  {formData.jobTitle && (
                    <button
                      type="button"
                      onClick={() => handleClear('jobTitle')}
                      className="text-xs text-slate-400 hover:text-red-500 ml-2"
                      title="Clear"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => handleChange('jobTitle', e.target.value)}
                placeholder="e.g., Senior Developer"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
              {prevData?.jobTitle && (
                <p className="text-xs text-slate-400 mt-1">
                  Current: {prevData.jobTitle}
                </p>
              )}
            </div>
          )}

          {/* Department - conditionally shown */}
          {currentFields.department && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Department
                </label>
                <div className="flex gap-1">
                  {prevData?.departmentId && !isEditing && (
                    <button
                      type="button"
                      onClick={() => handleCopyFromPrevious('departmentId')}
                      className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                      title="Copy from previous"
                    >
                      <Copy className="h-3 w-3" />
                      Use current
                    </button>
                  )}
                  {formData.departmentId && (
                    <button
                      type="button"
                      onClick={() => handleClear('departmentId')}
                      className="text-xs text-slate-400 hover:text-red-500 ml-2"
                      title="Clear"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <select
                value={formData.departmentId}
                onChange={(e) => handleChange('departmentId', e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              {prevData?.departmentId && (
                <p className="text-xs text-slate-400 mt-1">
                  Current: {getDepartmentName(prevData.departmentId)}
                </p>
              )}
            </div>
          )}

          {/* Salary */}
          {currentFields.salary && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Monthly Salary
                </label>
                <div className="flex gap-1">
                  {prevData?.salary && !isEditing && (
                    <button
                      type="button"
                      onClick={() => handleCopyFromPrevious('salary')}
                      className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                      title="Copy from previous"
                    >
                      <Copy className="h-3 w-3" />
                      Use current
                    </button>
                  )}
                  {formData.salary > 0 && (
                    <button
                      type="button"
                      onClick={() => handleClear('salary')}
                      className="text-xs text-slate-400 hover:text-red-500 ml-2"
                      title="Clear"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₱</span>
                <input
                  type="number"
                  value={formData.salary || ''}
                  onChange={(e) => handleChange('salary', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  step="1"
                  className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
              {prevData?.salary && (
                <p className="text-xs text-slate-400 mt-1">
                  Current: ₱{prevData.salary.toLocaleString()}
                  {formData.salary > 0 && formData.salary !== prevData.salary && (
                    <span className={formData.salary > prevData.salary ? 'text-green-600 ml-1' : 'text-red-500 ml-1'}>
                      ({formData.salary > prevData.salary ? '+' : ''}₱{(formData.salary - prevData.salary).toLocaleString()})
                    </span>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Info box for salary adjustment */}
          {formData.movementType === 'salary_adjustment' && prevData && (
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700">
              Job title and department will remain unchanged.
            </div>
          )}

          {/* Remarks */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Remarks <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              {formData.remarks && (
                <button
                  type="button"
                  onClick={() => handleClear('remarks')}
                  className="text-xs text-slate-400 hover:text-red-500"
                  title="Clear"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <textarea
              value={formData.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
              placeholder="Reason or notes..."
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-4 w-4" />
                  {isEditing ? 'Update' : 'Save'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
