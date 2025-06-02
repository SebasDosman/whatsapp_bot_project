# WhatsApp FAQ Bot

A Node.js chatbot powered by `whatsapp-web.js` that automatically responds to incoming messages based on predefined FAQ categories. This bot includes welcome messaging, similarity-based text matching, logging for unrecognized queries, and basic conversation tracking.

## Features

- **WhatsApp Web integration** via `whatsapp-web.js`.
- **Keyword and similarity-based FAQ matching**.
- **Optional promotional image support** for welcome messages.
- **Personalized responses** based on conversation context.
- **Corpus-driven architecture** using categories and keywords.
- **Logging of unrecognized queries** to improve the knowledge base.
- **Automatic cleanup** of inactive conversations.
- **Local authentication** via `LocalAuth`.

## Getting Started

### Prerequisites

- Node.js >= 14
- Chrome or Chromium (required by Puppeteer)
- WhatsApp account

### Installation

```bash
git clone https://github.com/SebasDosman/whatsapp_bot_project_.git
cd whatsapp-bot
npm install
```

### How It Works

1. **QR Authentication**: On first run, a QR code will be shown in the terminal. Scan it with WhatsApp to authenticate.
2.	**Welcome Messages**: Sends a custom message (and image, if available) to all users in the welcomeUsersList.
3.	**Message Handling**:
- Filters out group chats and bot-originated messages.
- Preprocesses and scores the message against a corpus using keywords and word similarity.
- Replies with the most relevant FAQ or a fallback generic message.
4.	**Unrecognized Logging**: Messages with low confidence are stored in unrecognized_queries.json.
5.	**Conversation Context**: Tracks recent messages for each user to tailor follow-ups.

###  Configuration

Edit the `config.js` file to set your bot's configuration:

```javascript
export const faqCorpus = {
  shipping: {
    keywords: ['delivery', 'shipping', 'cost'],
    response: 'Shipping is free for orders over $50!'
  },
  returns: {
    keywords: ['refund', 'return', 'policy'],
    response: 'Our return policy lasts 30 days...'
  }
};

export const welcomeUsersList = [
  '123456789@c.us',
  '987654321@c.us'
];
```

### Development & Debugging
- Logs are printed for each incoming message and match evaluation.
- Confidence threshold for matches is set at 0.1 (can be adjusted).
- Similitude is calculated with a normalized Levenshtein distance.

### Maintenance
- Inactive conversations (24h+) are auto-removed using cleanupInactiveConversations().
- You can gracefully shut down the bot with bot.destroy().

### Security
- Local authentication is stored via LocalAuth.
- The bot runs in headless mode with Puppeteer and uses the --no-sandbox flag for environments like Docker.

### Promo Image

To enable image-based welcome messages, place a promo-image.jpg file inside the server/ directory.

### License

MIT License ©SebasDosman
