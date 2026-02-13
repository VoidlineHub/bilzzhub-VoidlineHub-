const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

// 1. KONEKSI KE MONGODB (Link lu yang sudah terverifikasi)
const mongoURI = "mongodb+srv://habilyusuf9:muhammadhabilyusuf9@cluster0.hunyw0i.mongodb.net/VoidlineHub?retryWrites=true&w=majority";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Voidline Database Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// 2. SCHEMA UNTUK DATA BAN
const BanSchema = new mongoose.Schema({
    hwid: { type: String, required: true, unique: true },
    reason: { type: String, default: "Security Violation / Blacklisted" },
    timestamp: { type: Date, default: Date.now }
});
const Ban = mongoose.model('Ban', BanSchema);

// --- 🌐 API UNTUK ROBLOX (Pengecekan HWID) ---
app.get('/api/check', async (req, res) => {
    const { hwid } = req.query;
    if (!hwid) return res.json({ status: "error", message: "No HWID provided" });

    try {
        const result = await Ban.findOne({ hwid: hwid });
        if (result) {
            return res.json({ status: "banned", reason: result.reason });
        }
        res.json({ status: "clear" });
    } catch (err) {
        res.status(500).json({ status: "error" });
    }
});

// --- 👑 DASHBOARD ADMIN (Tampilan Web) ---
app.get('/', (req, res) => {
    res.send(`
        <body style="background:#0a0a0a; color:white; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; margin:0;">
            <h1 style="color:#00e1ff; text-shadow: 0 0 10px #00e1ff;">🔱 VOIDLINE EXECUTIVE PANEL</h1>
            <p style="color:#888;">Database Status: <span style="color:springgreen;">ONLINE</span></p>
            
            <div style="background:#111; padding:30px; border-radius:15px; border:1px solid #333; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <h3 style="margin-top:0;">Blacklist Hardware ID</h3>
                <input id="hwid" placeholder="Paste HWID Target Di Sini" style="padding:12px; border-radius:5px; border:1px solid #444; background:#222; color:white; width:300px; margin-bottom:10px;">
                <br>
                <button onclick="execBan()" style="padding:12px 25px; background:#ff4444; color:white; border:none; border-radius:5px; cursor:pointer; width:100%; font-weight:bold;">BAN PLAYER PERMANENTLY</button>
            </div>

            <script>
                async function execBan() {
                    const id = document.getElementById('hwid').value;
                    if(!id) return alert("HWID tidak boleh kosong!");
                    
                    const res = await fetch('/api/admin/ban', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ hwid: id })
                    });
                    
                    if(res.ok) {
                        alert("✅ HWID " + id + " Telah Masuk Blacklist!");
                        document.getElementById('hwid').value = '';
                    } else {
                        alert("❌ Gagal Ban! Cek koneksi database.");
                    }
                }
            </script>
        </body>
    `);
});

// API Internal untuk Dashboard
app.post('/api/admin/ban', async (req, res) => {
    try {
        await Ban.create({ hwid: req.body.hwid });
        res.sendStatus(200);
    } catch (e) { res.sendStatus(500); }
});

module.exports = app;
  
