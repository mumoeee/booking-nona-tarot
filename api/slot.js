import { sheets } from "../lib/sheets.js";

export default async function handler(req, res) {
  // Tambahin header CORS
  res.setHeader("Access-Control-Allow-Origin", "*"); // biar bisa diakses dari mana aja
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); 
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "CONFIG!A:B",
    });

    res.status(200).json({
      success: true,
      data: result.data.values,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
