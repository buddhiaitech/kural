import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, ClipboardList } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl animate-fade-in">
        <div className="mb-8 flex justify-center gap-4">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center animate-fade-in">
            <Users className="w-8 h-8 text-accent" />
          </div>
          <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <ClipboardList className="w-8 h-8 text-success" />
          </div>
          <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <BarChart3 className="w-8 h-8 text-destructive" />
          </div>
        </div>
        
        <h1 className="mb-4 text-5xl font-bold text-primary">
          Assembly Constituency Management System
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Manage voters, families, surveys, and reports efficiently across all constituencies
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/login")}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white rounded-2xl text-lg px-8 py-6 shadow-lg"
          >
            Get Started
          </Button>
          <Button
            onClick={() => navigate("/constituencies")}
            size="lg"
            variant="outline"
            className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground rounded-2xl text-lg px-8 py-6"
          >
            View Constituencies
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
