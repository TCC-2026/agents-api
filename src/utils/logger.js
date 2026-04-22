const types = ['log', 'info', 'warn', 'error'];

function LOGGER(type = 'log') {
    if (process.env.LOGGING === 'disabled') return;

    const isKnownType = types.includes(type);
    const index = !isKnownType ? 0 : 1;
    const actualType = !isKnownType ? 'log' : type;

    const rawMessages = Array.prototype.slice.call(arguments, index);
    const timestamp = new Date().toISOString();

    const safeMessages = rawMessages.map((msg) => {
        if (msg instanceof Error) {
            return JSON.stringify({
                error_name: msg.name,
                error_message: msg.message,
                stack: msg.stack
            });
        }
        if (typeof msg === 'object' && msg !== null) {
            return JSON.stringify(msg);
        }
        return msg;
    });

    switch (actualType) {
        case 'log':
            console.log(`[${timestamp}] [INFO]`, ...safeMessages);
            break;
        case 'warn':
            console.warn(`[${timestamp}] [WARN]`, ...safeMessages);
            break;
        case 'error':
            console.error(`[${timestamp}] [ERROR]`, ...safeMessages);
            break;
        case 'info':
            console.info(`[${timestamp}] [INFO]`, ...safeMessages);
            break;
    }
}

export default LOGGER;
