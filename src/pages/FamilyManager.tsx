import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, Home } from "lucide-react";
import { toast } from "sonner";

interface Family {
  id: string;
  family_id: string;
  address?: string;
  survey_status: string;
  created_at: string;
}

const FamilyManager = () => {
  const { id } = useParams();
  const [families, setFamilies] = useState<Family[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFamilies();
  }, [id]);

  const fetchFamilies = async () => {
    try {
      const { data, error } = await supabase
        .from("families")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFamilies(data || []);
    } catch (error) {
      console.error("Error fetching families:", error);
      toast.error("Failed to load families");
    } finally {
      setLoading(false);
    }
  };

  const filteredFamilies = families.filter(family =>
    family.family_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (family.address && family.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Family Manager</h1>
            <p className="text-sm text-muted-foreground">Constituency {id} - {families.length} families</p>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Search by family ID or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">Loading families...</div>
          ) : filteredFamilies.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">No families found</div>
          ) : (
            filteredFamilies.map((family) => (
              <div key={family.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Home className="text-accent" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-lg">{family.family_id}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                      family.survey_status === "completed" 
                        ? "bg-success/10 text-success" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {family.survey_status === "completed" ? "Survey Completed" : "Pending"}
                    </span>
                  </div>
                </div>
                {family.address && (
                  <p className="text-sm text-muted-foreground">{family.address}</p>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default FamilyManager;