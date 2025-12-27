import { sheets } from "../lib/sheets.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { name, email, wa, paket, story } = req.body;
  if (!name || !email || !wa || !paket || !story) {
    return res.status(400).json({
      success: false,
      error: 'Name, email, wa, paket, dan story wajib diisi'
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

const waNumber = '6285600045005';

const message = `🔮🙇🏻‍♀️ *HII NONA TAROT, BUKTI PEMBAYARAN KE BRI 308101002125500 An RANNI ANUGRAH PRAMUDHITA BAKAL AKU KIRIM SETELAH PESAN INI* 🙇🏻‍♀️🔮

Informasi Booking:
Nama: ${name}
Email: ${email}
Paket: ${paket}

Cerita / Pertanyaan:
${story}

Kode Booking: ${code}`;

const waUrl =
  `https://api.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent(message)}`;


    // simpan booking
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "BOOKING!A:F",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[code, name, email, wa, paket, story]]
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
  waUrl
});


  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
