import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import convertSnakeToCamel from "@/utils/convertSnakeToCamel";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const camelCaseBody: any = convertSnakeToCamel(body);
  const {
    actorId,
    actorName,
    group,
    action: { id: actionId, name: actionName },
    targetId,
    targetName,
    location,
    metadata,
  } = camelCaseBody;

  try {
    let action = await prisma.action.findUnique({ where: { id: actionId } });
    if (!action) {
      action = await prisma.action.create({
        data: {
          id: actionId,
          name: actionName,
        },
      });
    }
    const event = await prisma.event.create({
      data: {
        actorId,
        actorName,
        group,
        action: { connect: { id: actionId } },
        targetId,
        targetName,
        location,
        metadata,
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error creating event" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const search = searchParams.get("search") || "";
  const actorId = searchParams.get("actorId");
  const targetId = searchParams.get("targetId");
  const actionId = searchParams.get("actionId");

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const filters: any = {};
  if (search) {
    filters.OR = [
      { actorName: { contains: search } },
      { targetName: { contains: search } },
    ];
  }
  if (actorId) filters.actorId = actorId;
  if (targetId) filters.targetId = targetId;
  if (actionId) filters.actionId = actionId;

  try {
    const events = await prisma.event.findMany({
      where: filters,
      skip,
      take,
      include: { action: true },
    });
    const total = await prisma.event.count({ where: filters });
    return NextResponse.json(
      { events, total, page, pageSize },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching events" },
      { status: 500 }
    );
  }
}
