import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Constituency {
  id: string;
  number: number;
  name: string;
}

const ConstituencyList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const filteredConstituencies = constituencies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.number.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/constituencies")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-primary">Assembly Constituencies</h1>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="text"
            placeholder="Search by constituency name or number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-card border-border rounded-2xl text-base shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">Loading constituencies...</div>
          ) : filteredConstituencies.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">No constituencies found</div>
          ) : (
            filteredConstituencies.map((constituency) => (
              <button
                key={constituency.number}
                onClick={() => navigate(`/dashboard/${constituency.number}`)}
                className="bg-card border border-border rounded-2xl p-6 text-left"
              >
                <div className="text-3xl font-bold text-accent mb-2">
                  {constituency.number}
                </div>
                <div className="text-lg font-semibold text-card-foreground">
                  {constituency.name}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ConstituencyList;