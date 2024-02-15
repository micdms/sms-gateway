import express from "express";
import { OTP } from "./sms.mjs";

const app = express();
const port = 3000;

// Middleware untuk parsing body dari request
app.use(express.json());

// Endpoint POST untuk menghasilkan token
app.post('/generate-otp', async (req, res) => {
  const { telephone } = req.body;

  console.log(req.body);
  // Pastikan nomor telepon tersedia
  if (!telephone) {
    return res.status(400).json({ error: 'Nomor telepon tidak valid' });
  }

  const otp = await OTP(telephone);

  // Respon dengan token dan nomor telepon
  res.json({
    'telephone': otp[0],
    'token': otp[1]
  });
});


// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
