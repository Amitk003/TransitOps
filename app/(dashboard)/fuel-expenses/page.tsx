"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Search, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogCloseButton,
} from "@/components/ui/dialog";
import { getFuelLogs, deleteFuelLog } from "@/lib/services/fuel.service";
import { getExpenses, deleteExpense } from "@/lib/services/expenses.service";
import type { FuelLog, Expense } from "@/types";

type Tab = "fuel" | "expenses";

export default function FuelExpensesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = (searchParams.get("tab") || "fuel") as Tab;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam);

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.delete("search");
    params.delete("page");
    router.push(`/fuel-expenses?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Fuel & Expenses</h1>
      </div>

      <div className="flex border-b border-border">
        <button
          onClick={() => switchTab("fuel")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "fuel"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Fuel Logs
        </button>
        <button
          onClick={() => switchTab("expenses")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "expenses"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Other Expenses
        </button>
      </div>

      {activeTab === "fuel" ? <FuelTab /> : <ExpensesTab />}
    </div>
  );
}

function FuelTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page") || "1");

  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [count, setCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState(search);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      router.push(`/fuel-expenses?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await getFuelLogs({
          search: search || undefined,
          page,
        });
        setLogs(result.data);
        setCount(result.count);
        setPageCount(result.pageCount);
      } catch (err) {
        console.error("Failed to load fuel logs", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [search, page]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteFuelLog(deleteId);
      setLogs((prev) => prev.filter((l) => l.id !== deleteId));
      setCount((prev) => prev - 1);
    } catch (err) {
      console.error("Failed to delete fuel log", err);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  function handleSearch() {
    updateParams({ search: searchInput, page: "1" });
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Input
            placeholder="Search station or remarks..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-64"
          />
          <Button variant="secondary" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Link href="/fuel-expenses/ocr">
            <Button variant="secondary">
              <Camera className="mr-1 h-4 w-4" /> Scan Receipt
            </Button>
          </Link>
          <Link href="/fuel-expenses/fuel/new">
            <Button>
              <Plus className="mr-1 h-4 w-4" /> Add Fuel Entry
            </Button>
          </Link>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Liters</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Odometer</TableHead>
            <TableHead>Station</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Loading...
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No fuel logs found.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-mono text-xs">{l.vehicle_id.slice(0, 8)}...</TableCell>
                <TableCell className="tabular-nums">{l.fuel_date}</TableCell>
                <TableCell className="tabular-nums">{Number(l.liters).toLocaleString()}</TableCell>
                <TableCell className="tabular-nums">${Number(l.cost).toLocaleString()}</TableCell>
                <TableCell className="tabular-nums">{Number(l.odometer).toLocaleString()} km</TableCell>
                <TableCell>{l.fuel_station || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/fuel-expenses/fuel/${l.id}`}>
                      <Button variant="ghost" size="icon" aria-label="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete"
                      onClick={() => setDeleteId(l.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateParams({ page: String(page - 1) })}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => updateParams({ page: String(page + 1) })}
          >
            Next
          </Button>
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogHeader>
          <DialogTitle>Delete Fuel Log</DialogTitle>
          <DialogCloseButton onClick={() => setDeleteId(null)} />
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this fuel log? This action cannot be undone.
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

function ExpensesTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const typeFilter = searchParams.get("type") || "";
  const page = Number(searchParams.get("page") || "1");

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [count, setCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState(search);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      router.push(`/fuel-expenses?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await getExpenses({
          search: search || undefined,
          type: typeFilter || undefined,
          page,
        });
        setExpenses(result.data);
        setCount(result.count);
        setPageCount(result.pageCount);
      } catch (err) {
        console.error("Failed to load expenses", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [search, typeFilter, page]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteExpense(deleteId);
      setExpenses((prev) => prev.filter((e) => e.id !== deleteId));
      setCount((prev) => prev - 1);
    } catch (err) {
      console.error("Failed to delete expense", err);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  function handleSearch() {
    updateParams({ search: searchInput, page: "1" });
  }

  const expenseTypes = ["", "toll", "parking", "maintenance", "fuel", "other"];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Input
            placeholder="Search notes or type..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-64"
          />
          <Button variant="secondary" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
          <select
            value={typeFilter}
            onChange={(e) => updateParams({ type: e.target.value, page: "1" })}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="">All Types</option>
            {expenseTypes.filter(Boolean).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <Link href="/fuel-expenses/expense/new">
          <Button>
            <Plus className="mr-1 h-4 w-4" /> Add Expense
          </Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Loading...
              </TableCell>
            </TableRow>
          ) : expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No expenses found.
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-mono text-xs">{e.vehicle_id.slice(0, 8)}...</TableCell>
                <TableCell className="capitalize">{e.expense_type}</TableCell>
                <TableCell className="tabular-nums">${Number(e.amount).toLocaleString()}</TableCell>
                <TableCell className="tabular-nums">{e.expense_date}</TableCell>
                <TableCell className="max-w-xs truncate">{e.notes || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/fuel-expenses/expense/${e.id}`}>
                      <Button variant="ghost" size="icon" aria-label="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete"
                      onClick={() => setDeleteId(e.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateParams({ page: String(page - 1) })}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => updateParams({ page: String(page + 1) })}
          >
            Next
          </Button>
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogHeader>
          <DialogTitle>Delete Expense</DialogTitle>
          <DialogCloseButton onClick={() => setDeleteId(null)} />
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this expense? This action cannot be undone.
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
