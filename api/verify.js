import { sheets } from "../lib/sheets.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, error: "Missing code" });

    // Ambil semua booking
    const bookingRes = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "BOOKING!A:D",
    });

    const bookings = bookingRes.data.values || [];
    const index = bookings.findIndex(b => b[3] === code);

    if (index === -1) {
      return res.status(400).json({ success: false, error: "Kode tidak valid" });
    }

    // Update status di Sheets (misal kolom E untuk status)
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `BOOKING!E${index + 1}`,
      valueInputOption: "RAW",
      resource: { values: [["CONFIRMED"]] },
    });

    res.status(200).json({ success: true, message: "Kode booking terkonfirmasi" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
