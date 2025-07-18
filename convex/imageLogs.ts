// ! These queries should be called from the dashboard
import { v } from "convex/values";
import { internalMutation } from "./functions";
import { internalQuery } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { imageLogFields } from "./schema";
// Constants
const outputTokens = {
  low: {
    "1024x1024": 272,
    "1024x1536": 408,
    "1536x1024": 400,
  },
  medium: {
    "1024x1024": 1056,
    "1024x1536": 1584,
    "1536x1024": 1568,
  },
  high: {
    "1024x1024": 4160,
    "1024x1536": 6240,
    "1536x1024": 6208,
  },
} as const;

const PRICE_PER_OUTPUT_TOKEN = 40 / 1e6; // $
const PRICE_PER_IMAGE_INPUT_TOKEN = 10 / 1e6; // $
const PRICE_PER_TEXT_INPUT_TOKEN = 5 / 1e6; // $

const TOKENS_IN_IMAGE_INPUT = { "gpt-image-1": 194 } as const;
const ESTIMATED_TOKENS_IN_TEXT_INPUT = 200;

// USD to EUR conversion (July 2025 avg): 1 USD = 0.8484 EUR
const USD_TO_EUR = 0.85;

type ImageLog = Doc<"imageLogs">;

// Helper: compute USD cost for a single log entry
function costUsdForLog(log: ImageLog): number {
  if (log.inputTokenDetails?.textTokens) {
    // Newer implementation
    let price = 0;
    price += log.inputTokenDetails.textTokens * PRICE_PER_TEXT_INPUT_TOKEN;
    price += outputTokens[log.quality][log.resolution] * PRICE_PER_OUTPUT_TOKEN;

    // Image edit
    price +=
      (log.inputTokenDetails.imageTokens ?? 0) * PRICE_PER_IMAGE_INPUT_TOKEN;

    return price;
  }

  let price = 0;
  // Base output token cost
  const outputCost =
    outputTokens[log.quality][log.resolution] * PRICE_PER_OUTPUT_TOKEN;
  price += outputCost;

  // Text input token cost
  const textCost = PRICE_PER_TEXT_INPUT_TOKEN * ESTIMATED_TOKENS_IN_TEXT_INPUT;
  price += textCost;

  // Image input token cost for edit actions
  if (log.action === "edit") {
    const imageInputCost =
      TOKENS_IN_IMAGE_INPUT["gpt-image-1"] * PRICE_PER_IMAGE_INPUT_TOKEN;
    price += imageInputCost;
  }

  return price;
}

// Mutation: Log image generation or edit events
export const logGeneration = internalMutation({
  args: imageLogFields,
  handler: async (ctx, args) => {
    console.log("logGeneration called with args:", args);
    await ctx.db.insert("imageLogs", args);
    console.log("Inserted log into imageLogs");
  },
});

// Query: Calculate cost for a specific user
export const calculateImageCost = internalQuery({
  args: {
    userExternalId: v.string(),
  },
  handler: async (ctx, { userExternalId }) => {
    console.log(`calculateImageCost called for user: ${userExternalId}`);
    const logs = await ctx.db
      .query("imageLogs")
      .withIndex("by_userId", (q) => q.eq("userExternalId", userExternalId))
      .collect();
    console.log(`Fetched ${logs.length} logs for user ${userExternalId}`);

    let totalUsd = 0;
    for (const log of logs) {
      totalUsd += costUsdForLog(log);
    }
    console.log(`Total USD before conversion: $${totalUsd.toFixed(6)}`);

    const totalEur = totalUsd * USD_TO_EUR;
    console.log(`Total EUR after conversion: €${totalEur.toFixed(6)}`);

    return { totalUsd, totalEur };
  },
});

// Query: Calculate cost app-wide
export const calculateImageCostForApp = internalQuery({
  handler: async (ctx) => {
    console.log("calculateImageCostForApp called");
    const logs = await ctx.db.query("imageLogs").collect();
    console.log(`Fetched ${logs.length} total logs`);

    let totalUsd = 0;
    for (const log of logs) {
      totalUsd += costUsdForLog(log);
    }
    console.log(
      `App-wide total USD before conversion: $${totalUsd.toFixed(6)}`,
    );

    const totalEur = totalUsd * USD_TO_EUR;
    console.log(`App-wide total EUR after conversion: €${totalEur.toFixed(6)}`);

    return { totalUsd, totalEur };
  },
});
