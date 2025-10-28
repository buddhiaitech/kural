import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus, Save, Trash2, Edit } from "lucide-react";

interface Constituency {
  id: string;
  number: number;
  name: string;
}

const ConstituencyManage = () => {
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newConstituency, setNewConstituency] = useState({
    number: "",
    name: ""
  });
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ number: 0, name: "" });

  useEffect(() => {
    if (isAuthenticated) {
      fetchConstituencies();
    }
  }, [isAuthenticated]);

  const fetchConstituencies = async () => {
    try {
      const { data, error } = await supabase
        .from("constituencies")
        .select("*")
        .order("number");

      if (error) throw error;
      setConstituencies(data || []);
    } catch (error) {
      console.error("Error fetching constituencies:", error);
      toast.error("Failed to load constituencies");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be a proper authentication check
    if (adminId === "admin" && password === "password") {
      setIsAuthenticated(true);
      toast.success("Access granted");
    } else {
      toast.error("Invalid credentials");
    }
  };

  const handleAddConstituency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConstituency.number || !newConstituency.name) {
      toast.error("Please fill all fields");
      return;
    }
    
    try {
      const { error } = await supabase
        .from("constituencies")
        .insert({
          number: parseInt(newConstituency.number),
          name: newConstituency.name
        });

      if (error) throw error;
      
      toast.success("Constituency added successfully");
      setNewConstituency({ number: "", name: "" });
      fetchConstituencies(); // Refresh the list
    } catch (error) {
      console.error("Error adding constituency:", error);
      toast.error("Failed to add constituency");
    }
  };

  const startEditing = (constituency: Constituency) => {
    setEditingId(constituency.id);
    setEditData({ number: constituency.number, name: constituency.name });
  };

  const handleEditConstituency = async () => {
    if (!editingId) return;

    try {
      const { error } = await supabase
        .from("constituencies")
        .update({
          number: editData.number,
          name: editData.name
        })
        .eq("id", editingId);

      if (error) throw error;
      
      toast.success("Constituency updated successfully");
      setEditingId(null);
      fetchConstituencies(); // Refresh the list
    } catch (error) {
      console.error("Error updating constituency:", error);
      toast.error("Failed to update constituency");
    }
  };

  const handleDeleteConstituency = async (id: string) => {
    try {
      const { error } = await supabase
        .from("constituencies")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Constituency deleted successfully");
      fetchConstituencies(); // Refresh the list
    } catch (error) {
      console.error("Error deleting constituency:", error);
      toast.error("Failed to delete constituency");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/constituencies")}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Administrator Login</h1>
          </div>

          <Card className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Administrator ID
                </label>
                <Input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter administrator ID"
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="h-12"
                />
              </div>

              <Button type="submit" className="w-full h-12">
                Login
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/constituencies")}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Constituency Management</h1>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setIsAuthenticated(false)}
          >
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add New Constituency Form */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Add New Constituency</h2>
            
            <form onSubmit={handleAddConstituency} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Constituency Number
                </label>
                <Input
                  type="number"
                  value={newConstituency.number}
                  onChange={(e) => setNewConstituency({...newConstituency, number: e.target.value})}
                  placeholder="Enter constituency number"
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Constituency Name
                </label>
                <Input
                  type="text"
                  value={newConstituency.name}
                  onChange={(e) => setNewConstituency({...newConstituency, name: e.target.value})}
                  placeholder="Enter constituency name"
                  className="h-12"
                />
              </div>

              <Button type="submit" className="w-full h-12">
                <Plus className="mr-2 h-4 w-4" />
                Add Constituency
              </Button>
            </form>
          </Card>

          {/* Manage Existing Constituencies */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Manage Constituencies</h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading constituencies...</div>
              ) : constituencies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No constituencies found</div>
              ) : (
                constituencies.map((constituency) => (
                  <div key={constituency.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    {editingId === constituency.id ? (
                      // Edit mode
                      <div className="flex-1 space-y-2">
                        <Input
                          type="number"
                          value={editData.number}
                          onChange={(e) => setEditData({...editData, number: parseInt(e.target.value) || 0})}
                          className="h-10"
                        />
                        <Input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({...editData, name: e.target.value})}
                          className="h-10"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleEditConstituency}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <>
                        <div>
                          <div className="font-medium text-foreground">{constituency.number} - {constituency.name}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => startEditing(constituency)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteConstituency(constituency.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConstituencyManage;