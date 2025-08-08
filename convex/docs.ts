import { query } from "./_generated/server";

export const getDocsContent = query({
  handler: async (ctx) => {
    const doc = await ctx.db.query("docs").first();
    return doc?.content;
  },
});
