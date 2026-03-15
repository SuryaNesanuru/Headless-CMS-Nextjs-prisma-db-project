import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const media = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      include: { uploadedBy: { select: { name: true } } },
    });
    return NextResponse.json(media);
  } catch {
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "VIEWER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadsDir, uniqueName);
    await writeFile(filePath, buffer);

    const media = await prisma.media.create({
      data: {
        filename: file.name,
        url: `/uploads/${uniqueName}`,
        mimeType: file.type,
        size: file.size,
        uploadedById: session.user.id,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
