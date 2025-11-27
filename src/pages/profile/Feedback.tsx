import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Feedback = () => {
  const { toast } = useToast();
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [emailMe, setEmailMe] = useState(true);

  const handleSubmit = () => {
    toast({
      title: "Feedback submitted!",
      description: "Thanks! I'll pass this to the right team. - Kira",
    });
    setMessage("");
    setCategory("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-8 h-8 text-bronze" />
          <h1 className="font-vollkorn text-4xl font-bold">Feedback</h1>
        </div>
        <p className="text-muted-foreground mb-8">Help us improve Crevia</p>

        <Card className="p-8 mb-6">
          <h2 className="font-vollkorn text-2xl font-bold mb-6">Share Your Thoughts</h2>
          <div className="space-y-6">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="platform">Platform Issue</SelectItem>
                  <SelectItem value="payments">Payments/Escrow</SelectItem>
                  <SelectItem value="search">Creator/Brand Search</SelectItem>
                  <SelectItem value="campaigns">Campaign Tools</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message">Your Feedback</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you think..."
                rows={6}
                className="mt-2"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="emailMe"
                checked={emailMe}
                onCheckedChange={setEmailMe}
              />
              <Label htmlFor="emailMe">Email me when reviewed</Label>
            </div>

            <Button 
              onClick={handleSubmit}
              className="bg-bronze hover:bg-bronze-dark"
              disabled={!category || !message}
            >
              Submit Feedback
            </Button>
          </div>

          <div className="mt-8 p-4 bg-bronze/10 rounded-lg flex items-start gap-3">
            <div className="w-10 h-10 bg-bronze rounded-full flex items-center justify-center text-white font-bold">
              K
            </div>
            <div>
              <p className="font-semibold">Kira says:</p>
              <p className="text-sm text-muted-foreground">
                Thanks! I'll pass this to the right team. Your feedback helps us make Crevia better for everyone.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="font-vollkorn text-2xl font-bold mb-6">Past Feedback</h2>
          <div className="text-center py-12 text-muted-foreground">
            <p>No previous feedback submissions</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Feedback;
