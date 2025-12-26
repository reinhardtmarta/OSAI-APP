const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());           // permite seu frontend chamar
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/perguntar', async (req, res) => {
  try {
    const { pergunta } = req.body;

    if (!pergunta) {
      return res.status(400).json({ erro: "Manda uma pergunta aí!" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(pergunta);
    const resposta = result.response.text();

    res.json({ resposta });
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ erro: "Deu ruim no Gemini", detalhes: erro.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend Gemini ligado na porta ${PORT} 🚀`);
});
