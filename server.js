const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { makeWASocket, generateRegistrationCode, Mimetype } = require('@whiskeysockets/baileys');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('audioFile'), async (req, res) => {
    const whatsappNumber = req.body.whatsappNumber;
    const audioFilePath = req.file.path;

    const sock = makeWASocket();

    const registrationCode = await generateRegistrationCode(sock);
    console.log('Registration Code:', registrationCode);

    // Send the registration code to the user
    res.json({ message: 'Please enter this code in WhatsApp to link your device:', code: registrationCode });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            const audioBuffer = fs.readFileSync(audioFilePath);
            await sock.sendMessage(`${whatsappNumber}@s.whatsapp.net`, {
                audio: audioBuffer,
                mimetype: Mimetype.audio,
                ptt: true
            });
            sock.logout();
            res.json({ message: 'Voice message sent and logged out successfully!' });
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
