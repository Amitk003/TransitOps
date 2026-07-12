"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Camera, Loader2, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogCloseButton,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { createFuelLog } from "@/lib/services/fuel.service";
import { extractText, parseReceiptText } from "@/lib/services/ocr.service";
import type { ParsedReceipt } from "@/lib/services/ocr.service";
import type { Vehicle } from "@/types";

type Stage = "upload" | "extracting" | "confirm" | "saving" | "done" | "error";

export function OcrFuelForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [parsed, setParsed] = useState<ParsedReceipt>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [fuelDate, setFuelDate] = useState(new Date().toISOString().slice(0, 10));
  const [liters, setLiters] = useState(0);
  const [cost, setCost] = useState(0);
  const [fuelStation, setFuelStation] = useState("");
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadVehicles() {
      const supabase = createClient();
      const { data } = await supabase.from("vehicles").select("id, vehicle_name, registration_number").order("vehicle_name");
      setVehicles((data as Vehicle[]) ?? []);
    }
    loadVehicles();
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setStage("extracting");

    extractText(file)
      .then((result) => {
        setOcrText(result.text);
        const { parsed: p } = parseReceiptText(result.text);
        setParsed(p);

        if (p.amount) setCost(p.amount);
        if (p.liters) setLiters(p.liters);
        if (p.fuelStation) setFuelStation(p.fuelStation);
        if (p.date) setFuelDate(p.date);

        setStage("confirm");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "OCR processing failed.");
        setStage("error");
      });
  }

  async function handleSave() {
    if (!selectedVehicleId) {
      setError("Please select a vehicle.");
      return;
    }
    if (cost <= 0) {
      setError("Cost must be greater than 0.");
      return;
    }

    setStage("saving");
    try {
      const log = await createFuelLog({
        vehicle_id: selectedVehicleId,
        fuel_date: fuelDate,
        liters,
        cost,
        odometer: 0,
        fuel_station: fuelStation || undefined,
        remarks: `OCR scanned: ${ocrText.slice(0, 200)}`,
      });
      setSavedId(log.id);
      setStage("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save fuel log.");
      setStage("error");
    }
  }

  function reset() {
    setStage("upload");
    setPreview(null);
    setOcrText("");
    setParsed({});
    setSelectedVehicleId("");
    setFuelDate(new Date().toISOString().slice(0, 10));
    setLiters(0);
    setCost(0);
    setFuelStation("");
    setError("");
    setSavedId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function done() {
    router.push("/fuel-expenses?tab=fuel");
  }

  return (
    <div className="flex flex-col gap-6">
      {stage === "upload" && (
        <div className="flex flex-col items-center gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex h-48 w-full max-w-md cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Click to upload a receipt photo</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG or JPEG</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {stage === "extracting" && (
        <div className="flex flex-col items-center gap-4 py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Extracting text from receipt...</p>
        </div>
      )}

      {stage === "confirm" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
            {preview && (
              <Card>
                <CardHeader>
                  <CardTitle>Receipt Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <img src={preview} alt="Receipt" className="max-h-48 rounded-md object-contain" />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Extracted Text
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-32 overflow-y-auto rounded-md bg-muted p-3">
                  <pre className="text-xs whitespace-pre-wrap font-mono">{ocrText}</pre>
                </div>
                {parsed.amount && (
                  <Badge variant="secondary" className="mt-2">
                    Confidence: low (demo mode)
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Confirm Fuel Entry</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Vehicle</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicle_name} ({v.registration_number})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Date"
                type="date"
                value={fuelDate}
                onChange={(e) => setFuelDate(e.target.value)}
              />

              <Input
                label="Liters"
                type="number"
                step="0.01"
                value={liters || ""}
                onChange={(e) => setLiters(Number(e.target.value))}
              />

              <Input
                label="Cost (Rs)"
                type="number"
                step="0.01"
                value={cost || ""}
                onChange={(e) => setCost(Number(e.target.value))}
              />

              <Input
                label="Fuel Station"
                value={fuelStation}
                onChange={(e) => setFuelStation(e.target.value)}
              />

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-2">
                <Button variant="outline" onClick={reset} className="flex-1">
                  Rescan
                </Button>
                <Button onClick={handleSave} className="flex-1" disabled={!selectedVehicleId}>
                  Save Fuel Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {stage === "saving" && (
        <div className="flex flex-col items-center gap-4 py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Saving fuel entry...</p>
        </div>
      )}

      <Dialog
        open={stage === "done"}
        onOpenChange={(o) => {
          if (!o) done();
        }}
      >
        <DialogHeader>
          <DialogTitle>Fuel Entry Saved</DialogTitle>
          <DialogCloseButton onClick={done} />
        </DialogHeader>
        <DialogDescription>
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle className="h-12 w-12 text-success" />
            <p className="text-center text-sm">
              Fuel entry <span className="font-mono font-semibold">{savedId?.slice(0, 8)}</span> has
              been saved from the scanned receipt.
            </p>
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={reset}>Scan Another</Button>
          <Button onClick={done}>View Fuel Logs</Button>
        </DialogFooter>
      </Dialog>

      <Dialog
        open={stage === "error"}
        onOpenChange={(o) => {
          if (!o) { reset(); }
        }}
      >
        <DialogHeader>
          <DialogTitle>OCR Failed</DialogTitle>
          <DialogCloseButton onClick={reset} />
        </DialogHeader>
        <DialogDescription>
          <div className="flex flex-col items-center gap-3 py-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-sm">{error || "Could not process the receipt image."}</p>
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button onClick={reset}>Try Again</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
