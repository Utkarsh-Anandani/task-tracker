import { NextRequest, NextResponse } from "next/server";

import { authenticate } from "@/middleware/auth.middleware";
import { authorize } from "@/middleware/role.middleware";

import { updateTaskSchema } from "@/schemas/task.schema";

import {
  updateTask,
  deleteTask,
} from "@/services/task.service";

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update task (Admin only)
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       description: Updated task data
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskUpdateInput'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Task not found
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = authenticate(req);
    const { id: taskId } = await context.params;

    authorize(user, ["ADMIN"]);

    const body = await req.json();

    const validated =
      updateTaskSchema.parse(body);

    const task = await updateTask(
      taskId,
      validated
    );

    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 403 }
    );
  }
}

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete task (Admin only)
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Task not found
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = authenticate(req);
    const { id: taskId } = await context.params;

    authorize(user, ["ADMIN"]);

    await deleteTask(taskId);

    return NextResponse.json({
      message: "Task deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 403 }
    );
  }
}
