import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { triggerWebhooks } from "@/lib/webhooks";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const modelId = searchParams.get("modelId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const where: Record<string, unknown> = {};
    if (modelId) where.modelId = modelId;
    if (status) where.status = status.toUpperCase();

    const [entries, total] = await Promise.all([
      prisma.contentEntry.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          model: { select: { name: true, slug: true } },
          createdBy: { select: { name: true } },
        },
      }),
      prisma.contentEntry.count({ where }),
    ]);

    return NextResponse.json({
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "VIEWER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { modelId, data, status, scheduledAt } = body;

    if (!modelId || !data) {
      return NextResponse.json({ error: "modelId and data are required" }, { status: 400 });
    }

    const model = await prisma.contentModel.findUnique({ where: { id: modelId } });
    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    const entryStatus = status || "DRAFT";
    const entry = await prisma.contentEntry.create({
      data: {
        modelId,
        data,
        status: entryStatus,
        publishedAt: entryStatus === "PUBLISHED" ? new Date() : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdById: session.user.id,
      },
      include: {
        model: { select: { name: true, slug: true } },
      },
    });

    if (entryStatus === "PUBLISHED") {
      await triggerWebhooks("content.published", model.slug, entry.id, data);
    }

    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
  }
}
