import path from "path";
import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Task Management API",
      version: "1.0.0",
    },

    servers: [
      {
        url: "http://localhost:3000/api/v1",
      },
      {
        url: "https://task-tracker-utkarsh-anandanis-projects.vercel.app/api/v1",
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT access token",
        },
      },

      schemas: {
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: {
              type: "string",
              example: "John Doe",
            },
            email: {
              type: "string",
              example: "john@email.com",
            },
            password: {
              type: "string",
              example: "password123",
            },
          },
        },

        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              example: "john@email.com",
            },
            password: {
              type: "string",
              example: "password123",
            },
          },
        },

        TaskInput: {
          type: "object",
          required: ["title"],
          properties: {
            title: {
              type: "string",
              example: "Complete assignment",
            },
            content: {
              type: "string",
              example: "Finish backend API",
            },
          },
        },

        TaskUpdateInput: {
          type: "object",
          properties: {
            title: {
              type: "string",
              example: "Updated task",
            },
            content: {
              type: "string",
              example: "Updated content",
            },
            completed: {
              type: "boolean",
              example: true,
            },
          },
        },

        AuthResponse: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              example: "jwt_access_token",
            },
            refreshToken: {
              type: "string",
              example: "jwt_refresh_token",
            },
          },
        },

        ErrorResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Unauthorized",
            },
          },
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [path.join(process.cwd(), "app/api/v1/**/*.ts"), path.join(process.cwd(), "app/api/v1/**/*.js")],
});
