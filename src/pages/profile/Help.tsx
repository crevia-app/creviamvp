import { useState } from "react";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Search } from "lucide-react";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      question: "How do I get verified?",
      answer: "Go to Verification in your profile menu and upload your ID or connect your social media accounts with minimum 1,000 followers."
    },
    {
      question: "How do payments work?",
      answer: "Payments are processed through Pesapal, Stripe, or M-Pesa. Funds are held in escrow until campaign milestones are completed."
    },
    {
      question: "How can I contact a brand/creator?",
      answer: "Use the messaging system within campaign applications or use the contact form on their Crevia Link profile."
    },
    {
      question: "What is Kira?",
      answer: "Kira is your AI co-pilot that provides insights, suggestions, and helps you optimize your profile and campaigns."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 pt-32 pb-20 max-w-5xl">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="w-8 h-8 text-bronze" />
          <h1 className="font-vollkorn text-4xl font-bold">Help & Support</h1>
        </div>
        <p className="text-muted-foreground mb-8">Find answers and get assistance</p>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* FAQ */}
        <Card className="p-8 mb-6">
          <h2 className="font-vollkorn text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* Contact Support */}
        <Card className="p-8">
          <h2 className="font-vollkorn text-2xl font-bold mb-6">Contact Support</h2>
          <div className="space-y-4">
            <div>
              <Input placeholder="Subject" />
            </div>
            <div>
              <Textarea placeholder="Describe your issue..." rows={5} />
            </div>
            <Button className="bg-bronze hover:bg-bronze-dark">Submit Request</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Help;
