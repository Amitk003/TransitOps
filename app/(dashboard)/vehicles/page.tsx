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
import { getVehicles, deleteVehicle } from "@/lib/services/vehicle.service";
import type { Vehicle } from "@/types";

const vehicleTypes = ["", "van", "truck", "bus", "mini_truck", "pickup", "other"];
const statusFilters = ["", "available", "on_trip", "in_shop", "retired"];

const statusVariant: Record<string, "success" | "secondary" | "warning" | "outline" | "destructive"> = {
  available: "success",
  on_trip: "secondary",
  in_shop: "warning",
  retired: "outline",
};

export default function VehiclesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const typeFilter = searchParams.get("type") || "";
  const statusFilter = searchParams.get("status") || "";
  const page = Number(searchParams.get("page") || "1");

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
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
      router.push(`/vehicles?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await getVehicles({
          search: search || undefined,
          type: typeFilter || undefined,
          status: statusFilter || undefined,
          page,
        });
        setVehicles(result.data);
        setCount(result.count);
        setPageCount(result.pageCount);
      } catch (err) {
        console.error("Failed to load vehicles", err);
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
      await deleteVehicle(deleteId);
      setVehicles((prev) => prev.filter((v) => v.id !== deleteId));
      setCount((prev) => prev - 1);
    } catch (err) {
      console.error("Failed to delete vehicle", err);
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
          <h1 className="text-2xl font-semibold tracking-tight">Vehicle Registry</h1>
          <p className="text-sm text-muted-foreground">{count} vehicles total</p>
        </div>
        <Link href="/vehicles/new">
          <Button>
            <Plus className="mr-1 h-4 w-4" /> Add Vehicle
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <Input
            placeholder="Search by reg no. or name..."
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
          {vehicleTypes.filter(Boolean).map((t) => (
            <option key={t} value={t}>{t.replace("_", " ")}</option>
          ))}
        </select>

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
            <TableHead>Registration</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Max Load</TableHead>
            <TableHead>Odometer</TableHead>
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
          ) : vehicles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No vehicles found.
              </TableCell>
            </TableRow>
          ) : (
            vehicles.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-mono text-xs">{v.registration_number}</TableCell>
                <TableCell>{v.vehicle_name}</TableCell>
                <TableCell className="capitalize">{v.vehicle_type.replace("_", " ")}</TableCell>
                <TableCell className="tabular-nums">{v.max_load_capacity} kg</TableCell>
                <TableCell className="tabular-nums">{v.odometer.toLocaleString()} km</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[v.status] || "outline"}>
                    {v.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/vehicles/${v.id}`}>
                      <Button variant="ghost" size="icon" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete"
                      onClick={() => setDeleteId(v.id)}
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
          <DialogTitle>Delete Vehicle</DialogTitle>
          <DialogCloseButton onClick={() => setDeleteId(null)} />
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this vehicle? This action cannot be undone.
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
