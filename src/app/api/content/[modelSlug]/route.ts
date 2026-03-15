import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ modelSlug: string }> }
) {
  try {
    const { modelSlug } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const filter = searchParams.get("filter");

    const model = await prisma.contentModel.findUnique({
      where: { slug: modelSlug },
    });

    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    const where: Record<string, unknown> = {
      modelId: model.id,
      status: "PUBLISHED",
    };

    if (filter) {
      try {
        const filterObj = JSON.parse(filter);
        where.data = { path: Object.keys(filterObj), equals: Object.values(filterObj)[0] };
      } catch {
        // Ignore invalid filter
      }
    }

    const [entries, total] = await Promise.all([
      prisma.contentEntry.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          createdBy: { select: { name: true } },
        },
      }),
      prisma.contentEntry.count({ where }),
    ]);

    const data = entries.map((entry) => ({
      id: entry.id,
      ...(entry.data as Record<string, unknown>),
      author: entry.createdBy.name,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      publishedAt: entry.publishedAt,
    }));

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}
