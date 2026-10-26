import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/utils/auth";
import { connect } from "@/utils/mongodb";
import { cleanMemory, isObjectId, readJsonBody } from "@/utils/apiValidation";

const MAX_BODY_BYTES = 20_000;

export async function PUT(request, { params: routeParams }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;

  const { id: rawId } = await routeParams;
  if (!isObjectId(rawId)) return new Response("Invalid id", { status: 400 });
  const id = new ObjectId(rawId);
  const { body, error, status } = await readJsonBody(request, MAX_BODY_BYTES);
  if (error) return new Response(error, { status });
  const memory = cleanMemory(body);
  if (!memory) return new Response("Invalid memory", { status: 400 });

  const { db } = await connect();
  const { matchedCount } = await db
    .collection("memories")
    .updateOne({ _id: id, userId }, { $set: { userId, ...memory } });
  if (!matchedCount) return new Response("Not found", { status: 404 });

  return Response.json({ id });
}
