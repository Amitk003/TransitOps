"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogCloseButton,
} from "@/components/ui/dialog";
import {
  isSpeechSupported,
  createSpeechRecognition,
  parseEntities,
  validateEntities,
} from "@/lib/services/voice.service";
import { createTrip, dispatchTrip } from "@/lib/services/trip.service";
import type { ParsedEntities } from "@/lib/services/voice.service";

type Stage = "idle" | "listening" | "processing" | "confirm" | "dispatching" | "done" | "error";

export function VoiceDispatch() {
  const router = useRouter();
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const [stage, setStage] = useState<Stage>("idle");
  const [transcript, setTranscript] = useState("");
  const [entities, setEntities] = useState<ParsedEntities | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [tripId, setTripId] = useState<string | null>(null);
  const supported = isSpeechSupported();

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  function startListening() {
    if (!supported) return;
    setStage("listening");
    setTranscript("");
    setTranscript("");
    transcriptRef.current = "";
    setEntities(null);
    setErrors([]);

    const recognition = createSpeechRecognition();
    if (!recognition) return;

    recognition.onresult = (event: any) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        final += event.results[i][0].transcript;
      }
      transcriptRef.current = final;
      setTranscript(final);
    };

    recognition.onerror = () => {
      setStage("error");
      setErrors(["Microphone error or permission denied. Please allow microphone access."]);
    };

    recognition.onend = async () => {
      const finalTranscript = transcriptRef.current;
      if (!finalTranscript.trim()) {
        setErrors(["No speech detected. Please try again."]);
        setStage("error");
        return;
      }

      setStage("processing");

      try {
        const parsed = await parseEntities(finalTranscript);
        setEntities(parsed);

        const validationErrors = await validateEntities(parsed);
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setStage("error");
        } else {
          setStage("confirm");
        }
      } catch {
        setErrors(["Failed to process voice command."]);
        setStage("error");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function cancel() {
    stopListening();
    setStage("idle");
    setTranscript("");
    transcriptRef.current = "";
    setEntities(null);
    setErrors([]);
  }

  async function confirmDispatch() {
    if (!entities) return;
    setStage("dispatching");

    try {
      const trip = await createTrip({
        source: entities.source!,
        destination: entities.destination!,
        vehicle_id: entities.vehicle_id!,
        driver_id: entities.driver_id!,
        cargo_weight: 0,
        planned_distance: 0,
      });

      await dispatchTrip(trip.id);
      setTripId(trip.id);
      setStage("done");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create trip.";
      setErrors([msg]);
      setStage("error");
    }
  }

  function done() {
    router.push("/trips");
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-lg font-semibold">Voice Dispatch</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Say something like: "Dispatch John in truck 42 from warehouse 3 to depot 5"
        </p>
      </div>

      {!supported && (
        <Card className="w-full max-w-md border-destructive/40">
          <CardContent className="p-6 text-center text-sm text-destructive">
            Voice recognition is not supported in this browser. Please use Chrome or Edge.
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={stage === "listening" ? cancel : startListening}
          disabled={!supported || stage === "processing" || stage === "dispatching"}
          className={`relative flex h-24 w-24 items-center justify-center rounded-full transition-all ${
            stage === "listening"
              ? "bg-destructive text-destructive-foreground scale-110 shadow-lg shadow-destructive/30"
              : stage === "dispatching" || stage === "processing"
              ? "bg-muted text-muted-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {stage === "listening" ? (
            <MicOff className="h-8 w-8" />
          ) : stage === "processing" || stage === "dispatching" ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : stage === "done" ? (
            <CheckCircle className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </button>

        {stage === "listening" && (
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
            </span>
            <span className="text-sm text-muted-foreground">Listening...</span>
          </div>
        )}

        {stage === "listening" && transcript && (
          <Card className="w-full max-w-md">
            <CardContent className="p-4">
              <p className="italic text-sm">{transcript}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog
        open={stage === "confirm"}
        onOpenChange={(o) => {
          if (!o) setStage("idle");
        }}
      >
        <DialogHeader>
          <DialogTitle>Confirm Voice Dispatch</DialogTitle>
          <DialogCloseButton onClick={() => setStage("idle")} />
        </DialogHeader>
        <DialogDescription className="space-y-3">
          {entities && (
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                <span className="text-sm text-muted-foreground">Transcript:</span>
                <span className="text-sm font-medium italic">{transcript}</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                <span className="text-sm text-muted-foreground">Driver:</span>
                <Badge variant="secondary">{entities.driver_name}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                <span className="text-sm text-muted-foreground">Vehicle:</span>
                <Badge variant="secondary">{entities.vehicle_name}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                <span className="text-sm text-muted-foreground">Source:</span>
                <span className="text-sm font-medium">{entities.source}</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                <span className="text-sm text-muted-foreground">Destination:</span>
                <span className="text-sm font-medium">{entities.destination}</span>
              </div>
            </div>
          )}
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={() => setStage("idle")}>
            Cancel
          </Button>
          <Button onClick={confirmDispatch}>
            Dispatch Trip
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog
        open={stage === "done"}
        onOpenChange={(o) => {
          if (!o) done();
        }}
      >
        <DialogHeader>
          <DialogTitle>Trip Dispatched</DialogTitle>
          <DialogCloseButton onClick={done} />
        </DialogHeader>
        <DialogDescription>
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle className="h-12 w-12 text-success" />
            <p className="text-center text-sm">
              Trip <span className="font-mono font-semibold">{tripId?.slice(0, 8)}</span> has been
              created and dispatched via voice command.
            </p>
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button onClick={done}>View Trips</Button>
        </DialogFooter>
      </Dialog>

      <Dialog
        open={stage === "error"}
        onOpenChange={(o) => {
          if (!o) setStage("idle");
        }}
      >
        <DialogHeader>
          <DialogTitle>Dispatch Failed</DialogTitle>
          <DialogCloseButton onClick={() => setStage("idle")} />
        </DialogHeader>
        <DialogDescription>
          <div className="flex flex-col items-center gap-3 py-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <ul className="text-sm list-disc list-inside space-y-1">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button onClick={() => setStage("idle")}>Try Again</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
