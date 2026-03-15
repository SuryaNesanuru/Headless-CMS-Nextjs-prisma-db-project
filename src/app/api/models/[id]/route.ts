import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

const fieldSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["text", "number", "boolean", "richText", "image", "date", "array", "select"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  defaultValue: z.any().optional(),
});

const updateModelSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  fields: z.array(fieldSchema).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const model = await prisma.contentModel.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true } },
        _count: { select: { entries: true } },
      },
    });
    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }
    return NextResponse.json(model);
  } catch {
    return NextResponse.json({ error: "Failed to fetch model" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "VIEWER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const data = updateModelSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.fields) updateData.fields = data.fields;

    const model = await prisma.contentModel.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(model);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update model" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.contentModel.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete model" }, { status: 500 });
  }
}
