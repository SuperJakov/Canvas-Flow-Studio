import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "refill_free_credits",
  { hourUTC: 0, minuteUTC: 0 }, // Run every day at midnight UTC
  internal.credits.refillFreeCredits,
);

export default crons;
