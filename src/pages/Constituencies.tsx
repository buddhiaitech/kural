import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const constituencies = [
  { number: 118, name: "Thondamuthur" },
  { number: 119, name: "To be updated" },
  { number: 120, name: "To be updated" },
  { number: 121, name: "To be updated" },
  { number: 122, name: "To be updated" },
  { number: 123, name: "To be updated" },
  { number: 124, name: "To be updated" },
  { number: 125, name: "To be updated" },
  { number: 126, name: "To be updated" },
  { number: 127, name: "To be updated" },
  { number: 128, name: "To be updated" },
  { number: 129, name: "To be updated" },
  { number: 130, name: "To be updated" },
  { number: 131, name: "To be updated" },
  { number: 132, name: "To be updated" },
  { number: 133, name: "To be updated" },
  { number: 134, name: "To be updated" },
  { number: 135, name: "To be updated" },
  { number: 136, name: "To be updated" },
  { number: 137, name: "To be updated" },
  { number: 138, name: "To be updated" },
];

const Constituencies = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConstituencies = constituencies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.number.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8 animate-fade-in">
          Assembly Constituencies
        </h1>

        <div className="relative mb-8 animate-fade-in">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="text"
            placeholder="Search by constituency name or number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-card border-border rounded-2xl text-base shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
          {filteredConstituencies.map((constituency) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default Constituencies;
