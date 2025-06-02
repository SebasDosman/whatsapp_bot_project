import { preprocessText, calculateSimilarity } from '../utils/textProcessing.js';
import { getContextualGreeting } from '../utils/helpers.js';
import { logUnrecognizedQuery } from '../utils/logging.js';
import { genericResponses } from '../utils/messages.js';


export const handleIncomingMessage = async (message, state) => { 
    if (message.fromMe || message.from.includes('@g.us') || message.from.includes('status@broadcast') || message.type !== 'chat' || !message.body || message.body.trim() === '') return;

    const userId = message.from;
    const messageText = message.body.toLowerCase().trim();
    console.log(`📨 Message received from ${userId}: "${message.body}"`);

    try {
        updateConversationContext(userId, messageText, state);
        const response = await generateResponse(messageText, userId, state);
        await message.reply(response);
        console.log(`✅ Response sent to ${userId}: "${response}"`);
    } catch (err) {
        console.error(`❌ Error processing message: ${err.message}`);
        await message.reply('🔧 Sorry, I encountered an error while processing your message. Please try again later.');
    }
}

const updateConversationContext = (userId, message, state) => {
    if (!state.activeConversations.has(userId)) {
        state.activeConversations.set(userId, {
            messages: [],
            lastInteraction: new Date(),
            context: {}
        });
    }

    const conversation = state.activeConversations.get(userId);
    conversation.messages.push({ text: message, timestamp: new Date() });
    conversation.lastInteraction = new Date();

    if (conversation.messages.length > 10) conversation.messages = conversation.messages.slice(-10);
}

const generateResponse = async (messageText, userId, state) => {
    const { faqCorpus, activeConversations } = state;
    const inputWords = preprocessText(messageText).split(' ').filter(Boolean);

    if (inputWords.length === 0) {
        console.log(`⚠️ Empty processed message from ${userId}, using generic response`);
        return genericResponses[Math.floor(Math.random() * genericResponses.length)];
    }

    let bestMatch = { response: '', confidence: 0, category: '' };

    for (const [category, faq] of Object.entries(faqCorpus)) {
        let score = 0, maxScore = 0;
        
        for (const keyword of faq.keywords) {
            maxScore += 2;
            if (messageText.includes(keyword)) score += 2;
        }

        for (const word of inputWords) {
            for (const keyword of faq.keywords) {
                maxScore += 1;
                if (word === keyword) score += 1;
                else score += calculateSimilarity(word, keyword);
            }
        }

        const confidence = maxScore ? score / maxScore : 0;
        if (confidence > bestMatch.confidence) bestMatch = { response: faq.response, confidence, category };
    }

    if (bestMatch.confidence > 0.15) { 
        const greeting = getContextualGreeting(activeConversations.get(userId));
        return `${greeting}\n\n${bestMatch.response}`;
    } else {
        if (!userId.includes('status@broadcast') && messageText.length > 0) await logUnrecognizedQuery(messageText, userId, state);
        return genericResponses[Math.floor(Math.random() * genericResponses.length)];
    }
}