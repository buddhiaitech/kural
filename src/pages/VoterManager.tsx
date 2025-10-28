import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, Phone, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

interface Voter {
  id: string;
  voter_id: string;
  full_name: string;
  age: number;
  gender: string;
  phone_number?: string;
  address: string;
  verification_status: string;
  special_categories: string[];
}

const specialCategoryOptions = [
  "Age 60+",
  "Age 80+",
  "Transgender",
  "Fatherless",
  "Overseas",
  "Other"
];

const VoterManager = () => {
  const { id } = useParams();
  const [voters, setVoters] = useState<Voter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    voter_id: "",
    full_name: "",
    age: "",
    gender: "",
    phone_number: "",
    address: "",
    family_id: "",
    special_categories: [] as string[]
  });

  useEffect(() => {
    fetchVoters();
  }, [id]);

  const fetchVoters = async () => {
    try {
      const { data, error } = await supabase
        .from("voters")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVoters(data || []);
    } catch (error) {
      console.error("Error fetching voters:", error);
      toast.error("Failed to load voters");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVoter = async () => {
    if (!formData.voter_id || !formData.full_name || !formData.age || !formData.gender || !formData.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Get the first booth for this constituency (temporary solution)
      const { data: booths } = await supabase
        .from("booths")
        .select("id")
        .limit(1);

      if (!booths || booths.length === 0) {
        toast.error("No booth found. Please contact administrator.");
        return;
      }

      const { error } = await supabase
        .from("voters")
        .insert({
          ...formData,
          age: parseInt(formData.age),
          booth_id: booths[0].id,
          special_categories: formData.special_categories
        });

      if (error) throw error;

      toast.success("Voter added successfully");
      setIsAddDialogOpen(false);
      resetForm();
      fetchVoters();
    } catch (error: any) {
      console.error("Error adding voter:", error);
      toast.error(error.message || "Failed to add voter");
    }
  };

  const resetForm = () => {
    setFormData({
      voter_id: "",
      full_name: "",
      age: "",
      gender: "",
      phone_number: "",
      address: "",
      family_id: "",
      special_categories: []
    });
  };

  const toggleSpecialCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      special_categories: prev.special_categories.includes(category)
        ? prev.special_categories.filter(c => c !== category)
        : [...prev.special_categories, category]
    }));
  };

  const filteredVoters = voters.filter(voter =>
    voter.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    voter.voter_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Voter Manager</h1>
            <p className="text-sm text-muted-foreground">Booth 118 - {voters.length} voters</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <UserPlus size={20} />
            Add Voter
          </Button>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Search by name or voter ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading voters...</div>
          ) : filteredVoters.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No voters found</div>
          ) : (
            filteredVoters.map((voter) => (
              <div key={voter.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground">{voter.full_name}</h3>
                      {voter.verification_status === "verified" ? (
                        <span className="px-3 py-1 bg-success/10 text-success rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle2 size={14} />
                          Verified
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium flex items-center gap-1">
                          <Clock size={14} />
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">ID: {voter.voter_id}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                      <span>Age: {voter.age} years</span>
                      <span>Gender: {voter.gender}</span>
                    </div>
                    {voter.phone_number && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone size={14} />
                        {voter.phone_number}
                      </div>
                    )}
                    {voter.special_categories && voter.special_categories.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {voter.special_categories.map((cat) => (
                          <span key={cat} className="px-2 py-1 bg-accent/10 text-accent rounded text-xs">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Voter</DialogTitle>
            <p className="text-sm text-muted-foreground">Enter the voter's details to register them in the booth</p>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="voter_id">Voter ID <span className="text-destructive">*</span></Label>
              <Input
                id="voter_id"
                placeholder="e.g., TND1180007"
                value={formData.voter_id}
                onChange={(e) => setFormData({...formData, voter_id: e.target.value})}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="full_name">Full Name <span className="text-destructive">*</span></Label>
              <Input
                id="full_name"
                placeholder="Enter full name"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="age">Age <span className="text-destructive">*</span></Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter age"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender <span className="text-destructive">*</span></Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                placeholder="+91 98765 43210"
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="address">Address <span className="text-destructive">*</span></Label>
              <Input
                id="address"
                placeholder="Enter complete address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="family_id">Family ID</Label>
              <Input
                id="family_id"
                placeholder="e.g., F001"
                value={formData.family_id}
                onChange={(e) => setFormData({...formData, family_id: e.target.value})}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Leave empty to create a new family</p>
            </div>

            <div>
              <Label>Special Categories</Label>
              <div className="mt-2 space-y-2">
                {specialCategoryOptions.map((category) => (
                  <div key={category} className="flex items-center gap-2">
                    <Checkbox
                      id={category}
                      checked={formData.special_categories.includes(category)}
                      onCheckedChange={() => toggleSpecialCategory(category)}
                    />
                    <Label htmlFor={category} className="font-normal cursor-pointer">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddVoter} className="flex-1">
                Add Voter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoterManager;