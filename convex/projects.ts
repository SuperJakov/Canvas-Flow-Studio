import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

    // TODO: also delete all whiteboards and sub-projects

    await ctx.db.delete(projectId);
  },
});
