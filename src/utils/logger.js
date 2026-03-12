function LOGGER(type = 'log') {
   if (process.env.LOGGING === 'disabled') return;

   const index = !types.includes(type) ? 0 : 1;

   const messages = Array.prototype.slice.call(arguments, index);

   switch (type) {
      case 'log':
         console.log(`[${new Date().toISOString()}] [INFO]`, ...messages);
         break;

      case 'warn':
         console.warn(`[${new Date().toISOString()}] [WARN]`, ...messages);
         break;

      case 'error':
         console.error(`[${new Date().toISOString()}] [ERROR]`, ...messages);
         break;

      case 'info':
         console.info(`[${new Date().toISOString()}] [INFO]`, ...messages);
         break;

      default:
         console.log(`[${new Date().toISOString()}] [INFO]`, ...messages);
         break;
   }
}

const types = ['log', 'info', 'warn', 'error'];

export default LOGGER;
