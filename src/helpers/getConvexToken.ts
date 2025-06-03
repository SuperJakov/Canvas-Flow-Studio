import { auth } from "@clerk/nextjs/server";

export async function getConvexToken() {
  const startTime = Date.now();

  const token = await (await auth()).getToken({ template: "convex" });

  const endTime = Date.now();
  console.log(`getConvexToken took ${endTime - startTime} ms`);

  return token ?? undefined;
}
