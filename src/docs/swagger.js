const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "NewBank Backend API",
      version: "1.0.0",
      description: "API MVP para analise de credito baseada em formulario mensal.",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local",
      },
    ],
  },
  apis: [path.join(__dirname, "../routes/*.js")],
};

module.exports = swaggerJsdoc(options);
