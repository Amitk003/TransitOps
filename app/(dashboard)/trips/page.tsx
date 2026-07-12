"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Search } from "lucide-react";
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
import {
  getTrips,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  deleteTrip,
} from "@/lib/services/trip.service";
import { formatDate } from "@/lib/utils";

const statusOptions = ["", "draft", "dispatched", "completed", "cancelled"];

const statusVariant: Record<string, "default" | "secondary" | "success" | "outline" | "destructive"> = {
  draft: "default",
  dispatched: "secondary",
  completed: "success",
  cancelled: "outline",
};

interface TripRow {
  id: string;
  source: string;
  destination: string;
  vehicle_id: string;
  driver_id: string;
  cargo_weight: number;
  planned_distance: number;
  status: string;
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
  registration_number: string;
  vehicle_name: string;
  driver_name: string;
}

export default function TripsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const page = Number(searchParams.get("page") || "1");

  const [trips, setTrips] = useState<TripRow[]>([]);
  const [count, setCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(search);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      router.push(`/trips?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await getTrips({
          search: search || undefined,
          status: statusFilter || undefined,
          page,
        });
        setTrips(result.data as unknown as TripRow[]);
        setCount(result.count);
        setPageCount(result.pageCount);
      } catch (err) {
        console.error("Failed to load trips", err);
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
      await deleteTrip(deleteId);
      setTrips((prev) => prev.filter((t) => t.id !== deleteId));
      setCount((prev) => prev - 1);
    } catch (err) {
      console.error("Failed to delete trip", err);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  async function handleAction(action: string, id: string) {
    setActionLoading(`${action}-${id}`);
    try {
      if (action === "dispatch") await dispatchTrip(id);
      else if (action === "complete") await completeTrip(id);
      else if (action === "cancel") await cancelTrip(id);
      const result = await getTrips({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
      });
      setTrips(result.data as unknown as TripRow[]);
      setCount(result.count);
      setPageCount(result.pageCount);
    } catch (err) {
      console.error(`Failed to ${action} trip`, err);
    } finally {
      setActionLoading(null);
    }
  }

  function handleSearch() {
    updateParams({ search: searchInput, page: "1" });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trips</h1>
          <p className="text-sm text-muted-foreground">{count} trips total</p>
        </div>
        <Link href="/trips/new">
          <Button>
            <Plus className="mr-1 h-4 w-4" /> Create Trip
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <Input
            placeholder="Search source or destination..."
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
          {statusOptions.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Distance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground">
                Loading...
              </TableCell>
            </TableRow>
          ) : trips.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground">
                No trips found.
              </TableCell>
            </TableRow>
          ) : (
            trips.map((t) => (
              <TableRow
                key={t.id}
                className="cursor-pointer"
                onClick={() => router.push(`/trips/${t.id}`)}
              >
                <TableCell className="font-mono text-xs">{t.id.slice(0, 8)}</TableCell>
                <TableCell>{t.source}</TableCell>
                <TableCell>{t.destination}</TableCell>
                <TableCell className="text-xs">{t.registration_number}</TableCell>
                <TableCell>{t.driver_name}</TableCell>
                <TableCell className="tabular-nums">{t.cargo_weight} kg</TableCell>
                <TableCell className="tabular-nums">{t.planned_distance} km</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[t.status] || "outline"}>
                    {t.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {t.status === "draft" && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={actionLoading !== null}
                          onClick={() => handleAction("dispatch", t.id)}
                        >
                          {actionLoading === `dispatch-${t.id}` ? "..." : "Dispatch"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={actionLoading !== null}
                          onClick={() => handleAction("cancel", t.id)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {t.status === "dispatched" && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          disabled={actionLoading !== null}
                          onClick={() => handleAction("complete", t.id)}
                        >
                          {actionLoading === `complete-${t.id}` ? "..." : "Complete"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={actionLoading !== null}
                          onClick={() => handleAction("cancel", t.id)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {t.status === "completed" && (
                      <span className="text-xs text-muted-foreground">Done</span>
                    )}
                    {t.status === "cancelled" && (
                      <span className="text-xs text-muted-foreground">Cancelled</span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete"
                      onClick={() => setDeleteId(t.id)}
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
          <DialogTitle>Delete Trip</DialogTitle>
          <DialogCloseButton onClick={() => setDeleteId(null)} />
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this trip? This action cannot be undone.
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
