import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { internalMutation } from "./functions";
import type { Tier } from "~/Types/stripe";

function getProjectCountLimitForTier(tier: Tier) {
  switch (tier) {
    case "Free":
      return 5;
    case "Plus":
      return 50;
    case "Pro":
      return 200;
    default:
      throw new Error(`Unknown tier: ${String(tier)}`);
  }
}

export const getProjectCountLimit = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userPlanInfo = await ctx.runQuery(api.users.getCurrentUserPlanInfo);
    if (!userPlanInfo) throw new Error("User not found");

    const maxProjects = getProjectCountLimitForTier(userPlanInfo.plan);

    const usersProjects = await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userExternalId", identity.subject))
      .collect();

    return {
      maxProjectCount: maxProjects,
      currentProjectCount: usersProjects.length,
    };
  },
});

export const getProjects = query({
  args: {
    projectId: v.optional(v.id("projects")), // undefined = root,
  },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const projectsForUser = await ctx.db
      .query("projects")
      .withIndex("by_user_and_parent", (q) =>
        q.eq("userExternalId", identity.subject).eq("parentProject", projectId),
      )
      .order("desc")
      .collect();

    return projectsForUser;
  },
});

export const getProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const project = await ctx.db
      .query("projects")
      .withIndex("by_id", (q) => q.eq("_id", projectId))
      .unique();

    return project;
  },
});

export const normalizeProjectIds = query({
  args: {
    projectIds: v.array(v.string()),
  },
  handler: async (ctx, { projectIds }) => {
    return projectIds.map((projectId) => {
      const normalizedId = ctx.db.normalizeId("projects", projectId);
      if (!normalizedId) throw new Error("Project ID could not be normalized");
      return normalizedId;
    });
  },
});

export const createProject = mutation({
  args: {
    name: v.string(),
    parentProject: v.optional(v.id("projects")),
  },
  handler: async (ctx, { name, parentProject }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const { currentProjectCount, maxProjectCount } = await ctx.runQuery(
      api.projects.getProjectCountLimit,
    );

    if (currentProjectCount + 1 > maxProjectCount) {
      throw new Error(
        `You have reached the limit of ${maxProjectCount} projects for your plan.
      Delete some projects or upgrade your plan.`,
      );
    }

    const project = await ctx.db.insert("projects", {
      name,
      userExternalId: identity.subject,
      parentProject,
    });

    return project;
  },
});

export const editProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
  },
  handler: async (ctx, { projectId, name }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existingProject = await ctx.db.get(projectId);
    if (!existingProject) throw new Error("Project not found");

    if (existingProject.userExternalId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(projectId, { name });
  },
});

export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existingProject = await ctx.db.get(projectId);
    if (!existingProject) throw new Error("Project not found");

    if (existingProject.userExternalId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.runMutation(internal.projects.deleteProjectInternal, {
      projectId: projectId,
      userId: identity.subject,
    });
  },
});

export const deleteProjectInternal = internalMutation({
  args: {
    projectId: v.id("projects"),
    userId: v.string(),
  },
  handler: async (ctx, { projectId, userId }) => {
    const associatedWhiteboards = await ctx.db
      .query("whiteboards")
      .withIndex("by_projectId_and_ownerId", (q) =>
        q.eq("projectId", projectId).eq("ownerId", userId),
      )
      .collect();
    for (const whiteboard of associatedWhiteboards) {
      await ctx.scheduler.runAfter(
        0,
        internal.whiteboards.deleteWhiteboardInternal,
        {
          id: whiteboard._id,
          userId: userId,
        },
      );
    }
    const associatedProjects = await ctx.db
      .query("projects")
      .withIndex("by_user_and_parent", (q) =>
        q.eq("userExternalId", userId).eq("parentProject", projectId),
      )
      .collect();
    for (const project of associatedProjects) {
      await ctx.scheduler.runAfter(0, internal.projects.deleteProjectInternal, {
        projectId: project._id,
        userId: userId,
      });
    }

    await ctx.db.delete(projectId);
  },
});
