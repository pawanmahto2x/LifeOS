'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportApiService } from '@/features/reports/services/report.service';
import { DashboardStatsGrid } from '@/features/reports/components/dashboard-stats-grid';
import { ReportSummaryCard } from '@/features/reports/components/report-summary-card';
import { ReportType, IReport } from '@/types/report.types';
import { BarChart3, RefreshCw } from 'lucide-react';

const REPORT_TABS: { label: string; value: ReportType }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportType>('weekly');

  const {
    data: dashboardData,
    isLoading: isDashLoading,
    refetch: refetchDash,
  } = useQuery({
    queryKey: ['reports-dashboard'],
    queryFn: async () => {
      const res = await reportApiService.getDashboard();
      return res.data;
    },
  });

  const {
    data: reportResponse,
    isLoading: isReportLoading,
    refetch: refetchReport,
  } = useQuery({
    queryKey: ['report', activeTab],
    queryFn: async () => {
      const res = await reportApiService.getReport(activeTab);
      return res;
    },
  });

  const reportData = reportResponse?.success ? (reportResponse.data as IReport) : null;
  const hasData = reportResponse?.success === true && reportData !== null;

  const handleRefresh = () => {
    void refetchDash();
    void refetchReport();
  };

  return (
    <div className="animate-in fade-in space-y-8 duration-300">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">Reports</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Analytics built entirely from your real activity — zero estimated values.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="border-border hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 self-start rounded-xl border px-3 py-2 text-xs font-medium transition-colors sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Live Dashboard Summary */}
      <section className="space-y-3">
        <h2 className="text-foreground text-sm font-bold tracking-wider uppercase">
          Live Today Overview
        </h2>
        <DashboardStatsGrid data={dashboardData} isLoading={isDashLoading} />
      </section>

      {/* Period Report Tabs */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-foreground text-sm font-bold tracking-wider uppercase">
            Period Reports
          </h2>
          <div className="border-border bg-muted/40 flex items-center gap-1 rounded-xl border p-1">
            {REPORT_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  activeTab === tab.value
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <ReportSummaryCard
          report={reportData}
          isLoading={isReportLoading}
          hasData={hasData}
          type={activeTab}
        />
      </section>
    </div>
  );
}
