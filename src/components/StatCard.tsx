import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  variant: "blue" | "green" | "red";
}

const StatCard = ({ icon, label, value, variant }: StatCardProps) => {
  const variantStyles = {
    blue: "text-accent",
    green: "text-success",
    red: "text-destructive",
  };

  const badgeStyles = {
    blue: "bg-accent text-accent-foreground",
    green: "bg-success text-success-foreground",
    red: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={cn("opacity-80", variantStyles[variant])}>
          {icon}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div
            className={cn(
              "text-3xl font-bold px-6 py-2 rounded-xl shadow-sm inline-block",
              badgeStyles[variant]
            )}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
