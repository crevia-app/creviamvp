import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-vollkorn text-4xl font-bold mb-2">Welcome to Crevia</h1>
            <p className="text-muted-foreground">Your dashboard is coming soon!</p>
          </div>
          <Button className="bg-bronze hover:bg-bronze-dark">
            Complete Profile
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="font-vollkorn text-xl font-bold mb-2">Profile Strength</h3>
            <p className="text-3xl font-bold text-bronze">75%</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-vollkorn text-xl font-bold mb-2">Active Campaigns</h3>
            <p className="text-3xl font-bold">0</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-vollkorn text-xl font-bold mb-2">Total Earnings</h3>
            <p className="text-3xl font-bold text-bronze">$0</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
