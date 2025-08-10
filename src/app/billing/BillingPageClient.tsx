"use client";

import { useConvexQuery } from "~/helpers/convex";
import { api } from "convex/_generated/api";
import Loading from "../loading";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default function BillingPageClient() {
  const creditCycle = useConvexQuery(api.users.getUserCreditCycle, {});

  if (creditCycle === undefined) {
    return <Loading />;
  }

  if (creditCycle === null) {
    return <div>User not found</div>;
  }

  const { plan, nextRefillDate, credits } = creditCycle || {};
  const { image = 0, speech = 0, website = 0 } = credits || {};

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Billing & Credits</h1>
      <div className="p-4 border rounded-lg shadow-md w-1/2">
        <h2 className="text-2xl font-semibold mb-2">Current Plan: {plan ?? 'Free'}</h2>
        {nextRefillDate && (
          <p className="text-muted-foreground">
            Next credit refill: {new Date(nextRefillDate).toLocaleDateString()}
          </p>
        )}
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Your Credits</h3>
          <ul className="list-disc list-inside">
            <li>Image Credits: {image}</li>
            <li>Speech Credits: {speech}</li>
            <li>Website Credits: {website}</li>
          </ul>
        </div>
        <Link href="/pricing">
          <Button className="mt-4">Upgrade Plan</Button>
        </Link>
      </div>
    </div>
  );
}
