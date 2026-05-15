import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Help = () => {
  const { t } = useLanguage();
  const [subject, setSubject]       = useState("");
  const [message, setMessage]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both fields");
      return;
    }
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      const { error } = await supabase.from("support_tickets" as any).insert({
        user_id: session.user.id,
        subject: subject.trim(),
        message: message.trim(),
      });
      if (error) throw error;

      setSubmitted(true);
      setSubject("");
      setMessage("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="w-8 h-8 text-bronze" />
          <h1 className="font-vollkorn text-4xl font-bold">{t("help.title")}</h1>
        </div>
        <p className="text-muted-foreground mb-8">{t("help.subtitle")}</p>

        <Card className="p-8">
          <h2 className="font-vollkorn text-2xl font-bold mb-6">{t("help.contactSupport")}</h2>

          {submitted ? (
            <div className="flex flex-col items-center py-10 text-center gap-3">
              <CheckCircle className="w-12 h-12 text-bronze" />
              <p className="font-semibold text-lg">Request submitted!</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                We'll review your request and get back to you as soon as possible.
              </p>
              <Button variant="outline" className="mt-2" onClick={() => setSubmitted(false)}>
                Submit another
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Input
                  placeholder={t("help.subject")}
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              </div>
              <div>
                <Textarea
                  placeholder={t("help.describeIssue")}
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-bronze hover:bg-bronze-dark"
              >
                {submitting ? "Submitting…" : t("help.submitRequest")}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Help;
