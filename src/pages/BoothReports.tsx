import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Home, TrendingUp, CheckCircle2, ArrowLeft, List } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ReportStats {
  totalVoters: number;
  totalFamilies: number;
  verifiedVoters: number;
  activeSurveys: number;
  votersByGender: { Male: number; Female: number; Other: number };
  votersByCategory: Record<string, number>;
}

interface Booth {
  id: string;
  booth_number: number;
  name: string | null;
  total_voters: number | null;
}

const BoothReports = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ReportStats>({
    totalVoters: 0,
    totalFamilies: 0,
    verifiedVoters: 0,
    activeSurveys: 0,
    votersByGender: { Male: 0, Female: 0, Other: 0 },
    votersByCategory: {}
  });
  const [booths, setBooths] = useState<Booth[]>([]);
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [loading, setLoading] = useState(true);
  const [boothLoading, setBoothLoading] = useState(false);
  const [boothsUpdated, setBoothsUpdated] = useState(false);

  useEffect(() => {
    fetchBooths();
  }, [id]);

  // Update booth names if they haven't been updated yet
  useEffect(() => {
    if (!boothsUpdated && booths.length > 0) {
      updateBoothNames();
      setBoothsUpdated(true);
    }
  }, [booths, boothsUpdated]);

  const updateBoothNames = async () => {
    try {
      // Get constituency id first
      const { data: constituency, error: constituencyError } = await supabase
        .from("constituencies")
        .select("id")
        .eq("number", parseInt(id || "118"))
        .single();

      if (constituencyError) throw constituencyError;

      // Remove all booth names since we only want to display booth numbers
      // Booth 1
      await supabase
        .from("booths")
        .update({ 
          name: null, 
          total_voters: 250 
        })
        .eq("constituency_id", constituency.id)
        .eq("booth_number", 1);

      // Booth 2
      await supabase
        .from("booths")
        .update({ 
          name: null, 
          total_voters: 280 
        })
        .eq("constituency_id", constituency.id)
        .eq("booth_number", 2);

      // Booth 3
      await supabase
        .from("booths")
        .update({ 
          name: null, 
          total_voters: 220 
        })
        .eq("constituency_id", constituency.id)
        .eq("booth_number", 3);

      // Refresh the booth list after updates
      fetchBooths();
    } catch (error) {
      console.error("Error updating booth names:", error);
    }
  };

  const fetchBooths = async () => {
    try {
      // Get constituency id first
      const { data: constituency, error: constituencyError } = await supabase
        .from("constituencies")
        .select("id")
        .eq("number", parseInt(id || "118"))
        .single();

      if (constituencyError) throw constituencyError;

      // Fetch booths for this constituency
      const { data: boothData, error: boothError } = await supabase
        .from("booths")
        .select("*")
        .eq("constituency_id", constituency.id)
        .order("booth_number");

      if (boothError) throw boothError;

      setBooths(boothData || []);
    } catch (error) {
      console.error("Error fetching booths:", error);
      toast.error("Failed to load booths");
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async (boothId: string) => {
    setBoothLoading(true);
    try {
      // Fetch voters for this booth
      const { data: voters, error: votersError } = await supabase
        .from("voters")
        .select("*")
        .eq("booth_id", boothId);

      if (votersError) throw votersError;

      // Fetch families for this booth
      const { data: families, error: familiesError } = await supabase
        .from("families")
        .select("*")
        .eq("booth_id", boothId);

      if (familiesError) throw familiesError;

      // Fetch surveys for this booth
      const { data: surveys, error: surveysError } = await supabase
        .from("surveys")
        .select("*")
        .eq("booth_id", boothId);

      if (surveysError) throw surveysError;

      // Calculate stats
      const verifiedCount = (voters || []).filter(v => v.verification_status === "verified").length;
      const activeCount = (surveys || []).filter(s => s.status === "completed").length;

      const genderCount = (voters || []).reduce((acc, v) => {
        acc[v.gender as keyof typeof acc] = (acc[v.gender as keyof typeof acc] || 0) + 1;
        return acc;
      }, { Male: 0, Female: 0, Other: 0 });

      const categoryCount: Record<string, number> = {};
      (voters || []).forEach(voter => {
        if (voter.special_categories) {
          voter.special_categories.forEach((cat: string) => {
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
          });
        }
      });

      setStats({
        totalVoters: (voters || []).length,
        totalFamilies: (families || []).length,
        verifiedVoters: verifiedCount,
        activeSurveys: activeCount,
        votersByGender: genderCount,
        votersByCategory: categoryCount
      });
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to load report data");
    } finally {
      setBoothLoading(false);
    }
  };

  const handleBoothSelect = async (booth: Booth) => {
    setSelectedBooth(booth);
    await fetchReportData(booth.id);
  };

  const handleBackToList = () => {
    setSelectedBooth(null);
  };

  const verificationProgress = stats.totalVoters > 0 
    ? Math.round((stats.verifiedVoters / stats.totalVoters) * 100) 
    : 0;

  const surveyProgress = stats.totalFamilies > 0 
    ? Math.round((stats.activeSurveys / stats.totalFamilies) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
          <div className="px-4 py-4 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-foreground">Booth Reports</h1>
            <p className="text-sm text-muted-foreground">Loading booths...</p>
          </div>
        </header>
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="text-center py-12 text-muted-foreground">Loading booths...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {selectedBooth && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBackToList}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Booths
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {selectedBooth 
                  ? `Booth ${selectedBooth.booth_number}` 
                  : "Booth Reports"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedBooth 
                  ? "Detailed report for selected booth" 
                  : "Select a booth to view detailed reports"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {!selectedBooth ? (
          // Booth Selection View
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Select Booth</h2>
              <div className="text-sm text-muted-foreground">
                {booths.length} booth{booths.length !== 1 ? 's' : ''} available
              </div>
            </div>
            
            {booths.length === 0 ? (
              <Card className="p-8 text-center">
                <List className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Booths Found</h3>
                <p className="text-muted-foreground">There are no booths configured for this constituency yet.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {booths.map((booth) => (
                  <Card 
                    key={booth.id} 
                    className="p-6 cursor-pointer"
                    onClick={() => handleBoothSelect(booth)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">
                          Booth {booth.booth_number}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Booth #{booth.booth_number}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {booth.total_voters || 0} voters
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Booth Report View
          boothLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading report data...</div>
          ) : (
            <>
              {/* Overview Section */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                        <Users className="text-accent" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Voters</p>
                        <p className="text-2xl font-bold text-foreground">{stats.totalVoters}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                        <Home className="text-accent" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Families</p>
                        <p className="text-2xl font-bold text-foreground">{stats.totalFamilies}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle2 className="text-success" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Verified</p>
                        <p className="text-2xl font-bold text-success">{stats.verifiedVoters}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                        <TrendingUp className="text-accent" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Surveys</p>
                        <p className="text-2xl font-bold text-accent">{stats.activeSurveys} Completed</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </section>

              {/* Progress Section */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">Voter Verification Progress</h2>
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Verified Voters</span>
                      <span className="text-sm font-bold text-foreground">{stats.verifiedVoters} / {stats.totalVoters} ({verificationProgress}%)</span>
                    </div>
                    <Progress value={verificationProgress} className="h-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-success">✓ {stats.verifiedVoters} verified</span>
                      <span className="text-destructive">{stats.totalVoters - stats.verifiedVoters} pending</span>
                    </div>
                  </div>
                </Card>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">Survey Completion Progress</h2>
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Families Surveyed</span>
                      <span className="text-sm font-bold text-foreground">{stats.activeSurveys} / {stats.totalFamilies} ({surveyProgress}%)</span>
                    </div>
                    <Progress value={surveyProgress} className="h-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-success">✓ {stats.activeSurveys} completed</span>
                      <span className="text-destructive">{stats.totalFamilies - stats.activeSurveys} pending</span>
                    </div>
                  </div>
                </Card>
              </section>

              {/* Voter Categories Section */}
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4">Voter Categories</h2>
                <div className="space-y-4">
                  <Card className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">Gender Distribution</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Male</span>
                        <span className="font-bold text-foreground">{stats.votersByGender.Male}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Female</span>
                        <span className="font-bold text-foreground">{stats.votersByGender.Female}</span>
                      </div>
                      {stats.votersByGender.Other > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Other</span>
                          <span className="font-bold text-foreground">{stats.votersByGender.Other}</span>
                        </div>
                      )}
                    </div>
                  </Card>

                  {Object.keys(stats.votersByCategory).length > 0 && (
                    <Card className="p-6">
                      <h3 className="font-semibold text-foreground mb-4">Special Categories</h3>
                      <div className="space-y-3">
                        {Object.entries(stats.votersByCategory).map(([category, count]) => (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{category}</span>
                            <span className="font-bold text-foreground">{count}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              </section>
            </>
          )
        )}
      </main>
    </div>
  );
};

export default BoothReports;