export const getContextualGreeting = (conversation) => {
    const count = conversation?.messages.length || 0;
    
    if (count === 1) return '👋 Hi! Thanks for contacting us';
    if (count < 5) return '😊 Perfect! I help you with the following information: ';
    
    return '🤝 We continue with your inquiry: ';
};

export const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};