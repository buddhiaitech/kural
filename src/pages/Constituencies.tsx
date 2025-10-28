import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Settings } from "lucide-react";

interface Constituency {
  id: string;
  number: number;
  name: string;
}

const Constituencies = () => {
  const navigate = useNavigate();
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);

  useEffect(() => {
    fetchConstituencies();
  }, []);

  const fetchConstituencies = async () => {
    try {
      const { data, error } = await supabase
        .from("constituencies")
        .select("*")
        .order("number");

      if (error) throw error;
      setConstituencies(data || []);
    } catch (error) {
      console.error("Error fetching constituencies:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">
          Assembly Constituencies
        </h1>

        {/* Two main boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assembly Constituencies Box */}
          <div 
            className="bg-card border border-border rounded-2xl p-8 cursor-pointer"
            onClick={() => navigate("/constituencies/list")}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Assembly Constituencies</h2>
            <p className="text-muted-foreground mb-6 text-lg">View and access all assembly constituencies</p>
            <div className="text-2xl font-semibold text-accent">
              {constituencies.length} constituencies available
            </div>
          </div>

          {/* Assembly Manage Box */}
          <div 
            className="bg-card border border-border rounded-2xl p-8 cursor-pointer"
            onClick={() => navigate("/constituencies/manage")}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Settings className="text-accent" size={24} />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Assembly Manage</h2>
            </div>
            <p className="text-muted-foreground mb-6 text-lg">Manage constituencies - Add, edit, and configure</p>
            <div className="text-lg text-muted-foreground">
              Requires administrator access
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Constituencies;