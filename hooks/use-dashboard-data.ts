"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDashboardKpis } from "@/services/dashboard.service";
import { getFleetUtilizationByType } from "@/services/vehicles.service";
import { getExpenseBreakdown } from "@/services/expenses.service";
import { getMaintenanceCostByMonth } from "@/services/maintenance.service";
import { getTripStatsByDay } from "@/services/trips.service";
import type { DashboardKpis } from "@/types";

interface DashboardData {
  kpis: DashboardKpis | null;
  utilizationByType: { type: string; utilizationPct: number }[];
  expenseBreakdown: { category: string; amount: number }[];
  maintenanceCostByMonth: { month: string; cost: number }[];
  tripStatsByDay: { date: string; completed: number; cancelled: number; dispatched: number }[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// One hook powering the whole dashboard: fetches every widget's data and
// keeps it live via Supabase Realtime — any insert/update/delete on the
// underlying tables triggers a refetch, so the dashboard never goes stale
// while it's open ("Implement realtime dashboard updates").
export function useDashboardData(): DashboardData {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [utilizationByType, setUtilizationByType] = useState<DashboardData["utilizationByType"]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<DashboardData["expenseBreakdown"]>([]);
  const [maintenanceCostByMonth, setMaintenanceCostByMonth] = useState<DashboardData["maintenanceCostByMonth"]>([]);
  const [tripStatsByDay, setTripStatsByDay] = useState<DashboardData["tripStatsByDay"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [k, u, e, m, t] = await Promise.all([
        getDashboardKpis(),
        getFleetUtilizationByType(),
        getExpenseBreakdown(),
        getMaintenanceCostByMonth(),
        getTripStatsByDay(),
      ]);
      setKpis(k);
      setUtilizationByType(u);
      setExpenseBreakdown(e);
      setMaintenanceCostByMonth(m);
      setTripStatsByDay(t);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();

    const supabase = createClient();
    const tables = ["vehicles", "drivers", "trips", "maintenance_logs", "fuel_logs", "expenses"];

    const channel = supabase.channel("dashboard-realtime");
    tables.forEach((table) => {
      channel.on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table },
        () => fetchAll()
      );
    });
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  return {
    kpis,
    utilizationByType,
    expenseBreakdown,
    maintenanceCostByMonth,
    tripStatsByDay,
    loading,
    error,
    refetch: fetchAll,
  };
}
