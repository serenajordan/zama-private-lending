import { GradientHeader } from "@/components/gradient-header"
import { GlassCard } from "@/components/glass-card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqItems = [
  {
    question: "Do you decrypt on-chain?",
    answer: "No. Contracts never decrypt. Decrypt happens only in tests/dev.",
  },
  {
    question: "How do I view my balance?",
    answer: "Add a viewer public key; the app requests re-encryption to your key and decrypts locally.",
  },
  {
    question: "What networks are supported?",
    answer: "fhEVM devnets today; more networks soon.",
  },
  {
    question: "What data is private?",
    answer: "User-sensitive values like balances, debts, health factor, and risk checks.",
  },
  {
    question: "What happens on liquidation?",
    answer: "The contract evaluates an encrypted health factor and allows liquidations only when below the threshold.",
  },
  {
    question: "Is this audited?",
    answer: "Audits are planned; guardrails and tests run on every PR.",
  },
]

export function FAQ() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <GradientHeader
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about FHE lending"
          className="mb-16"
        />

        <GlassCard className="p-8">
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-white/10 rounded-2xl px-6 data-[state=open]:bg-white/5 dark:data-[state=open]:bg-black/5"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="text-lg font-semibold text-foreground">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2">
                  <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </GlassCard>
      </div>
    </section>
  )
}
