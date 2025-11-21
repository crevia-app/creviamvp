import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building2 } from "lucide-react";

const UserTypeSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-bronze/5 to-background flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-bronze rounded-lg"></div>
            <span className="font-vollkorn text-3xl font-bold">Crevia</span>
          </Link>
          <h1 className="font-vollkorn text-4xl md:text-5xl font-bold mb-4">
            Create your account
          </h1>
          <p className="text-xl text-muted-foreground">I'm joining as *</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-bronze group"
            onClick={() => navigate("/signup/creator")}
          >
            <div className="w-16 h-16 rounded-2xl bg-bronze/10 group-hover:bg-bronze flex items-center justify-center mb-6 transition-colors">
              <Users className="w-8 h-8 text-bronze group-hover:text-white transition-colors" />
            </div>
            <h2 className="font-vollkorn text-3xl font-bold mb-3">Creator</h2>
            <p className="text-muted-foreground">
              Sell products & services
            </p>
          </Card>

          <Card 
            className="p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-bronze group"
            onClick={() => navigate("/signup/brand")}
          >
            <div className="w-16 h-16 rounded-2xl bg-bronze/10 group-hover:bg-bronze flex items-center justify-center mb-6 transition-colors">
              <Building2 className="w-8 h-8 text-bronze group-hover:text-white transition-colors" />
            </div>
            <h2 className="font-vollkorn text-3xl font-bold mb-3">Brand</h2>
            <p className="text-muted-foreground">
              Find & hire creators
            </p>
          </Card>
        </div>

        <p className="text-center mt-8 text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth" className="text-bronze hover:text-bronze-dark font-semibold bronze-underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default UserTypeSelection;
