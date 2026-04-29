const express = require('express');
const bodyParser = require('body-parser');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(bodyParser.json());

// 1. Initialize the WhatsApp Client with Version 2 Optimizations
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-extensions',
            // --- STABILITY FLAGS FOR VERSION 2 ---
            '--disable-features=IsolateOrigins,site-per-process', 
            '--disable-site-isolation-trials',
            '--disable-web-security', // Helps internal API communication
            '--no-instance-sharing'
        ]
    }
});

// 2. Generate the QR Code in the terminal
client.on('qr', (qr) => {
    console.log('\n==================================================');
    console.log('📱 ACTION REQUIRED: Scan this QR code with WhatsApp');
    console.log('==================================================\n');
    qrcode.generate(qr, { small: true });
});

// 3. Confirm when connected
client.on('ready', () => {
    console.log('\n✅ WhatsApp Client is fully connected and ready!');
});

// 3.5 Handle Disconnects & Auth Failures for PM2 Stability
client.on('disconnected', (reason) => {
    console.error('\n❌ WhatsApp was disconnected. Reason:', reason);
    console.log('Crashing the process so PM2 can restart it...');
    process.exit(1); // Forces PM2 to restart the app
});

client.on('auth_failure', (msg) => {
    console.error('\n⚠️ Authentication failed:', msg);
    console.log('Crashing the process so PM2 can generate a new QR...');
    process.exit(1);
});

client.initialize();

// 4. The API Endpoint for n8n
app.post('/send', async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).send({ error: 'Missing number or message' });
    }

    try {
        // Clean the number of spaces, plus signs, or dashes
        const cleanNumber = number.toString().replace(/\D/g, '');
        const chatId = `${cleanNumber}@c.us`;
       
        await client.sendMessage(chatId, message);
        console.log(`✅ Message successfully sent to ${cleanNumber}`);
        res.status(200).send({ success: true, message: 'Message sent!' });
       
    } catch (error) {
        console.error('❌ Failed to send:', error);
        res.status(500).send({ error: 'Internal server error', details: error.message });
    }
});

// 5. Start the local server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🤖 Optimized Local API is listening on http://localhost:${PORT}`);
});
