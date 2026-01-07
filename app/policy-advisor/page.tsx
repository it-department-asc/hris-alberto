'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout';
import { BrainCircuit, Send, Sparkles, BookOpen, Scale, FileText } from 'lucide-react';
import { useState } from 'react';

function PolicyAdvisorContent() {
  const [query, setQuery] = useState('');

  const suggestedQuestions = [
    'What are the required leave benefits under Philippine law?',
    'How do I calculate SSS contributions for employees?',
    'What are the rules for overtime pay?',
    'How many hours is the standard work week in the Philippines?',
    'What are the mandatory 13th month pay requirements?',
    'What are the rules for night shift differential?',
  ];

  const recentQueries = [
    {
      question: 'What is the minimum wage in NCR?',
      answer: 'As of 2025, the minimum wage in NCR for non-agriculture sector is ₱610 per day...',
      time: '2 hours ago',
    },
    {
      question: 'How do I compute PhilHealth contributions?',
      answer: 'PhilHealth contributions are computed based on the employee\'s monthly salary using the 2024 contribution table...',
      time: '1 day ago',
    },
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">AI Policy Advisor</h1>
        <p className="mt-1 text-slate-500">
          Get instant answers about HR policies and Philippine labor laws
        </p>
      </div>

      {/* Main Chat Area */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Chat Input */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                <BrainCircuit className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-slate-900">Ask the AI Policy Advisor</h2>
                <p className="mt-1 text-sm text-slate-500">
                  I can help you with HR policies, labor laws, and compliance questions
                </p>
                <div className="mt-4 relative">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type your question here..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 pr-12 text-slate-900 placeholder-slate-400 resize-none focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                  <button className="absolute bottom-4 right-4 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 p-2 text-white shadow-lg transition-all hover:shadow-xl">
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Suggested Questions */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-slate-900">Suggested Questions</h3>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => setQuery(question)}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-sm text-slate-700 transition-all hover:border-violet-200 hover:bg-violet-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Queries */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Recent Queries</h3>
            <div className="space-y-4">
              {recentQueries.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">{item.question}</p>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{item.answer}</p>
                  <p className="mt-2 text-xs text-slate-400">{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Resources */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Quick Resources</h3>
            <div className="space-y-3">
              {[
                { icon: BookOpen, label: 'Labor Code of the Philippines', color: 'blue' },
                { icon: Scale, label: 'DOLE Guidelines', color: 'emerald' },
                { icon: FileText, label: 'Company Handbook', color: 'violet' },
              ].map((resource) => {
                const Icon = resource.icon;
                return (
                  <button
                    key={resource.label}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-left transition-all hover:bg-slate-100"
                  >
                    <div
                      className={`rounded-lg p-2 ${
                        resource.color === 'blue'
                          ? 'bg-blue-100 text-blue-600'
                          : resource.color === 'emerald'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-violet-100 text-violet-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{resource.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Card */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 text-white">
            <BrainCircuit className="h-8 w-8 mb-4" />
            <h3 className="font-semibold mb-2">Powered by AI</h3>
            <p className="text-sm text-violet-100">
              Our AI advisor is trained on Philippine labor laws, DOLE guidelines, and HR best
              practices to give you accurate and helpful answers.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function PolicyAdvisorPage() {
  return (
    <AuthGuard>
      <PolicyAdvisorContent />
    </AuthGuard>
  );
}
