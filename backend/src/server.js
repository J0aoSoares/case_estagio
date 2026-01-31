require("dotenv").config();

const app = require("./app");

const PORT = Number(process.env.PORT) || 3333;

app.listen(PORT, () => {
  console.log(`✅ API rodando em http://localhost:${PORT}`);
});
