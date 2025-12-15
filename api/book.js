import { sheets } from "../lib/sheets.js";
import { v4 as uuidv4 } from "uuid"; // generate kode unik

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { name, phone, date } = req.body;
    if (!name || !phone || !date) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    // Ambil konfigurasi & slot
    const configRes = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "CONFIG!A:B",
    });

    const config = Object.fromEntries(configRes.data.values.slice(1));
    const dailyQuota = parseInt(config.daily_quota);

    // Ambil booking hari itu
    const bookingRes = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `BOOKING!A:D`,
    });
    const bookings = bookingRes.data.values || [];
    const todayBookings = bookings.filter(b => b[2] === date);

    if (todayBookings.length >= dailyQuota) {
      return res.status(400).json({ success: false, error: "Slot penuh hari ini" });
    }

    const bookingCode = uuidv4().slice(0, 8).toUpperCase(); // kode unik 8 karakter

    // Simpan booking baru
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "BOOKING!A:D",
      valueInputOption: "RAW",
      resource: {
        values: [[name, phone, date, bookingCode]],
      },
    });

    res.status(200).json({
      success: true,
      message: "Booking berhasil",
      bookingCode,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
