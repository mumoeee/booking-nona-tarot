import { sheets } from "../lib/sheets.js";

export default async function handler(req, res) {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: "1wMTBYpWTomcPjLn7MJuldOlZ3g6ptij0dHkEpX1-RI8",
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
