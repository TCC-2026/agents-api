import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
    const chatCompletion = await getGroqChatCompletion();
    // Print the completion returned by the LLM.
    console.log(chatCompletion.choices[0]?.message?.content || '');
}

async function getGroqChatCompletion() {
    return groq.chat.completions.create({
        messages: [
            {
                role: 'user',
                content: 'Como posso sacar meu FGTS?'
            }
        ],
        model: 'llama-3.3-70b-versatile'
    });
}

main().catch((error) => {
    console.error('Error:', error);
});
