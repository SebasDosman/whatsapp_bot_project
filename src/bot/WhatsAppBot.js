import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;
import qrcode from 'qrcode-terminal';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs'; 
import { faqCorpus } from './config/corpus.js';
import { welcomeUsersList } from './config/usersList.js';
import { delay } from './utils/helpers.js';
import { welcomeMessage } from './utils/messages.js';
import { handleIncomingMessage } from './handlers/messageHandler.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class WhatsAppBot {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth({ clientId: 'commercial-bot' }),
            puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
        });

        this.faqCorpus = faqCorpus;
        this.welcomeUsersList = welcomeUsersList;
        this.unrecognizedQueries = [];
        this.activeConversations = new Map();
    }

    initializeBot = () => {
        this.client.on('qr', (qr) => qrcode.generate(qr, { small: true }));
        this.client.on('ready', () => this.sendWelcomeMessages());
        this.client.on('message', (msg) => handleIncomingMessage(msg, this));
        this.client.on('auth_failure', (msg) => console.error(`❌ Authentication failed: ${ msg }`));
        this.client.on('disconnected', (reason) => console.log(`🔌 Disconnected client: ${ reason }`));
        this.client.initialize();
    }

    sendWelcomeMessages = async () => {
        const promoImage = await this.createPromotionalImage();
        
        for (const userId of this.welcomeUsersList) {
            try {
                if (promoImage) {
                    await this.client.sendMessage(userId, promoImage, { caption: welcomeMessage });
                    console.log(`✅ Promotional image sent to ${ userId }`);
                } else {
                    await this.client.sendMessage(userId, welcomeMessage);
                    console.log(`✅ Text message sent to ${ userId }`);
                }

                await delay(2000);
            } catch (err) {
                console.error(`❌ Error sending welcome message to ${ userId }: ${ err.message }`);
            }
        }
    }

    createPromotionalImage = async () => {
        try {
            const imagePath = path.join(__dirname, '../../public/promotional-image.png');
            await fs.access(imagePath);
            console.log('✅ Promotional image found!');
            
            const media = MessageMedia.fromFilePath(imagePath);
            return media;
        } catch (error) {
            console.log('⚠️ Promotional image not found, sending text message instead.');
            return null;
        }
    }
}