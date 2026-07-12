"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
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
import { getMaintenanceLogs, deleteMaintenanceLog } from "@/lib/services/maintenance.service";
import { formatCurrency } from "@/lib/utils";
import type { MaintenanceLog } from "@/types";

const maintenanceTypes = ["", "engine", "transmission", "brakes", "tires", "electrical", "body", "inspection", "other"];
const statusFilters = ["", "open", "closed"];

const statusVariant: Record<string, "success" | "secondary" | "warning" | "outline" | "destructive"> = {
  open: "warning",
  closed: "success",
};

export default function MaintenancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const typeFilter = searchParams.get("type") || "";
  const statusFilter = searchParams.get("status") || "";
  const page = Number(searchParams.get("page") || "1");

  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
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
      router.push(`/maintenance?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await getMaintenanceLogs({
          search: search || undefined,
          type: typeFilter || undefined,
          status: statusFilter || undefined,
          page,
        });
        setLogs(result.data);
        setCount(result.count);
        setPageCount(result.pageCount);
      } catch (err) {
        console.error("Failed to load maintenance logs", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [search, typeFilter, statusFilter, page]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteMaintenanceLog(deleteId);
      setLogs((prev) => prev.filter((l) => l.id !== deleteId));
      setCount((prev) => prev - 1);
    } catch (err) {
      console.error("Failed to delete maintenance log", err);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  function handleSearch() {
    updateParams({ search: searchInput, page: "1" });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Maintenance Management</h1>
          <p className="text-sm text-muted-foreground">{count} records total</p>
        </div>
        <Link href="/maintenance/new">
          <Button>
            <Plus className="mr-1 h-4 w-4" /> Add Record
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <Input
            placeholder="Search by type or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-64"
          />
          <Button variant="secondary" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <select
          value={typeFilter}
          onChange={(e) => updateParams({ type: e.target.value, page: "1" })}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="">All Types</option>
          {maintenanceTypes.filter(Boolean).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => updateParams({ status: e.target.value, page: "1" })}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="">All Statuses</option>
          {statusFilters.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Status</TableHead>
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
                No maintenance records found.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-mono text-xs">{l.vehicle_id.slice(0, 8)}...</TableCell>
                <TableCell className="capitalize">{l.maintenance_type}</TableCell>
                <TableCell className="max-w-xs truncate">{l.description || "-"}</TableCell>
                <TableCell className="tabular-nums">{l.maintenance_date}</TableCell>
                <TableCell className="tabular-nums">{formatCurrency(l.cost)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[l.status] || "outline"}>
                    {l.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/maintenance/${l.id}`}>
                      <Button variant="ghost" size="icon" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
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
          <DialogTitle>Delete Maintenance Record</DialogTitle>
          <DialogCloseButton onClick={() => setDeleteId(null)} />
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this maintenance record? This action cannot be undone.
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
    </div>
  );
}
