import prisma from "@/lib/prisma";

export async function createTask(
  title: string,
  content: string | undefined,
  userId: string
) {
  return prisma.task.create({
    data: {
      title,
      content,
      userId,
    },
  });
}

export async function getAllTasks() {
  return prisma.task.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
}

export async function updateTask(
  taskId: string,
  data: any
) {
  return prisma.task.update({
    where: { id: taskId },
    data,
  });
}

export async function deleteTask(taskId: string) {
  return prisma.task.delete({
    where: { id: taskId },
  });
}
