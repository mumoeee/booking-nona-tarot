import { sheets } from "../lib/sheets.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { name, email, paket, story } = req.body;
  if (!name || !email || !paket || !story ) {
    return res.status(400).json({ success: false, error: 'Name, email, story, dan paket required' });
  }

  try {
    // Ambil konfigurasi dari sheet
    const configRes = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "CONFIG!A:B"
    });

    const values = configRes.data.values;
    const dailyQuotaRow = values.find(row => row[0] === 'daily_quota');
    let remaining = dailyQuotaRow ? parseInt(dailyQuotaRow[1]) : 0;

    if (remaining <= 0) {
      return res.status(200).json({ success: false, error: 'Slot hari ini sudah penuh' });
    }

    // Generate kode booking unik
    const code = 'NONA-' + Date.now();

    // Masukkan booking ke sheet "BOOKING"
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "BOOKING!A:E", // Tambah kolom paket
      valueInputOption: "USER_ENTERED",
      resource: { values: [[code, name, email, paket, story ]] }
    });

    // Kurangi sisa slot
    remaining -= 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "CONFIG!B2", // daily_quota cell
      valueInputOption: "USER_ENTERED",
      resource: { values: [[remaining]] }
    });

    // Buat link WhatsApp otomatis
    const waNumber = '6285600045005';
    const waMessage = encodeURIComponent(
      `🙇🏻‍♀️🔮*HII NONA TAROT, BUKTI PEMBAYARAN KE BRI 308101002125500 a.n. RANNI ANUGRAH PRAMUDHITA AKAN AKU TRANSFER SETELAH PESAN INI TERKIRIM*🙇🏻‍♀️🔮\nInformasi booking:\nNama: ${name}\nEmail: ${email}\nPaket: ${paket}\nCerita/Pertanyaan: ${story}\nKode Booking: ${code}`
    );
    const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

    res.status(200).json({ success: true, code, remaining, waLink });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
