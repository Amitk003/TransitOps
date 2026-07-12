"use client";

import { VoiceDispatch } from "@/components/voice/voice-dispatch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function DispatchPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Voice Dispatch</h1>
          <p className="text-sm text-muted-foreground">
            Dispatch trips using voice commands
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <VoiceDispatch />
        </CardContent>
      </Card>
    </div>
  );
}
