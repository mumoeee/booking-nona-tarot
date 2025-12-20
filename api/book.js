import { sheets } from "../lib/sheets.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { name, email, paket, story } = req.body;
  if (!name || !email || !paket || !story) {
    return res.status(400).json({
      success: false,
      error: 'Name, email, paket, dan story wajib diisi'
    });
  }

  try {
    // ambil config
    const configRes = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "CONFIG!A:B"
    });

    const values = configRes.data.values || [];
    const dailyQuotaRow = values.find(row => row[0] === 'daily_quota');
    let remaining = dailyQuotaRow ? parseInt(dailyQuotaRow[1]) : 0;

    if (remaining <= 0) {
      return res.status(200).json({
        success: false,
        error: 'Slot hari ini sudah penuh'
      });
    }

    const code = `NONA-${Date.now()}`;

    // simpan booking
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "BOOKING!A:E",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[code, name, email, paket, story]]
      }
    });

    // update quota
    remaining -= 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "CONFIG!B2",
      valueInputOption: "USER_ENTERED",
      resource: { values: [[remaining]] }
    });

    // RETURN DATA SAJA
    res.status(200).json({
      success: true,
      code,
      remaining,
      name,
      email,
      paket,
      story
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
