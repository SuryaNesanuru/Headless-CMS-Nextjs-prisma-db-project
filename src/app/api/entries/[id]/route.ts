import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { triggerWebhooks } from "@/lib/webhooks";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entry = await prisma.contentEntry.findUnique({
      where: { id },
      include: {
        model: { select: { name: true, slug: true, fields: true } },
        createdBy: { select: { name: true } },
      },
    });
    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: "Failed to fetch entry" }, { status: 500 });
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
    const { data, status, scheduledAt } = body;

    const existing = await prisma.contentEntry.findUnique({
      where: { id },
      include: { model: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (data) updateData.data = data;
    if (status) {
      updateData.status = status;
      if (status === "PUBLISHED" && existing.status !== "PUBLISHED") {
        updateData.publishedAt = new Date();
      }
    }
    if (scheduledAt !== undefined) {
      updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    }
    updateData.version = existing.version + 1;

    const entry = await prisma.contentEntry.update({
      where: { id },
      data: updateData,
      include: { model: { select: { slug: true } } },
    });

    if (status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      await triggerWebhooks("content.published", entry.model.slug, entry.id, data || existing.data as Record<string, unknown>);
    } else if (data) {
      await triggerWebhooks("content.updated", entry.model.slug, entry.id, data);
    }

    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "VIEWER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const entry = await prisma.contentEntry.findUnique({
      where: { id },
      include: { model: { select: { slug: true } } },
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    await prisma.contentEntry.delete({ where: { id } });
    await triggerWebhooks("content.deleted", entry.model.slug, id, entry.data as Record<string, unknown>);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
