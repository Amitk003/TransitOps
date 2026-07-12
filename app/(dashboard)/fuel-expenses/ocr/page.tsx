"use client";

import { OcrFuelForm } from "@/components/fuel/ocr-fuel-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function OcrFuelPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Scan Receipt</h1>
          <p className="text-sm text-muted-foreground">
            Upload a fuel receipt photo to automatically extract and save fuel data
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <OcrFuelForm />
        </CardContent>
      </Card>
    </div>
  );
}
