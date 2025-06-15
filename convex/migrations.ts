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
