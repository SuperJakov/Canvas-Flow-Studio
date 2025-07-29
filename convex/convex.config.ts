import { defineApp } from "convex/server";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import migrations from "@convex-dev/migrations/convex.config";
import aggregate from "@convex-dev/aggregate/convex.config";
import workpool from "@convex-dev/workpool/convex.config";

const app = defineApp();
app.use(rateLimiter);
app.use(migrations);
app.use(aggregate, {
  name: "creditsAggregate",
});
app.use(workpool, {
  name: "imageDescription",
});

export default app;
