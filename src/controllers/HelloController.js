
const sayHello = (req, res) => {
    return res.json({ mensagem: "Olá, mundo! Agora vindo do Controller." });
};

module.exports = { sayHello };