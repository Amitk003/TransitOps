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
import { getDrivers, deleteDriver, updateDriverStatus } from "@/lib/services/driver.service";
import type { Driver, DriverStatus } from "@/types";

const statusFilters = ["", "available", "on_trip", "off_duty", "suspended"];

const statusVariant: Record<string, "success" | "secondary" | "warning" | "outline" | "destructive"> = {
  available: "success",
  on_trip: "secondary",
  off_duty: "outline",
  suspended: "destructive",
};

export default function DriversPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const page = Number(searchParams.get("page") || "1");

  const [drivers, setDrivers] = useState<Driver[]>([]);
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
      router.push(`/drivers?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await getDrivers({
          search: search || undefined,
          status: statusFilter || undefined,
          page,
        });
        setDrivers(result.data);
        setCount(result.count);
        setPageCount(result.pageCount);
      } catch (err) {
        console.error("Failed to load drivers", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [search, statusFilter, page]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteDriver(deleteId);
      setDrivers((prev) => prev.filter((d) => d.id !== deleteId));
      setCount((prev) => prev - 1);
    } catch (err) {
      console.error("Failed to delete driver", err);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await updateDriverStatus(id, newStatus);
      setDrivers((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: newStatus as DriverStatus } : d))
      );
    } catch (err) {
      console.error("Failed to update driver status", err);
    }
  }

  function isLicenseExpired(expiryDate: string): boolean {
    return new Date(expiryDate) < new Date();
  }

  function isLicenseExpiringSoon(expiryDate: string): boolean {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return expiry > now && expiry.getTime() - now.getTime() < thirtyDays;
  }

  function handleSearch() {
    updateParams({ search: searchInput, page: "1" });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Drivers</h1>
          <p className="text-sm text-muted-foreground">{count} drivers total</p>
        </div>
        <Link href="/drivers/new">
          <Button>
            <Plus className="mr-1 h-4 w-4" /> Add Driver
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <Input
            placeholder="Search by name or license..."
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
          value={statusFilter}
          onChange={(e) => updateParams({ status: e.target.value, page: "1" })}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="">All Statuses</option>
          {statusFilters.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>License No.</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>License Expiry</TableHead>
            <TableHead>Safety Score</TableHead>
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
          ) : drivers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No drivers found.
              </TableCell>
            </TableRow>
          ) : (
            drivers.map((d) => {
              const expired = isLicenseExpired(d.license_expiry_date);
              const expiringSoon = isLicenseExpiringSoon(d.license_expiry_date);
              return (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.full_name}</TableCell>
                  <TableCell className="font-mono text-xs">{d.license_number}</TableCell>
                  <TableCell>{d.license_category}</TableCell>
                  <TableCell>
                    <span
                      className={
                        expired
                          ? "text-destructive font-medium"
                          : expiringSoon
                          ? "text-warning font-medium"
                          : ""
                      }
                    >
                      {d.license_expiry_date}
                      {expired && " (Expired)"}
                      {expiringSoon && " (Expiring)"}
                    </span>
                  </TableCell>
                  <TableCell className="tabular-nums">{d.safety_score}</TableCell>
                  <TableCell>
                    <select
                      value={d.status}
                      onChange={(e) => handleStatusChange(d.id, e.target.value)}
                      className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                    >
                      {["available", "on_trip", "off_duty", "suspended"].map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/drivers/${d.id}`}>
                        <Button variant="ghost" size="icon" aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete"
                        onClick={() => setDeleteId(d.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
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
          <DialogTitle>Delete Driver</DialogTitle>
          <DialogCloseButton onClick={() => setDeleteId(null)} />
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this driver? This action cannot be undone.
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
