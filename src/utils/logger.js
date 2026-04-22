function LOGGER(type = 'info', message = '', details = null) {
    if (process.env.LOGGING === 'disabled') return;

    const timestamp = new Date().toISOString();
    let jsonDetails = '';

    // 3º Parâmetro: Sempre transforma em JSON, independente do que seja
    if (details !== null && details !== undefined) {
        // Se for um Erro (nativo ou do Prisma), extrai as propriedades antes do JSON.stringify
        if (details instanceof Error || (details.message && details.stack)) {
            jsonDetails = JSON.stringify({
                error_name: details.name || 'Error',
                error_message: details.message,
                stack_trace: details.stack
            });
        }
        // Se for qualquer outra coisa (Objeto, String, JSON do Twilio, Número), só stringifica direto
        else {
            jsonDetails = JSON.stringify(details);
        }
    }

    // Monta a string final perfeitinha
    const finalLog = `[${timestamp}] [${type.toUpperCase()}] ${message} ${jsonDetails}`.trim();

    // Dispara para o console correto
    switch (type) {
        case 'error':
            console.error(finalLog);
            break;
        case 'warn':
            console.warn(finalLog);
            break;
        case 'info':
        case 'log':
        default:
            console.info(finalLog);
            break;
    }
}

export default LOGGER;
