import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, ClipboardList, Vote } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-3xl animate-fade-in">
        <div className="mb-8 flex justify-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center animate-fade-in">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <ClipboardList className="w-8 h-8 text-green-600" />
          </div>
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <BarChart3 className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <h1 className="mb-6 text-5xl md:text-6xl font-bold text-gray-900">
          Election Management System
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-10">
          Efficiently manage voters, families, surveys, and electoral reports
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button
            onClick={() => navigate("/login")}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg px-10 py-6 shadow-lg font-bold transition-all duration-300 hover:scale-105"
          >
            <Vote className="mr-2 h-6 w-6" />
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;