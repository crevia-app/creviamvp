import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle } from "lucide-react";

const Help = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="w-8 h-8 text-bronze" />
          <h1 className="font-vollkorn text-4xl font-bold">Help & Support</h1>
        </div>
        <p className="text-muted-foreground mb-8">Find answers and get assistance</p>

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
