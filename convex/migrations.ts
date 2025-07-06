import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api.js";
import type { DataModel } from "./_generated/dataModel";

export const migrations = new Migrations<DataModel>(components.migrations);
export const run = migrations.runner();

export const makeIsPublicDefaultFalse = migrations.define({
  table: "whiteboards",
  migrateOne: async (ctx, doc) => {
    if (doc.isPublic === undefined) {
      await ctx.db.patch(doc._id, { isPublic: false });
    }
  },
});
export const runIsPublicDefaultFalseMigration = migrations.runner(
  internal.migrations.makeIsPublicDefaultFalse,
);

export const setAuthorExternalId = migrations.define({
  table: "imageNodes",
  migrateOne: async (ctx, doc) => {
    const whiteboardId = doc.whiteboardId;
    const whiteboard = await ctx.db
      .query("whiteboards")
      .withIndex("by_id", (q) => q.eq("_id", whiteboardId))
      .unique();
    if (!whiteboard)
      throw new Error("Image node tied to a whiteboard that doesn't exist");
    await ctx.db.patch(doc._id, {
      authorExternalId: whiteboard.ownerId,
    });
  },
});

export const runSetAuthorExternalId = migrations.runner(
  internal.migrations.setAuthorExternalId,
);
