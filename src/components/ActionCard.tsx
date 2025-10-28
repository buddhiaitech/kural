import { useNavigate, useParams } from "react-router-dom";
import { ReactNode } from "react";

interface ActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  link?: string;
}

const ActionCard = ({ icon, title, description, link }: ActionCardProps) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleClick = () => {
    if (link) {
      navigate(link.replace(":id", id || "118"));
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-card rounded-2xl border border-border p-6 text-left"
    >
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent/10">
          {icon}
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
};

export default ActionCard;