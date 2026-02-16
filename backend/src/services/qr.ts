import QRCode from "qrcode";

export interface QRPayload {
  ticketId: string;
  eventId: string;
  userId: string;
}

/**
 * Generate a QR code data URL encoding the ticket information.
 */
export async function generateTicketQR(payload: QRPayload): Promise<string> {
  const data = JSON.stringify(payload);
  return QRCode.toDataURL(data, {
    width: 300,
    margin: 2,
    color: { dark: "#1e293b", light: "#ffffff" },
  });
}

/**
 * Parse QR code data back into a payload.
 */
export function parseQRData(raw: string): QRPayload | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed.ticketId && parsed.eventId && parsed.userId) {
      return parsed as QRPayload;
    }
    return null;
  } catch {
    return null;
  }
}
