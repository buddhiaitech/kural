import { useNavigate, useParams } from "react-router-dom";

interface ActionCardProps {
  icon: string;
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
      className="bg-card rounded-2xl border border-border p-6 hover:border-accent hover:shadow-lg transition-all duration-200 hover:scale-105 group text-left"
    >
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="text-5xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-foreground group-hover:text-accent transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
};

export default ActionCard;
