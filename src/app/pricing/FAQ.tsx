import React from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

const faqItems = [
  {
    question: "What's included in the Free tier?",
    answer:
      "The Free tier includes access to all core features with limits on whiteboards (5), nodes per whiteboard (10), and monthly AI operations. It's perfect for learning and experimenting.",
  },
  {
    question: "How do Plus and Pro tiers differ from Free?",
    answer:
      "Plus and Pro offer increased limits on whiteboards, nodes, and AI operations. Plus includes priority support and beta features, while Pro adds workflow history, versioning, and unlimited* whiteboards.",
  },
  {
    question: "What AI models are available?",
    answer: "To know more about this, read the docs.",
  },
  {
    question: "How do rate limits work?",
    answer:
      "Each subscription tier has monthly limits for operations like image generation, text analysis, and API integrations. Unused operations don't carry over to the next month. ",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Yes, you can change plans at any time. Upgrades take effect immediately, while downgrades apply at your next billing cycle.",
  },
  {
    question: "How is billing handled?",
    answer:
      "We use Stripe for secure payment processing. All paid plans are subscription-based with automatic monthly billing. You can cancel anytime on this page.",
  },
  {
    question: "What are credits and how do they work?",
    answer:
      "Credits are the currency for AI operations like text, image, and speech generation. Each plan includes monthly credits, with higher quality models using more credits.",
  },
];

export default function FAQ() {
  return (
    <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">
            <span className="from-primary to-secondary bg-gradient-to-r bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          <p className="text-muted-foreground mt-3">
            Everything you need to know
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {faqItems.map((faq, idx) => (
            <Card
              key={idx}
              className="hover:bg-card/80 gap-1 transition-all hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <h3 className="flex items-center text-lg font-semibold">
                  <span className="bg-primary mr-3 h-2 w-2 rounded-full"></span>
                  {faq.question}
                </h3>
              </CardHeader>
              <CardContent className="pt-0">
                <p>{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-muted-foreground mt-8 text-center text-sm">
          *Unlimited access is subject to abuse guardrails.
        </div>
      </div>
    </section>
  );
}
