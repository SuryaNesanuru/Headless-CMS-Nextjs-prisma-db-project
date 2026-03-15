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

const modelSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(fieldSchema).min(1),
});

export async function GET() {
  try {
    const models = await prisma.contentModel.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { name: true } },
        _count: { select: { entries: true } },
      },
    });
    return NextResponse.json(models);
  } catch {
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role === "VIEWER") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, fields } = modelSchema.parse(body);

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await prisma.contentModel.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A model with this name already exists" }, { status: 400 });
    }

    const model = await prisma.contentModel.create({
      data: {
        name,
        slug,
        description: description || null,
        fields: fields as any,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(model, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create model" }, { status: 500 });
  }
}
