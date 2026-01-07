'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/lib/firebase/users';
import { getDepartments } from '@/lib/firebase/departments';
import { UserDocument, Department } from '@/types';
import {
  User,
  Camera,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Calendar,
  Shield,
  Save,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

function ProfileContent() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    personalEmail: '',
    mobileNumber: '',
    telephoneNumber: '',
    presentAddress: '',
    permanentAddress: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactNumber: '',
    bio: '',
    employeeId: '',
    departmentId: '',
  });

  useEffect(() => {
    if (authUser?.uid) {
      fetchUserProfile();
      fetchDepartments();
    }
  }, [authUser?.uid]);

  const fetchUserProfile = async () => {
    if (!authUser?.uid) return;

    try {
      setLoading(true);
      const userProfile = await getUserProfile(authUser.uid);
      if (userProfile) {
        setProfile(userProfile);
        // Initialize form data
        setFormData({
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          middleName: userProfile.middleName || '',
          personalEmail: userProfile.personalEmail || '',
          mobileNumber: userProfile.mobileNumber || '',
          telephoneNumber: userProfile.telephoneNumber || '',
          presentAddress: userProfile.presentAddress || '',
          permanentAddress: userProfile.permanentAddress || '',
          emergencyContactName: userProfile.emergencyContactName || '',
          emergencyContactRelationship: userProfile.emergencyContactRelationship || '',
          emergencyContactNumber: userProfile.emergencyContactNumber || '',
          bio: userProfile.bio || '',
          employeeId: userProfile.employeeId || '',
          departmentId: userProfile.departmentId || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const deptList = await getDepartments();
      setDepartments(deptList);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!authUser?.uid || !profile) return;

    try {
      setSaving(true);
      setSaveSuccess(false);

      const updates: Partial<UserDocument> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        personalEmail: formData.personalEmail || undefined,
        mobileNumber: formData.mobileNumber || undefined,
        telephoneNumber: formData.telephoneNumber || undefined,
        presentAddress: formData.presentAddress || undefined,
        permanentAddress: formData.permanentAddress || undefined,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactRelationship: formData.emergencyContactRelationship || undefined,
        emergencyContactNumber: formData.emergencyContactNumber || undefined,
        bio: formData.bio || undefined,
        employeeId: formData.employeeId || null,
        departmentId: formData.departmentId || null,
        displayName: `${formData.firstName} ${formData.lastName}`.trim(),
      };

      await updateUserProfile(authUser.uid, updates);

      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...updates } : null);

      // The AuthContext will automatically update when Firestore document changes
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  // Parse display name for initials
  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <span className="ml-2 text-slate-500">Loading profile...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Profile not found</h3>
          <p className="text-slate-500">Unable to load your profile information.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-slate-500">Manage your personal information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-bold text-white">
                  {getInitials(profile.displayName)}
                </div>
                <button className="absolute bottom-0 right-0 rounded-full bg-white p-2 shadow-lg border border-slate-200 hover:bg-slate-50">
                  <Camera className="h-4 w-4 text-slate-600" />
                </button>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                {profile.displayName || 'User'}
              </h2>
              <p className="text-slate-500">
                {profile.positionId ? 'Position Title' : 'Employee'}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                    profile.role === 'admin'
                      ? 'bg-violet-100 text-violet-700'
                      : profile.role === 'hr'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  <Shield className="h-3 w-3" />
                  {profile.role?.toUpperCase() || 'EMPLOYEE'}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="h-5 w-5 text-slate-400" />
                <span className="text-sm">{profile.email}</span>
              </div>
              {profile.mobileNumber && (
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="h-5 w-5 text-slate-400" />
                  <span className="text-sm">{profile.mobileNumber}</span>
                </div>
              )}
              {profile.presentAddress && (
                <div className="flex items-center gap-3 text-slate-600">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <span className="text-sm">{profile.presentAddress}</span>
                </div>
              )}
              {profile.departmentId && (
                <div className="flex items-center gap-3 text-slate-600">
                  <Building2 className="h-5 w-5 text-slate-400" />
                  <span className="text-sm">
                    Department: {departments.find(d => d.id === profile.departmentId)?.name || profile.departmentId}
                  </span>
                </div>
              )}
              {profile.hireDate && (
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar className="h-5 w-5 text-slate-400" />
                  <span className="text-sm">
                    Joined {profile.hireDate.toLocaleDateString()}
                  </span>
                </div>
              )}
              {profile.employeeId && (
                <div className="flex items-center gap-3 text-slate-600">
                  <Briefcase className="h-5 w-5 text-slate-400" />
                  <span className="text-sm">Employee ID: {profile.employeeId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Personal Information</h3>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Middle Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange('middleName', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Personal Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.personalEmail}
                  onChange={(e) => handleInputChange('personalEmail', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Telephone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.telephoneNumber}
                  onChange={(e) => handleInputChange('telephoneNumber', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Present Address
                </label>
                <input
                  type="text"
                  value={formData.presentAddress}
                  onChange={(e) => handleInputChange('presentAddress', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Permanent Address (Optional)
                </label>
                <input
                  type="text"
                  value={formData.permanentAddress}
                  onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bio (Optional)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Employment Information</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    placeholder="Enter employee ID"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Department
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => handleInputChange('departmentId', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Emergency Contact</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    placeholder="Full name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactRelationship}
                    onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                    placeholder="e.g., Spouse, Parent"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContactNumber}
                    onChange={(e) => handleInputChange('emergencyContactNumber', e.target.value)}
                    placeholder="Phone number"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              {saveSuccess && (
                <div className="mr-4 flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Profile updated successfully!</span>
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
