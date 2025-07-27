import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { TableAggregate } from "@convex-dev/aggregate";

export const creditsAggregate = new TableAggregate<{
  Key: [string, string]; // [userId, creditType]
  DataModel: DataModel;
  TableName: "transactions";
}>(components.creditsAggregate, {
  sortKey: (doc) => [doc.userId, doc.creditType],
  sumValue: (doc) => doc.amount,
});
