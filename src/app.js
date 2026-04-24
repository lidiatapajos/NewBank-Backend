const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");
const usersRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const financialDataRoutes = require("./routes/financialData");
const historyRoutes = require("./routes/history");
const scoresRoutes = require("./routes/scores");
const decisionsRoutes = require("./routes/decisions");
const { tooManyRequests } = require("./utils/http");

const app = express();

if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

app.use(cors());
app.use(helmet());
app.use(express.json());

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => tooManyRequests(res, "muitas tentativas, tente novamente mais tarde"),
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/openapi.json", (_req, res) => {
  res.status(200).json(swaggerSpec);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRateLimit, authRoutes);
app.use("/users", usersRoutes);
app.use("/financial-data", financialDataRoutes);
app.use("/history", historyRoutes);
app.use("/scores", scoresRoutes);
app.use("/decisions", decisionsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);

  if (res.headersSent) {
    return;
  }

  res.status(500).json({
    error: "internal_server_error",
    message: "An unexpected error occurred",
  });
});

module.exports = app;
