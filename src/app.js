const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");
const usersRoutes = require("./routes/users");
const financialDataRoutes = require("./routes/financialData");
const historyRoutes = require("./routes/history");
const scoresRoutes = require("./routes/scores");
const decisionsRoutes = require("./routes/decisions");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/openapi.json", (_req, res) => {
  res.status(200).json(swaggerSpec);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
