import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ modelSlug: string; entryId: string }> }
) {
  try {
    const { modelSlug, entryId } = await params;

    const model = await prisma.contentModel.findUnique({
      where: { slug: modelSlug },
    });

    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    const entry = await prisma.contentEntry.findFirst({
      where: {
        id: entryId,
        modelId: model.id,
        status: "PUBLISHED",
      },
      include: {
        createdBy: { select: { name: true } },
      },
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: entry.id,
      ...(entry.data as Record<string, unknown>),
      author: entry.createdBy.name,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      publishedAt: entry.publishedAt,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}
