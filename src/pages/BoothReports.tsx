import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Home, TrendingUp, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ReportStats {
  totalVoters: number;
  totalFamilies: number;
  verifiedVoters: number;
  activeSurveys: number;
  votersByGender: { Male: number; Female: number; Other: number };
  votersByCategory: Record<string, number>;
}

const BoothReports = () => {
  const { id } = useParams();
  const [stats, setStats] = useState<ReportStats>({
    totalVoters: 0,
    totalFamilies: 0,
    verifiedVoters: 0,
    activeSurveys: 0,
    votersByGender: { Male: 0, Female: 0, Other: 0 },
    votersByCategory: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [id]);

  const fetchReportData = async () => {
    try {
      // Fetch voters
      const { data: voters, error: votersError } = await supabase
        .from("voters")
        .select("*");

      if (votersError) throw votersError;

      // Fetch families
      const { data: families, error: familiesError } = await supabase
        .from("families")
        .select("*");

      if (familiesError) throw familiesError;

      // Fetch surveys
      const { data: surveys, error: surveysError } = await supabase
        .from("surveys")
        .select("*");

      if (surveysError) throw surveysError;

      // Calculate stats
      const verifiedCount = (voters || []).filter(v => v.verification_status === "verified").length;
      const activeCount = (surveys || []).filter(s => s.status === "active").length;

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
      setLoading(false);
    }
  };

  const verificationProgress = stats.totalVoters > 0 
    ? Math.round((stats.verifiedVoters / stats.totalVoters) * 100) 
    : 0;

  const surveyProgress = stats.totalFamilies > 0 
    ? Math.round((stats.activeSurveys / stats.totalFamilies) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-4 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground">Booth Report</h1>
          <p className="text-sm text-muted-foreground">Performance and progress tracking</p>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {loading ? (
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
                      <p className="text-2xl font-bold text-accent">{stats.activeSurveys} Active</p>
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
        )}
      </main>
    </div>
  );
};

export default BoothReports;