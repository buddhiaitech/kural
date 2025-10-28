import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import loginBg from "@/assets/login-bg.png";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobileNumber || !password) {
      toast.error("Please enter both mobile number and password");
      return;
    }

    // Simulate login
    toast.success("Login successful!");
    navigate("/constituencies");
  };

  const handleOTPLogin = () => {
    if (!mobileNumber) {
      toast.error("Please enter mobile number");
      return;
    }
    toast.success("OTP sent to your mobile number");
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-primary text-center mb-8">
            Sign In to your account
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="tel"
                placeholder="Mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="h-14 bg-muted border-0 rounded-2xl text-base placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 bg-muted border-0 rounded-2xl text-base placeholder:text-muted-foreground/60 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="text-right">
              <button
                type="button"
                className="text-secondary font-medium hover:underline text-sm"
              >
                Recover Password
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl text-lg font-semibold shadow-lg"
            >
              Login
            </Button>

            <div className="text-center text-muted-foreground my-4">
              Or Sign in with your mobile number
            </div>

            <Button
              type="button"
              onClick={handleOTPLogin}
              className="w-full h-14 bg-secondary hover:bg-secondary/90 text-white rounded-2xl text-lg font-semibold shadow-lg"
            >
              Login with OTP
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
