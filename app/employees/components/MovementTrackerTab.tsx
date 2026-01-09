'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowRightLeft,
  Banknote,
  Briefcase,
  Edit3,
  Trash2,
  Loader2,
  Building2,
  User,
  Clock,
  Calendar,
} from 'lucide-react';
import { getUserProfile } from '@/lib/firebase/users';
import { CareerMovement, MovementType, UserDocument, Department } from '@/types';
import {
  getEmployeeCareerMovements,
  createCareerMovement,
  updateCareerMovement,
  deleteCareerMovement,
} from '@/lib/firebase/career-movements';
import { CareerMovementModal, CareerMovementFormData } from './CareerMovementModal';
import { useConfirm } from '@/hooks/use-confirm';
import toast from 'react-hot-toast';

interface MovementTrackerTabProps {
  employee: UserDocument;
  departments: Department[];
  currentUserId: string;
  canEdit: boolean;
  onEmployeeUpdate?: () => void;
}

const movementTypeConfig: Record<MovementType, { icon: typeof TrendingUp; color: string; bgColor: string; label: string }> = {
  hire: { icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Hired' },
  promotion: { icon: ArrowUpRight, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Promotion' },
  transfer: { icon: ArrowRightLeft, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'Transfer' },
  salary_adjustment: { icon: Banknote, color: 'text-amber-600', bgColor: 'bg-amber-100', label: 'Salary Adjustment' },
  demotion: { icon: TrendingUp, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Demotion' },
  regularization: { icon: Briefcase, color: 'text-teal-600', bgColor: 'bg-teal-100', label: 'Regularization' },
};

export function MovementTrackerTab({
  employee,
  departments,
  currentUserId,
  canEdit,
  onEmployeeUpdate,
}: MovementTrackerTabProps) {
  const [movements, setMovements] = useState<CareerMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<CareerMovement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [userCache, setUserCache] = useState<Record<string, string>>({});

  const [DeleteConfirmDialog, confirmDelete] = useConfirm(
    'Delete Career Record',
    'Are you sure you want to delete this career record? This action cannot be undone.'
  );

  // Calculate tenure from hire date
  const tenure = useMemo(() => {
    if (!employee.hireDate) return null;

    const hireDate = new Date(employee.hireDate);
    const now = new Date();

    let years = now.getFullYear() - hireDate.getFullYear();
    let months = now.getMonth() - hireDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    if (now.getDate() < hireDate.getDate()) {
      months--;
      if (months < 0) {
        years--;
        months += 12;
      }
    }

    const parts: string[] = [];
    if (years > 0) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} mo${months > 1 ? 's' : ''}`);
    if (parts.length === 0) parts.push('< 1 mo');

    return parts.join(' ');
  }, [employee.hireDate]);

  // Fetch user names for createdBy/updatedBy
  const fetchUserName = useCallback(async (userId: string) => {
    if (!userId || userCache[userId]) return;
    try {
      const user = await getUserProfile(userId);
      if (user) {
        setUserCache(prev => ({
          ...prev,
          [userId]: user.displayName || `${user.firstName} ${user.lastName}`.trim() || 'Unknown'
        }));
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }, [userCache]);

  useEffect(() => {
    loadMovements();
  }, [employee.uid]);

  // Fetch user names for all movements
  useEffect(() => {
    const userIds = new Set<string>();
    movements.forEach(m => {
      if (m.createdBy) userIds.add(m.createdBy);
      if (m.updatedBy) userIds.add(m.updatedBy);
    });
    userIds.forEach(id => fetchUserName(id));
  }, [movements, fetchUserName]);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const data = await getEmployeeCareerMovements(employee.uid);
      setMovements(data);
    } catch (error) {
      console.error('Error loading career movements:', error);
      toast.error('Failed to load career history');
    } finally {
      setLoading(false);
    }
  };

  // Create a virtual "hire" record from employee's hire date
  const hireRecord = useMemo(() => {
    if (!employee.hireDate) return null;
    return {
      id: 'hire-record',
      employeeId: employee.uid,
      movementType: 'hire' as MovementType,
      effectiveDate: new Date(employee.hireDate),
      jobTitle: employee.jobTitle || 'Initial Position',
      departmentId: employee.departmentId || null,
      salary: 0, // We don't know initial salary
      createdAt: new Date(employee.hireDate),
      createdBy: '',
      isVirtual: true, // Mark as virtual record
    };
  }, [employee.hireDate, employee.uid, employee.jobTitle, employee.departmentId]);

  // Combine movements with hire record
  const allRecords = useMemo(() => {
    const records = [...movements];

    // Add hire record if exists and there's no existing hire movement
    if (hireRecord && !movements.some(m => m.movementType === 'hire')) {
      records.push(hireRecord as CareerMovement);
    }

    // Sort by effective date descending
    return records.sort((a, b) =>
      new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
    );
  }, [movements, hireRecord]);

  // Get the latest real movement (not virtual) for form pre-fill
  const latestMovement = useMemo(() => {
    return movements.length > 0 ? movements[0] : null;
  }, [movements]);

  const handleAddRecord = () => {
    setSelectedMovement(null);
    setIsAddingNew(true);
    setIsModalOpen(true);
  };

  const handleEditRecord = (movement: CareerMovement) => {
    // Can't edit virtual hire record
    if ((movement as any).isVirtual) return;
    setSelectedMovement(movement);
    setIsAddingNew(false);
    setIsModalOpen(true);
  };

  const handleDeleteRecord = async (movement: CareerMovement) => {
    // Can't delete virtual hire record
    if ((movement as any).isVirtual) return;

    const confirmed = await confirmDelete();
    if (!confirmed) return;

    try {
      await deleteCareerMovement(movement.id);
      toast.success('Career record deleted');
      await loadMovements();
      onEmployeeUpdate?.();
    } catch (error) {
      console.error('Error deleting career movement:', error);
      toast.error('Failed to delete record');
    }
  };

  const handleSaveMovement = async (formData: CareerMovementFormData) => {
    try {
      setIsSaving(true);

      if (selectedMovement) {
        // Update existing
        await updateCareerMovement(
          selectedMovement.id,
          {
            movementType: formData.movementType,
            effectiveDate: new Date(formData.effectiveDate),
            jobTitle: formData.jobTitle,
            departmentId: formData.departmentId || null,
            salary: formData.salary,
            remarks: formData.remarks,
          },
          currentUserId
        );
        toast.success('Career record updated');
      } else {
        // Create new
        await createCareerMovement(
          {
            employeeId: employee.uid,
            movementType: formData.movementType,
            effectiveDate: new Date(formData.effectiveDate),
            jobTitle: formData.jobTitle,
            departmentId: formData.departmentId || null,
            salary: formData.salary,
            previousJobTitle: latestMovement?.jobTitle,
            previousDepartmentId: latestMovement?.departmentId,
            previousSalary: latestMovement?.salary,
            remarks: formData.remarks,
          },
          currentUserId
        );
        toast.success('Career record added');
      }

      setIsModalOpen(false);
      setIsAddingNew(false);
      await loadMovements();
      onEmployeeUpdate?.();
    } catch (error) {
      console.error('Error saving career movement:', error);
      toast.error('Failed to save record');
    } finally {
      setIsSaving(false);
    }
  };

  const getDepartmentName = (departmentId: string | null) => {
    if (!departmentId) return 'N/A';
    const dept = departments.find(d => d.id === departmentId);
    return dept?.name || 'Unknown';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            Career Timeline
          </h3>
          {employee.hireDate && (
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              <span>
                Hired{' '}
                <span className="font-medium text-slate-700">
                  {new Date(employee.hireDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                {tenure && (
                  <span className="ml-1 text-blue-600 font-medium">• {tenure}</span>
                )}
              </span>
            </div>
          )}
        </div>
        {canEdit && (
          <Button size="sm" onClick={handleAddRecord}>
            <Plus className="h-4 w-4 mr-1" />
            Add Record
          </Button>
        )}
      </div>

      {/* Timeline */}
      {allRecords.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />

          <div className="space-y-0">
            {allRecords.map((record, index) => {
              const config = movementTypeConfig[record.movementType] || movementTypeConfig.hire;
              const Icon = config.icon;
              const isLatest = index === 0;
              const isVirtual = (record as any).isVirtual;

              return (
                <div key={record.id} className="relative pl-10 pb-6">
                  {/* Timeline dot */}
                  <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${isLatest ? 'bg-blue-500 ring-4 ring-blue-100' : config.bgColor
                    }`}>
                    <Icon className={`h-4 w-4 ${isLatest ? 'text-white' : config.color}`} />
                  </div>

                  {/* Content Card */}
                  <div className={`rounded-lg border p-4 ${isLatest
                    ? 'bg-blue-50 border-blue-200'
                    : isVirtual
                      ? 'bg-slate-50 border-dashed border-slate-300'
                      : 'bg-white border-slate-200'
                    }`}>
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isLatest ? 'bg-blue-500 text-white' : `${config.bgColor} ${config.color}`
                          }`}>
                          {config.label}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(record.effectiveDate)}
                        </span>
                        {isLatest && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                            Current
                          </span>
                        )}
                        {isVirtual && (
                          <span className="text-xs text-slate-400">(from hire date)</span>
                        )}
                      </div>

                      {/* Actions - only for non-virtual records */}
                      {canEdit && !isVirtual && (
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => handleEditRecord(record)}
                            className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-blue-50"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record)}
                            className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Job Title */}
                    <p className="text-sm font-medium text-slate-900 mt-2">
                      {record.jobTitle}
                    </p>

                    {/* Details row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {getDepartmentName(record.departmentId)}
                      </span>
                      {record.salary > 0 && (
                        <span className="flex items-center gap-1">
                          <Banknote className="h-3 w-3" />
                          ₱{record.salary.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Compact change summary for non-hire movements */}
                    {record.movementType !== 'hire' && (record.previousJobTitle || record.previousDepartmentId || record.previousSalary) && (
                      <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className='flex flex-col gap-1'>

                            {/* Role change */}
                            {record.previousJobTitle && record.jobTitle && record.previousJobTitle !== record.jobTitle && (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">Role:</span>
                                <span className="font-medium text-slate-700">{record.previousJobTitle}</span>
                                <span className="text-slate-300">→</span>
                                <span className="font-medium text-slate-900">{record.jobTitle}</span>
                              </div>
                            )}

                            {/* Department change (show only if department changed) */}
                            {record.previousDepartmentId && record.departmentId && record.previousDepartmentId !== record.departmentId && (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">Dept:</span>
                                <span className="font-medium text-slate-700">{getDepartmentName(record.previousDepartmentId)}</span>
                                <span className="text-slate-300">→</span>
                                <span className="font-medium text-slate-900">{getDepartmentName(record.departmentId)}</span>
                              </div>
                            )}

                            {/* Salary change */}
                            {record.previousSalary && record.salary && record.previousSalary !== record.salary && (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">Salary:</span>
                                <span className="font-medium text-slate-700">₱{record.previousSalary.toLocaleString()}</span>
                                <span className="text-slate-300">→</span>
                                <span className="font-medium text-slate-900">₱{record.salary.toLocaleString()}</span>
                                <span className={`ml-2 text-xs font-semibold ${record.salary - record.previousSalary >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {record.salary - record.previousSalary >= 0 ? '+' : '-'}₱{Math.abs(record.salary - record.previousSalary).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Salary change - for salary adjustments show concise change + delta */}
                          {/* {record.previousSalary !== undefined && record.previousSalary !== null && record.movementType === 'salary_adjustment' && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Salary:</span>
                              <span className="font-medium text-slate-700">₱{record.previousSalary.toLocaleString()}</span>
                              <span className="text-slate-300">→</span>
                              <span className="font-medium text-slate-900">₱{record.salary.toLocaleString()}</span>
                              <span className={`ml-2 text-xs font-semibold ${record.salary - record.previousSalary >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {record.salary - record.previousSalary >= 0 ? '+' : '-'}₱{Math.abs(record.salary - record.previousSalary).toLocaleString()}
                              </span>
                            </div>
                          )} */}

                          {/* Fallback - if only previousJobTitle exists but no change detectable, show simple label */}
                          {(!record.previousJobTitle && !record.previousDepartmentId && record.previousSalary && record.movementType !== 'salary_adjustment') && (
                            <div className="text-slate-500">(prior values recorded)</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Remarks */}
                    {record.remarks && (
                      <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <span className="text-slate-400">Remarks:</span>
                        <p className="mt-2 text-xs text-slate-500 italic">
                          "{record.remarks}"
                        </p>
                      </div>
                    )}

                    {/* Created/Updated by - only for non-virtual records */}
                    {!isVirtual && (record.createdBy || record.updatedBy) && (
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] text-slate-400">
                        <User className="h-3 w-3" />
                        {record.updatedBy && record.updatedAt ? (
                          <span>
                            Updated by <span className="font-medium text-slate-500">{userCache[record.updatedBy] || 'Loading...'}</span>
                            {' '}on {formatDate(record.updatedAt)}
                          </span>
                        ) : record.createdBy ? (
                          <span>
                            Added by <span className="font-medium text-slate-500">{userCache[record.createdBy] || 'Loading...'}</span>
                            {' '}on {formatDate(record.createdAt)}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <TrendingUp className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-500">No career records yet</p>
          {canEdit && (
            <p className="text-xs text-slate-400 mt-1">Add a movement to start tracking career progression</p>
          )}
        </div>
      )}

      {/* Career Movement Modal */}
      <CareerMovementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsAddingNew(false);
        }}
        onSave={handleSaveMovement}
        movement={selectedMovement}
        departments={departments}
        isLoading={isSaving}
        isAddingNew={isAddingNew}
        latestMovement={latestMovement}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog />
    </div>
  );
}
