import path from 'path';
import { promises as fs } from 'fs';


const logPath = path.resolve('src/bot/unrecognized_queries.json');

export const logUnrecognizedQuery = async (query, userId, state) => {
    if (!query || query.trim() === '' || userId.includes('status@broadcast') ||userId.includes('@g.us')) return; 

    const entry = {
        query,
        userId,
        timestamp: new Date().toISOString(),
        context: state.activeConversations.get(userId)?.messages.slice(-3) || []
    };

    state.unrecognizedQueries.push(entry);

    if (state.unrecognizedQueries.length > 1000) state.unrecognizedQueries = state.unrecognizedQueries.slice(-500);

    try {
        await fs.writeFile(logPath, JSON.stringify(state.unrecognizedQueries, null, 2));
    } catch (err) {
        console.error(`❌ Error saving unrecognized query: ${ err.message }`);
    }

    console.log(`📝 Unrecognized query logged for user ${ userId }: ${ query }`);
}