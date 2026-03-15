import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const webhooks = await prisma.webhook.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { logs: true } } },
    });
    return NextResponse.json(webhooks);
  } catch {
    return NextResponse.json({ error: "Failed to fetch webhooks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { name, url, events, secret } = await req.json();

    const webhook = await prisma.webhook.create({
      data: {
        name,
        url,
        events: events || ["content.published", "content.updated", "content.deleted"],
        secret: secret || null,
      },
    });

    return NextResponse.json(webhook, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create webhook" }, { status: 500 });
  }
}
