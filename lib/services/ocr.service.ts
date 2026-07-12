import { createWorker } from "tesseract.js";

export interface OcrResult {
  text: string;
  confidence: number;
}

export interface ParsedReceipt {
  amount?: number;
  liters?: number;
  fuelStation?: string;
  date?: string;
  vehicle_id?: string;
}

export async function extractText(imageFile: File): Promise<OcrResult> {
  const worker = await createWorker("eng");
  const { data } = await worker.recognize(imageFile);
  await worker.terminate();
  return { text: data.text, confidence: data.confidence };
}

export function parseReceiptText(text: string): OcrResult & { parsed: ParsedReceipt } {
  const parsed: ParsedReceipt = {};

  const lines = text.split("\n").filter(Boolean);
  const lower = text.toLowerCase();

  const amountMatch = lower.match(/(?:total|amount|paid|due|sum|price)[:\s]*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  const litersMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:l|liters|litres|gallon|gal)/i);
  const dateMatch = lower.match(/(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/);

  let station = "";
  for (const line of lines) {
    const s = line.trim();
    if (
      s.length > 3 &&
      !s.match(/^\d/) &&
      !s.toLowerCase().includes("total") &&
      !s.toLowerCase().includes("receipt") &&
      !s.toLowerCase().includes("thank") &&
      !s.toLowerCase().includes("price") &&
      !s.toLowerCase().includes("amount") &&
      !s.toLowerCase().includes("liters") &&
      !s.toLowerCase().includes("cash") &&
      !s.toLowerCase().includes("change") &&
      !s.toLowerCase().includes("vat")
    ) {
      station = s;
      break;
    }
  }

  if (amountMatch) {
    parsed.amount = parseFloat(amountMatch[1].replace(/,/g, ""));
  }

  if (litersMatch) {
    parsed.liters = parseFloat(litersMatch[1]);
  }

  if (dateMatch) {
    const parts = dateMatch[1].split(/[\/-]/);
    if (parts.length === 3) {
      let [a, b, c] = parts.map(Number);
      if (c < 100) c += 2000;
      if (a > 12) {
        parsed.date = `${String(c).padStart(4, "0")}-${String(b).padStart(2, "0")}-${String(a).padStart(2, "0")}`;
      } else {
        parsed.date = `${String(c).padStart(4, "0")}-${String(a).padStart(2, "0")}-${String(b).padStart(2, "0")}`;
      }
    }
  }

  if (station) {
    parsed.fuelStation = station;
  }

  return { text, confidence: 0, parsed };
}
