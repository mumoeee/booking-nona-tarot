import { sheets } from "../lib/sheets.js";

export default async function handler(req, res) {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "CONFIG!A:B",
    });

    const values = result.data.values;
    const dailyQuotaRow = values.find(row => row[0] === 'daily_quota');

    const remaining = dailyQuotaRow ? dailyQuotaRow[1] : 0;

    res.status(200).json({
      success: true,
      remaining
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
