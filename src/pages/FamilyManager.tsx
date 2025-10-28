import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Search, Users, Home, Calendar, CheckCircle2, User } from "lucide-react";
import { toast } from "sonner";

interface Family {
  id: string;
  family_id: string;
  address?: string;
  survey_status: string;
  created_at: string;
  booth_id: string;
}

interface Voter {
  id: string;
  voter_id: string;
  full_name: string;
  age: number;
  gender: string;
  family_id: string;
  verification_status: string;
}

interface BoothStats {
  id: string;
  name: string;
  booth_number: number;
  totalSurveys: number;
  completedSurveys: number;
  pendingSurveys: number;
}

const FamilyManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [families, setFamilies] = useState<Family[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [boothStats, setBoothStats] = useState<BoothStats[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // Fetch families
      const { data: familiesData, error: familiesError } = await supabase
        .from("families")
        .select("*")
        .order("created_at", { ascending: false });

      if (familiesError) throw familiesError;
      setFamilies(familiesData || []);

      // Fetch voters
      const { data: votersData, error: votersError } = await supabase
        .from("voters")
        .select("*");

      if (votersError) throw votersError;
      setVoters(votersData || []);

      // Fetch booths and calculate stats
      const { data: boothsData, error: boothsError } = await supabase
        .from("booths")
        .select("*")
        .order("booth_number");

      if (boothsError) throw boothsError;

      // Fetch all surveys
      const { data: surveysData, error: surveysError } = await supabase
        .from("surveys")
        .select("*, families(booth_id)");

      if (surveysError) throw surveysError;

      // Calculate booth stats
      const stats: BoothStats[] = (boothsData || []).map((booth) => {
        const boothSurveys = (surveysData || []).filter(
          (survey: any) => survey.families?.booth_id === booth.id
        );
        const completed = boothSurveys.filter((s: any) => s.status === "completed").length;
        
        return {
          id: booth.id,
          name: booth.name || `Booth ${booth.booth_number}`,
          booth_number: booth.booth_number,
          totalSurveys: boothSurveys.length,
          completedSurveys: completed,
          pendingSurveys: boothSurveys.length - completed,
        };
      });

      setBoothStats(stats);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const filteredFamilies = families.filter(family =>
    family.family_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (family.address && family.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getFamilyMembers = (familyId: string) => {
    return voters.filter(voter => voter.family_id === familyId);
  };

  const getHeadOfFamily = (familyId: string) => {
    const members = getFamilyMembers(familyId);
    return members[0] || null;
  };

  const getLastVisit = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

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

        {/* Families Section */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Families</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">Loading families...</div>
            ) : filteredFamilies.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">No families found</div>
            ) : (
              filteredFamilies.map((family) => {
                const headOfFamily = getHeadOfFamily(family.id);
                const familyMembers = getFamilyMembers(family.id);
                
                return (
                  <Card key={family.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <Home className="text-accent" size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground text-lg">{family.family_id}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                              family.survey_status === "completed" 
                                ? "bg-success/10 text-success" 
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {family.survey_status === "completed" ? "✓ Survey Completed" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Head of Family */}
                      {headOfFamily && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Head of Family</p>
                          <p className="font-semibold text-foreground">{headOfFamily.full_name}</p>
                        </div>
                      )}

                      {/* Address */}
                      {family.address && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Address</p>
                          <p className="text-sm text-foreground">{family.address}</p>
                        </div>
                      )}

                      {/* Last Visit */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        <span>Last Visit: {getLastVisit(family.created_at)}</span>
                      </div>

                      {/* Family Members */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Family Members ({familyMembers.length})
                        </p>
                        <div className="space-y-2">
                          {familyMembers.slice(0, 2).map((member) => (
                            <div key={member.id} className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                                <User size={12} className="text-accent" />
                              </div>
                              <div className="flex-1">
                                <p className="text-foreground">{member.full_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {member.age} years • {member.gender}
                                  {member.verification_status === "verified" && (
                                    <CheckCircle2 size={12} className="inline ml-1 text-success" />
                                  )}
                                </p>
                              </div>
                            </div>
                          ))}
                          {familyMembers.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{familyMembers.length - 2} more members
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          Schedule Visit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Update
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </section>

        {/* Booth-wise Survey Status */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Booth-wise Survey Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boothStats.map((booth) => {
              const progress = booth.totalSurveys > 0 
                ? Math.round((booth.completedSurveys / booth.totalSurveys) * 100) 
                : 0;
              
              return (
                <Card 
                  key={booth.id} 
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/booth-reports/${booth.booth_number}`)}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-foreground text-lg">{booth.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {booth.totalSurveys} total surveys
                        </p>
                      </div>
                      <Button size="sm" variant="ghost">
                        View Details
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-bold text-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-success">✓ {booth.completedSurveys} completed</span>
                        <span className="text-destructive">{booth.pendingSurveys} pending</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default FamilyManager;