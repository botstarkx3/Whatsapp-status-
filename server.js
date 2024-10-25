const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { makeWASocket, generateRegistrationCode, Mimetype, Browsers } = require('@whiskeysockets/baileys');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('audioFile'), async (req, res) => {
    const whatsappNumber = req.body.whatsappNumber;
    const audioFilePath = req.file.path;

    try {
        const sock = makeWASocket({
            browser: Browsers.macOS('Desktop'), // Specify macOS and Desktop
            syncFullHistory: true
        });

        const registrationCode = await generateRegistrationCode(sock);
        console.log('Registration Code:', registrationCode);

        // Send the registration code to the user
        res.json({ message: 'Please enter this code in WhatsApp to link your device:', code: registrationCode });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'open') {
                try {
                    const audioBuffer = fs.readFileSync(audioFilePath);
                    await sock.sendMessage(`${whatsappNumber}@s.whatsapp.net`, {
                        audio: audioBuffer,
                        mimetype: Mimetype.audio,
                        ptt: true
                    });
                    sock.logout();
                    fs.unlinkSync(audioFilePath); // Delete the file after sending
                    console.log('Voice message sent and logged out successfully!');
                } catch (error) {
                    console.error('Error sending voice message:', error);
                }
            } else if (lastDisconnect?.error) {
                console.error('Connection error:', lastDisconnect.error);
            }
        });
    } catch (error) {
        console.error('Error during registration or connection:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
