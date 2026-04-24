import LOGGER from './utils/logger.js';
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    LOGGER('info', `Servidor rodando na porta ${PORT}`);
});
