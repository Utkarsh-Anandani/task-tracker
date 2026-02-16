export const swaggerSpec = {
    openapi: "3.0.0",

    info: {
      title: "Task Management API",
      version: "1.0.0",
    },

    paths: {
      "/auth/login": {
        post: {
          summary: "Login user and return tokens.",
          tags: ["Auth"],
          security: [],
          requestBody: {
            required: true,
            description: "User login credentials",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LoginInput",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Successful login",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/AuthResponse",
                  },
                },
              },
            },
            "401": {
              description: "Invalid credentials",
            },
          },
        },
      },

      "/auth/refresh": {
        post: {
          summary: "Generate new access token using refresh token",
          tags: ["Auth"],
          security: [],
          requestBody: {
            required: true,
            description: "Refresh token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["refreshToken"],
                  properties: {
                    refreshToken: {
                      type: "string",
                      example: "your_refresh_token",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "New access token generated",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/AuthResponse",
                  },
                },
              },
            },
            "401": {
              description: "Invalid refresh token",
            },
          },
        },
      },

      "/auth/register": {
        post: {
          summary: "Register a new user",
          tags: ["Auth"],
          security: [],
          requestBody: {
            required: true,
            description: "User registration details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RegisterInput",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "User registered successfully",
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },

      "/tasks": {
        get: {
          summary: "Get all tasks",
          description: "Both USER and ADMIN can view tasks",
          tags: ["Tasks"],
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "List of tasks",
            },
            "401": {
              description: "Unauthorized",
            },
          },
        },

        post: {
          summary: "Create task (Admin only)",
          description: "Only ADMIN users can create tasks",
          tags: ["Tasks"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            description: "Task details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TaskInput",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Task created successfully",
            },
            "401": {
              description: "Unauthorized (missing or invalid token)",
            },
            "403": {
              description: "Forbidden (User is not admin)",
            },
            "400": {
              description: "Validation error",
            },
          },
        },
      },

      "/tasks/{id}": {
        put: {
          summary: "Update task (Admin only)",
          tags: ["Tasks"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              description: "Task ID",
              schema: {
                type: "string",
              },
            },
          ],
          requestBody: {
            required: true,
            description: "Updated task data",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TaskUpdateInput",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Task updated successfully",
            },
            "401": {
              description: "Unauthorized",
            },
            "403": {
              description: "Admin access required",
            },
            "404": {
              description: "Task not found",
            },
          },
        },

        delete: {
          summary: "Delete task (Admin only)",
          tags: ["Tasks"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              description: "Task ID",
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "Task deleted successfully",
            },
            "401": {
              description: "Unauthorized",
            },
            "403": {
              description: "Admin access required",
            },
            "404": {
              description: "Task not found",
            },
          },
        },
      },
    },

    servers: [
      {
        url: "http://localhost:3000/api/v1",
      },
      {
        url: "https://task-tracker-utkarsh-anandanis-projects.vercel.app/api/v1",
      },
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
};
