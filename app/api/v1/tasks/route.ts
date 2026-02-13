import { NextRequest, NextResponse } from "next/server";

import { authenticate } from "@/middleware/auth.middleware";
import { authorize } from "@/middleware/role.middleware";

import {
  createTaskSchema,
} from "@/schemas/task.schema";

import {
  createTask,
  getAllTasks,
} from "@/services/task.service";

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     description: Both USER and ADMIN can view tasks
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *       401:
 *         description: Unauthorized
 */
export async function GET(req: NextRequest) {
  try {
    authenticate(req);

    const tasks = await getAllTasks();

    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 401 }
    );
  }
}

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create task (Admin only)
 *     description: Only ADMIN users can create tasks
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Task details
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       201:
 *         description: Task created successfully
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (User is not admin)
 *       400:
 *         description: Validation error
 */
export async function POST(req: NextRequest) {
  try {
    const user = authenticate(req);

    authorize(user, ["ADMIN"]);

    const body = await req.json();

    const validated =
      createTaskSchema.parse(body);

    const task = await createTask(
      validated.title,
      validated.content,
      user.userId
    );

    return NextResponse.json(task, {
      status: 201,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 403 }
    );
  }
}
