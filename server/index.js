const express = require("express");
const cors = require("cors");
const config = require("./config");
const healthRouter = require("./routes/health");
const documentsRouter = require("./routes/documents");
const chatRouter = require("./routes/chat");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", healthRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/chat", chatRouter);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
