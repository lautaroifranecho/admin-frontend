import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import norrisLogo from "@/assets/images/Norris-legal3-300x97.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [is2FAStep, setIs2FAStep] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, verify2FA } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!is2FAStep) {
        const loggedInUser = await signIn(email, password, rememberMe);
        const { data: securityData } = await supabase
          .from('user_security')
          .select('two_factor_enabled')
          .eq('user_id', loggedInUser.id)
          .single();

        if (securityData?.two_factor_enabled) {
          setIs2FAStep(true);
        } else {
          setLocation("/dashboard");
        }
      } else {
        await verify2FA(twoFactorCode);
        setLocation("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.message || "Login failed. Please try again.";
      setError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md mx-4 shadow-xl">
        <CardContent className="p-8">
          <div className="flex justify-center mb-4">
            <img
              src={norrisLogo}
              alt="Norris Legal Logo"
              style={{ maxWidth: 200, height: "auto" }}
            />
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {!is2FAStep ? (
              <>
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="rounded-xl"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                </div>

                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="rounded-xl pr-12"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-blue-800"
                    disabled={isLoading}
                  >
                    Forgot Password?
                  </button>
                </div>
              </>
            ) : (
              <div>
                <Label htmlFor="2fa" className="block text-sm font-medium text-gray-700 mb-2">
                  Two-Factor Authentication Code
                </Label>
                <Input
                  id="2fa"
                  type="text"
                  placeholder="Enter 6-digit code"
                  className="rounded-xl"
                  value={twoFactorCode}
                  onChange={e => setTwoFactorCode(e.target.value)}
                  required
                  maxLength={6}
                  pattern="[0-9]*"
                  disabled={isLoading}
                />
                <p className="mt-2 text-sm text-gray-600">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-xl font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : is2FAStep ? "Verify Code" : "Sign In"}
            </Button>

            {is2FAStep && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIs2FAStep(false)}
                  className="text-sm text-primary hover:text-blue-800"
                  disabled={isLoading}
                >
                  Back to Login
                </button>
              </div>
            )}
          </form>
{/* 
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">Protected by SSL encryption</p>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
