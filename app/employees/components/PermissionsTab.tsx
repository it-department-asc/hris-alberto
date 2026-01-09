'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  Eye, 
  Edit3, 
  Ban,
  Loader2,
  Save,
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CalendarDays,
  Wallet,
  Settings,
  Network,
  Bot,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserDocument, ModulePermission, PermissionLevel, ModuleName } from '@/types';
import { 
  subscribeToUserPermissions, 
  setUserPermissions,
  getDefaultPermissions,
  ALL_MODULES,
} from '@/lib/firebase/permissions';
import toast from 'react-hot-toast';

interface PermissionsTabProps {
  employee: UserDocument;
  currentUserId: string;
  canEdit: boolean;
}

const moduleIcons: Record<ModuleName, typeof Shield> = {
  dashboard: LayoutDashboard,
  employees: Users,
  departments: Building2,
  attendance: Clock,
  leave: CalendarDays,
  payroll: Wallet,
  organization: Briefcase,
  'org-chart': Network,
  settings: Settings,
  'policy-advisor': Bot,
};

const permissionOptions: { value: PermissionLevel; label: string; icon: typeof Shield; color: string }[] = [
  { value: 'none', label: 'No Access', icon: Ban, color: 'text-slate-400 bg-slate-100' },
  { value: 'view', label: 'View Only', icon: Eye, color: 'text-blue-600 bg-blue-100' },
  { value: 'edit', label: 'Full Access', icon: Edit3, color: 'text-green-600 bg-green-100' },
];

export function PermissionsTab({ employee, currentUserId, canEdit }: PermissionsTabProps) {
  const [permissions, setPermissions] = useState<ModulePermission[]>(getDefaultPermissions());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalPermissions, setOriginalPermissions] = useState<ModulePermission[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToUserPermissions(employee.uid, (data) => {
      const perms = data?.permissions || getDefaultPermissions();
      setPermissions(perms);
      setOriginalPermissions(perms);
      setHasChanges(false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [employee.uid]);

  const handlePermissionChange = (moduleName: ModuleName, level: PermissionLevel) => {
    setPermissions(prev => {
      const updated = prev.map(p => 
        p.module === moduleName ? { ...p, level } : p
      );
      setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalPermissions));
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await setUserPermissions(employee.uid, permissions, currentUserId);
      toast.success('Permissions saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPermissions(originalPermissions);
    setHasChanges(false);
  };

  const getPermissionLevel = (moduleName: ModuleName): PermissionLevel => {
    const perm = permissions.find(p => p.module === moduleName);
    return perm?.level || 'none';
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
            <Shield className="h-4 w-4 text-blue-500" />
            Module Permissions
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Control what this employee can access in the system
          </p>
        </div>
        {canEdit && hasChanges && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleReset} disabled={saving}>
              Reset
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Permissions Grid */}
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
          <div className="grid grid-cols-4 gap-4 text-xs font-medium text-slate-600">
            <div className="col-span-1">Module</div>
            <div className="col-span-3 grid grid-cols-3 gap-2 text-center">
              {permissionOptions.map(opt => (
                <div key={opt.value} className="flex items-center justify-center gap-1">
                  <opt.icon className="h-3 w-3" />
                  {opt.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {ALL_MODULES.map(module => {
            const Icon = moduleIcons[module.name] || Shield;
            const currentLevel = getPermissionLevel(module.name);

            return (
              <div key={module.name} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="col-span-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100">
                        <Icon className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{module.label}</p>
                        <p className="text-xs text-slate-500 hidden sm:block">{module.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 grid grid-cols-3 gap-2">
                    {permissionOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => canEdit && handlePermissionChange(module.name, opt.value)}
                        disabled={!canEdit}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          currentLevel === opt.value
                            ? opt.color + ' ring-2 ring-offset-1 ring-current'
                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                        } ${!canEdit ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      >
                        <opt.icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
        <p className="text-xs text-slate-500 font-medium mb-2">Permission Levels:</p>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Ban className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-600"><strong>No Access:</strong> Cannot view or edit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-slate-600"><strong>View Only:</strong> Can view but not edit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Edit3 className="h-3.5 w-3.5 text-green-500" />
            <span className="text-slate-600"><strong>Full Access:</strong> Can view and edit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
