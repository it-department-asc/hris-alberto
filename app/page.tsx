'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  Users,
  Clock,
  CalendarPlus,
  Newspaper,
  Shield,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Complete employee profiles, documents, and organizational hierarchy management.',
      color: 'blue',
    },
    {
      icon: Clock,
      title: 'Time & Attendance',
      description: 'Track working hours, overtime, and attendance with automated calculations.',
      color: 'emerald',
    },
    {
      icon: CalendarPlus,
      title: 'Leave Management',
      description: 'Streamlined leave requests, approvals, and balance tracking.',
      color: 'violet',
    },
    {
      icon: Newspaper,
      title: 'Payroll Processing',
      description: 'Automated payroll with Philippine government compliance (SSS, PhilHealth, Pag-IBIG).',
      color: 'amber',
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Secure access control with customizable permissions for different roles.',
      color: 'rose',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Comprehensive reporting and insights for informed decision-making.',
      color: 'cyan',
    },
  ];

  const benefits = [
    'Reduce HR administrative tasks by 60%',
    'Real-time employee data and analytics',
    'Secure cloud-based platform',
    'Mobile-friendly interface',
    'Automated compliance calculations',
    '24/7 customer support',
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">HRIS Central</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-violet-400/20 to-purple-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
              <Sparkles className="h-4 w-4" />
              <span>Trusted by 500+ companies in the Philippines</span>
            </div>
            <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Modern HR Management{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">
              Streamline your HR operations with our comprehensive Human Resource
              Information System. Manage employees, payroll, attendance, and leaves —
              all in one powerful platform.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-2xl hover:shadow-blue-500/30"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative mt-20">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-slate-700 bg-slate-800 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8">
                <div className="grid grid-cols-4 gap-4">
                  {/* Sidebar Preview */}
                  <div className="col-span-1 space-y-2">
                    {['Dashboard', 'Employees', 'Attendance', 'Payroll'].map((item, i) => (
                      <div
                        key={item}
                        className={`rounded-lg px-4 py-2.5 text-sm ${
                          i === 0
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                            : 'text-slate-400'
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  {/* Content Preview */}
                  <div className="col-span-3 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Total Employees', value: '1,234' },
                        { label: 'Present Today', value: '1,180' },
                        { label: 'On Leave', value: '54' },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-xl bg-slate-800 p-4"
                        >
                          <p className="text-xs text-slate-400">{stat.label}</p>
                          <p className="mt-1 text-2xl font-bold text-white">
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="h-32 rounded-xl bg-slate-800" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 h-20 w-3/4 -translate-x-1/2 rounded-2xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur-2xl" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Everything you need to manage your workforce
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              A complete suite of HR tools designed for Philippine businesses
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              const colorClasses: Record<string, string> = {
                blue: 'bg-blue-100 text-blue-600',
                emerald: 'bg-emerald-100 text-emerald-600',
                violet: 'bg-violet-100 text-violet-600',
                amber: 'bg-amber-100 text-amber-600',
                rose: 'bg-rose-100 text-rose-600',
                cyan: 'bg-cyan-100 text-cyan-600',
              };

              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-slate-300 hover:shadow-lg"
                >
                  <div
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${
                      colorClasses[feature.color]
                    }`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Why choose HRIS Central?
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Join hundreds of Philippine companies that trust us with their HR
                operations. Our platform is built specifically for local business needs.
              </p>
              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-emerald-500" />
                    <span className="text-slate-700">{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Start your free trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-xl">
                <div className="space-y-6">
                  {[
                    { label: 'Employees Managed', value: '50,000+' },
                    { label: 'Companies Trust Us', value: '500+' },
                    { label: 'Uptime Guarantee', value: '99.9%' },
                    { label: 'Customer Satisfaction', value: '98%' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                    >
                      <span className="text-slate-600">{stat.label}</span>
                      <span className="text-2xl font-bold text-slate-900">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to transform your HR operations?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Start your 14-day free trial. No credit card required.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-xl transition-all hover:bg-blue-50"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/30 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">HRIS Central</span>
            </div>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} HRIS Central. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
