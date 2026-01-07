'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import {
  Bell,
  Lock,
  Globe,
  Moon,
  Eye,
  Smartphone,
  Mail,
  Shield,
  Save,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

function SettingsContent() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    leaveApprovals: true,
    payslips: true,
    announcements: false,
  });

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-slate-500">Manage your account preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <nav className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            {[
              { icon: Bell, label: 'Notifications', active: true },
              { icon: Lock, label: 'Security', active: false },
              { icon: Globe, label: 'Language & Region', active: false },
              { icon: Moon, label: 'Appearance', active: false },
              { icon: Eye, label: 'Privacy', active: false },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition-colors ${
                    item.active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notifications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-blue-100 p-2">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                <p className="text-sm text-slate-500">Configure how you receive notifications</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900">Email Notifications</p>
                    <p className="text-sm text-slate-500">Receive notifications via email</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifications.email ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                      notifications.email ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900">Push Notifications</p>
                    <p className="text-sm text-slate-500">Receive push notifications on your device</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifications.push ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                      notifications.push ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Notification Types */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h4 className="font-medium text-slate-900 mb-4">Notify me about</h4>
              <div className="space-y-3">
                {[
                  { key: 'leaveApprovals', label: 'Leave request approvals' },
                  { key: 'payslips', label: 'New payslips available' },
                  { key: 'announcements', label: 'Company announcements' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[item.key as keyof typeof notifications]}
                      onChange={() =>
                        setNotifications({
                          ...notifications,
                          [item.key]: !notifications[item.key as keyof typeof notifications],
                        })
                      }
                      className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-emerald-100 p-2">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Security</h3>
                <p className="text-sm text-slate-500">Manage your account security</p>
              </div>
            </div>

            <div className="space-y-4">
              <button className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900">Change Password</p>
                    <p className="text-sm text-slate-500">Update your password regularly</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </button>

              <button className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-500">Add an extra layer of security</p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  Not enabled
                </span>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl">
              <Save className="h-5 w-5" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}
