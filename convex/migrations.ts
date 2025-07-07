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

export const removeSpeechUrlField = migrations.define({
  table: "whiteboards",
  migrateOne: async (ctx, doc) => {
    let hasChanges = false;

    const updatedNodes = doc.nodes.map((node) => {
      if (node.type === "speech" && "speechUrl" in node.data) {
        hasChanges = true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { speechUrl, ...restData } = node.data;
        return {
          ...node,
          data: restData,
        };
      }
      return node;
    });

    // Only update if there were actual changes
    if (hasChanges) {
      await ctx.db.patch(doc._id, {
        nodes: updatedNodes,
      });
    }
  },
});

export const runRemoveSpeechUrlField = migrations.runner(
  internal.migrations.removeSpeechUrlField,
);

export const removeIsRunningState = migrations.define({
  table: "whiteboards",
  migrateOne: async (ctx, doc) => {
    const updatedNodes = doc.nodes.map((node) => {
      switch (node.type) {
        case "image": {
          if ("isRunning" in node.data) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { isRunning, ...restData } = node.data;
            return {
              ...node,
              data: restData,
            };
          }
          break;
        }
        case "textEditor": {
          if ("isRunning" in node.data) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { isRunning, ...restData } = node.data;
            return {
              ...node,
              data: restData,
            };
          }
          break;
        }
        case "instruction": {
          if ("isRunning" in node.data) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { isRunning, ...restData } = node.data;
            return {
              ...node,
              data: restData,
            };
          }
          break;
        }
        case "speech": {
          if ("isRunning" in node.data) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { isRunning, ...restData } = node.data;
            return {
              ...node,
              data: restData,
            };
          }
          break;
        }
        default:
          break;
      }
      // Return unchanged node if no modifications were made
      return node;
    });

    // Update the document with the modified nodes array
    await ctx.db.patch(doc._id, {
      nodes: updatedNodes,
    });
  },
});

export const runRemoveIsRunningState = migrations.runner(
  internal.migrations.removeIsRunningState,
);
