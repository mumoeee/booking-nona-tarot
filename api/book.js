import { sheets } from "../lib/sheets.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ success: false, error: 'Name & email required' });

  try {
    // Ambil daily quota
    const config = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "CONFIG!A:B"
    });

    const values = config.data.values;
    const dailyQuotaRow = values.find(row => row[0] === 'daily_quota');
    let remaining = dailyQuotaRow ? parseInt(dailyQuotaRow[1]) : 0;

    if (remaining <= 0) {
      return res.status(200).json({ success: false, error: 'Slot hari ini sudah penuh' });
    }

    // generate kode booking unik
    const code = 'NONA-' + Date.now();

    // Masukkan booking ke sheet (misal di sheet "BOOKING")
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "BOOKING!A:C",
      valueInputOption: "USER_ENTERED",
      resource: { values: [[code, name, email]] }
    });

    // Kurangi slot
    remaining -= 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "CONFIG!B2", // daily_quota cell
      valueInputOption: "USER_ENTERED",
      resource: { values: [[remaining]] }
    });

    res.status(200).json({ success: true, code, remaining });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
