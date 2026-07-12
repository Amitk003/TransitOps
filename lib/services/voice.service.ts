import { createClient } from "@/lib/supabase/client";

export interface ParsedEntities {
  driver_id?: string;
  driver_name?: string;
  vehicle_id?: string;
  vehicle_name?: string;
  source?: string;
  destination?: string;
  confidence: number;
}

export interface VoiceCommand {
  transcript: string;
  entities: ParsedEntities;
}

const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export function isSpeechSupported(): boolean {
  return SpeechRecognitionAPI !== null;
}

export function createSpeechRecognition(): any {
  if (!SpeechRecognitionAPI) return null;
  const recognition = new SpeechRecognitionAPI();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = true;
  return recognition;
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

export async function parseEntities(transcript: string): Promise<ParsedEntities> {
  const supabase = createClient();
  const entities: ParsedEntities = { confidence: 0 };
  const lower = normalize(transcript);

  const [drivers, vehicles] = await Promise.all([
    supabase.from("drivers").select("id, full_name"),
    supabase.from("vehicles").select("id, vehicle_name, registration_number"),
  ]);

  const driverList = (drivers.data ?? []) as { id: string; full_name: string }[];
  const vehicleList = (vehicles.data ?? []) as { id: string; vehicle_name: string; registration_number: string }[];

  for (const d of driverList) {
    const nameParts = d.full_name.toLowerCase().split(" ");
    for (const part of nameParts) {
      if (part.length > 2 && lower.includes(part)) {
        entities.driver_id = d.id;
        entities.driver_name = d.full_name;
        entities.confidence += 3;
        break;
      }
    }
  }

  for (const v of vehicleList) {
    const searchTerms = [
      v.vehicle_name.toLowerCase(),
      v.registration_number.toLowerCase(),
    ];
    for (const term of searchTerms) {
      if (term.length > 1 && lower.includes(term)) {
        entities.vehicle_id = v.id;
        entities.vehicle_name = `${v.vehicle_name} (${v.registration_number})`;
        entities.confidence += 3;
        break;
      }
    }
  }

  const fromMatch = lower.match(/\bfrom\s+([a-z0-9\s]+?)\s+to\b/i);
  const toMatch = lower.match(/\bto\s+([a-z0-9\s]+?)$/i);

  if (fromMatch) {
    entities.source = fromMatch[1].trim().replace(/\s+/g, " ");
    entities.confidence += 1;
  }
  if (toMatch) {
    entities.destination = toMatch[1].trim().replace(/\s+/g, " ");
    entities.confidence += 1;
  }

  return entities;
}

export async function validateEntities(entities: ParsedEntities): Promise<string[]> {
  const errors: string[] = [];
  if (!entities.driver_id) errors.push("Could not identify a driver. Please say the driver's name.");
  if (!entities.vehicle_id) errors.push("Could not identify a vehicle. Please say the registration number or vehicle name.");
  if (!entities.source) errors.push("Could not identify source. Please say 'from [location] to [location]'.");
  if (!entities.destination) errors.push("Could not identify destination. Please say 'from [location] to [location]'.");
  return errors;
}
