import { useParams } from "react-router-dom";
import { Users, Home, ClipboardCheck, BarChart3, Menu, Bell } from "lucide-react";
import StatCard from "@/components/StatCard";
import ActionCard from "@/components/ActionCard";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { id } = useParams();
  
  // Mock data - would come from API in real app
  const constituencyData = {
    number: id || "118",
    name: "Thondamuthur",
    stats: {
      totalVoters: 1247,
      totalFamilies: 342,
      surveysCompleted: 156,
      totalBooths: 89,
    },
  };

  const recentActivity = [
    { text: "Survey completed for Family #142", time: "2 hours ago" },
    { text: "Updated voter details: Rajesh Kumar", time: "5 hours ago" },
    { text: "Family visit scheduled for tomorrow", time: "1 day ago" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu size={24} />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-primary">Assembly Constituency {constituencyData.number}</h1>
              <p className="text-sm text-muted-foreground">{constituencyData.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Booth Overview Section */}
        <section className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-6">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Users className="w-8 h-8" />}
              label="Total Voters"
              value={constituencyData.stats.totalVoters}
              variant="blue"
            />
            <StatCard
              icon={<Home className="w-8 h-8" />}
              label="Total Families"
              value={constituencyData.stats.totalFamilies}
              variant="blue"
            />
            <StatCard
              icon={<ClipboardCheck className="w-8 h-8" />}
              label="Surveys Completed"
              value={constituencyData.stats.surveysCompleted}
              variant="green"
            />
            <StatCard
              icon={<BarChart3 className="w-8 h-8" />}
              label="Total Booths"
              value={constituencyData.stats.totalBooths}
              variant="red"
            />
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard
              icon="👥"
              title="Voter Manager"
              description="View & update voters"
              link="/voter-manager/:id"
            />
            <ActionCard
              icon="🏠"
              title="Family Manager"
              description="Manage families"
              link="/family-manager/:id"
            />
            <ActionCard
              icon="📋"
              title="Survey Manager"
              description="Complete surveys"
              link="/survey-manager/:id"
            />
            <ActionCard
              icon="📊"
              title="Booth Reports"
              description="View progress"
              link="/booth-reports/:id"
            />
          </div>
        </section>

        {/* Recent Activity Section */}
        <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-2xl font-bold text-foreground mb-6">Recent Activity</h2>
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{activity.text}</p>
                    <p className="text-sm text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
        <div className="grid grid-cols-4 gap-1 p-2">
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg bg-accent/10 text-accent">
            <Home size={20} />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors">
            <Users size={20} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Voters</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors">
            <ClipboardCheck size={20} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Survey</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors">
            <BarChart3 size={20} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Report</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
