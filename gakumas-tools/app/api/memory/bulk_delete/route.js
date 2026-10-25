import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/utils/auth";
import { connect } from "@/utils/mongodb";
import { isObjectIdList, readJsonBody } from "@/utils/apiValidation";

const MAX_BODY_BYTES = 200_000;

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;

  const { body, error, status } = await readJsonBody(request, MAX_BODY_BYTES);
  if (error) return new Response(error, { status });
  if (!isObjectIdList(body.ids)) {
    return new Response("Invalid ids", { status: 400 });
  }

  const { db } = await connect();
  const { deletedCount } = await db.collection("memories").deleteMany({
    userId,
    _id: { $in: body.ids.map((id) => new ObjectId(id)) },
  });

  return Response.json({ deletedCount });
}
