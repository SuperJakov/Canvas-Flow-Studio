import { mutation } from "./_generated/server";
import TurndownService from "turndown";
import * as fs from "fs/promises";
import * as path from "path";
import React from "react";
import ReactDOMServer from "react-dom/server";

export const loadDocs = mutation({
  handler: async (ctx) => {
    const content = await getDocumentationContent();
    const existing = await ctx.db.query("docs").first();
    if (existing) {
      await ctx.db.patch(existing._id, { content });
    } else {
      await ctx.db.insert("docs", { content });
    }
  },
});

async function getDocumentationContent() {
  const contentDir = "src/app/docs/content";
  const files = await fs.readdir(contentDir);
  let allContent = "";
  const turndownService = new TurndownService();

  for (const file of files) {
    if (file.endsWith(".tsx")) {
      const filePath = path.join(process.cwd(), contentDir, file);
      const component = await import(filePath);
      const element = React.createElement(component.default);
      const html = ReactDOMServer.renderToString(element);
      const markdown = turndownService.turndown(html);
      allContent += markdown + "\n\n";
    }
  }

  return allContent;
}
