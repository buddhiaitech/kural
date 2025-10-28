import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ClipboardCheck, TrendingUp, Clock, CheckCircle2, Trash2, Users, User } from "lucide-react";
import { toast } from "sonner";

interface Survey {
  id: string;
  family_id: string;
  booth_id: string;
  status: string;
  completed_at?: string;
  created_at: string;
  survey_data?: any;
}

interface BoothStats {
  id: string;
  booth_number: number;
  total_surveys: number;
  completed: number;
  pending: number;
}

interface Voter {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  phone_number: string | null;
  verification_status: string;
  family_id: string;
  family_address: string | null;
}

const SurveyManager = () => {
  const { id } = useParams();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [boothStats, setBoothStats] = useState<BoothStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);
  const [selectedBooth, setSelectedBooth] = useState<BoothStats | null>(null);
  const [boothVoters, setBoothVoters] = useState<Voter[]>([]);

  useEffect(() => {
    fetchSurveys();
    fetchBoothStats();
  }, [id]);

  const fetchSurveys = async () => {
    try {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSurveys(data || []);
    } catch (error) {
      console.error("Error fetching surveys:", error);
      toast.error("Failed to load surveys");
    } finally {
      setLoading(false);
    }
  };

  const fetchBoothStats = async () => {
    try {
      // Get constituency id first
      const { data: constituency, error: constituencyError } = await supabase
        .from("constituencies")
        .select("id")
        .eq("number", parseInt(id || "118"))
        .single();

      if (constituencyError) throw constituencyError;

      const { data: booths, error: boothsError } = await supabase
        .from("booths")
        .select("id, booth_number")
        .eq("constituency_id", constituency.id);

      if (boothsError) throw boothsError;

      const { data: surveys, error: surveysError } = await supabase
        .from("surveys")
        .select("booth_id, status");

      if (surveysError) throw surveysError;

      const stats: BoothStats[] = (booths || []).map(booth => {
        const boothSurveys = (surveys || []).filter(s => s.booth_id === booth.id);
        const completed = boothSurveys.filter(s => s.status === "completed").length;
        return {
          id: booth.id,
          booth_number: booth.booth_number,
          total_surveys: boothSurveys.length,
          completed,
          pending: boothSurveys.length - completed
        };
      });

      setBoothStats(stats);
    } catch (error) {
      console.error("Error fetching booth stats:", error);
    }
  };

  const fetchBoothVoters = async (boothId: string) => {
    try {
      // First get families in the booth
      const { data: families, error: familiesError } = await supabase
        .from("families")
        .select("id, address")
        .eq("booth_id", boothId);

      if (familiesError) throw familiesError;

      // Create a map of family id to address
      const familyAddressMap = (families || []).reduce((acc, family) => {
        acc[family.id] = family.address;
        return acc;
      }, {} as Record<string, string | null>);

      // Get all voters in the booth's families
      const familyIds = (families || []).map(f => f.id);
      if (familyIds.length === 0) {
        setBoothVoters([]);
        return;
      }

      const { data: voters, error: votersError } = await supabase
        .from("voters")
        .select("id, full_name, age, gender, phone_number, verification_status, family_id")
        .in("family_id", familyIds);

      if (votersError) throw votersError;

      // Add family address to each voter
      const votersWithAddress = (voters || []).map(voter => ({
        ...voter,
        family_address: familyAddressMap[voter.family_id] || null
      }));

      setBoothVoters(votersWithAddress);
    } catch (error) {
      console.error("Error fetching booth voters:", error);
      toast.error("Failed to load member data");
    }
  };

  const handleBoothClick = async (booth: BoothStats) => {
    setSelectedBooth(booth);
    await fetchBoothVoters(booth.id);
  };

  const handleBackToList = () => {
    setSelectedBooth(null);
    setBoothVoters([]);
  };

  const handleDeleteSurvey = async () => {
    if (!surveyToDelete) return;

    try {
      const { error } = await supabase
        .from("surveys")
        .delete()
        .eq("id", surveyToDelete);

      if (error) throw error;

      toast.success("Survey deleted successfully");
      setDeleteDialogOpen(false);
      setSurveyToDelete(null);
      fetchSurveys();
      fetchBoothStats();
    } catch (error: any) {
      console.error("Error deleting survey:", error);
      toast.error(error.message || "Failed to delete survey");
    }
  };

  const confirmDelete = (surveyId: string) => {
    setSurveyToDelete(surveyId);
    setDeleteDialogOpen(true);
  };

  const totalSurveys = surveys.length;
  const completedSurveys = surveys.filter(s => s.status === "completed").length;
  const pendingSurveys = totalSurveys - completedSurveys;
  const completionRate = totalSurveys > 0 ? Math.round((completedSurveys / totalSurveys) * 100) : 0;

  if (selectedBooth) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
          <div className="px-4 py-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBackToList}
                className="flex items-center gap-2"
              >
                ← Back to Booths
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Booth {selectedBooth.booth_number} Members</h1>
                <p className="text-sm text-muted-foreground">View all members in this booth</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="space-y-4">
            {boothVoters.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No members found in this booth</div>
            ) : (
              boothVoters.map((voter) => (
                <Card key={voter.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <User className="text-accent" size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{voter.full_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>Age: {voter.age}</span>
                        <span>Gender: {voter.gender}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          voter.verification_status === "verified" 
                            ? "bg-success/10 text-success" 
                            : "bg-warning/10 text-warning"
                        }`}>
                          {voter.verification_status}
                        </span>
                      </div>
                      {voter.family_address && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Family Address: {voter.family_address}
                        </p>
                      )}
                      {voter.phone_number && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Phone: {voter.phone_number}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-4 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground">Survey Manager</h1>
          <p className="text-sm text-muted-foreground">Constituency {id} - Survey tracking</p>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Overview Stats */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <ClipboardCheck className="text-accent" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Surveys</p>
                  <p className="text-2xl font-bold text-foreground">{totalSurveys}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="text-success" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-success">{completedSurveys}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Clock className="text-muted-foreground" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">{pendingSurveys}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="text-accent" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold text-accent">{completionRate}%</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Booth-wise Survey Status */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Booth-wise Survey Status</h2>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading booth data...</div>
            ) : boothStats.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No booth data available</div>
            ) : (
              boothStats.map((booth) => (
                <Card key={booth.booth_number} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Booth {booth.booth_number}</h3>
                      <p className="text-sm text-muted-foreground">
                        {booth.total_surveys} total surveys
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleBoothClick(booth)}>
                      View Members
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">
                        {booth.total_surveys > 0 
                          ? Math.round((booth.completed / booth.total_surveys) * 100) 
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success transition-all duration-300"
                        style={{ 
                          width: `${booth.total_surveys > 0 
                            ? (booth.completed / booth.total_surveys) * 100 
                            : 0}%` 
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-success">✓ {booth.completed} completed</span>
                      <span className="text-muted-foreground">{booth.pending} pending</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Recent Surveys List */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Recent Surveys</h2>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading surveys...</div>
            ) : surveys.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No surveys found</div>
            ) : (
              surveys.slice(0, 10).map((survey) => (
                <Card key={survey.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">Survey Details</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          survey.status === "completed" 
                            ? "bg-success/10 text-success" 
                            : survey.status === "active"
                            ? "bg-accent/10 text-accent"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {survey.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {survey.completed_at 
                          ? `Completed: ${new Date(survey.completed_at).toLocaleDateString()}`
                          : `Created: ${new Date(survey.created_at).toLocaleDateString()}`
                        }
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(survey.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Survey</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this survey? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSurvey} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SurveyManager;