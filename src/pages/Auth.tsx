import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import Header from "@/components/Header";
import { z } from "zod";

// Input validation schemas
const emailSchema = z.string().email("Email adresa nije validna").max(255, "Email mora biti kraći od 255 karaktera");
const passwordSchema = z.string()
  .min(8, "Lozinka mora imati najmanje 8 karaktera")
  .max(128, "Lozinka je preduga")
  .regex(/[A-Z]/, "Lozinka mora sadržavati barem jedno veliko slovo")
  .regex(/[a-z]/, "Lozinka mora sadržavati barem jedno malo slovo")
  .regex(/[0-9]/, "Lozinka mora sadržavati barem jedan broj");
const nameSchema = z.string().trim().min(2, "Ime mora imati najmanje 2 karaktera").max(100, "Ime je predugo");

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check for URL parameters (verified, error, recovery)
  // SECURITY: Use sessionStorage to pass verification status instead of URL params
  useEffect(() => {
    const verified = sessionStorage.getItem('email_verified');
    const error = searchParams.get('error');
    const recovery = searchParams.get('recovery');
    
    if (verified === 'true') {
      setSuccessMessage('Uspješno ste potvrdili email adresu! Sada se možete prijaviti.');
      setMode('login');
      // Clear the flag immediately after reading
      sessionStorage.removeItem('email_verified');
    }
    
    if (error) {
      setErrorMessage(decodeURIComponent(error));
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
    
    if (recovery === 'true') {
      setMode('reset');
      setSuccessMessage('Unesite novu lozinku za vaš račun.');
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  // Track URL parameter changes for mode
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'register') {
      setMode('register');
    } else if (modeParam === 'reset') {
      setMode('reset');
    } else {
      setMode('login');
    }
  }, [searchParams]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.email = error.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.password = error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      nameSchema.parse(firstName);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.firstName = error.errors[0].message;
      }
    }
    
    try {
      nameSchema.parse(lastName);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.lastName = error.errors[0].message;
      }
    }
    
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.email = error.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.password = error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setSuccessMessage(null);
    setErrorMessage(null);
    
    if (!validateLogin()) {
      toast.error("Molimo popravite greške u formi");
      return;
    }

    // SECURITY: Check rate limiting before attempting login
    if (loginAttempts >= 5) {
      setIsRateLimited(true);
      toast.error("Previše neuspjelih pokušaja. Molimo pričekajte 15 minuta.");
      return;
    }
    
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      // Increment failed login attempts
      setLoginAttempts(prev => prev + 1);
      
      // Generic error message to prevent user enumeration
      toast.error("Pogrešan email ili lozinka");
    } else {
      // Reset attempts on successful login
      setLoginAttempts(0);
      toast.success("Uspješno ste se prijavili!");
      navigate("/dashboard");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setSuccessMessage(null);
    setErrorMessage(null);
    
    if (!validateRegister()) {
      toast.error("Molimo popravite greške u formi");
      return;
    }
    
    setIsLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (authError) {
      setIsLoading(false);
      // SECURITY: Generic error message to prevent user enumeration
      toast.error("Greška pri registraciji. Molimo provjerite podatke i pokušajte ponovo.");
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
          }
        ]);

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }
    }

    setIsLoading(false);
    toast.success("Uspješno ste se registrovali! Provjerite email za potvrdu.");
    setMode('login');
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Molimo unesite vašu email adresu");
      return;
    }
    
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }
    
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    setIsLoading(false);

    if (error) {
      toast.error("Greška pri slanju emaila: " + error.message);
    } else {
      toast.success("Link za resetovanje lozinke je poslan na vaš email!");
      setMode('login');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>
              {mode === 'login' ? 'Prijava' : mode === 'register' ? 'Registracija' : 'Resetuj lozinku'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' 
                ? 'Prijavite se na vaš račun' 
                : mode === 'register'
                ? 'Kreirajte novi račun da biste počeli'
                : 'Unesite vašu email adresu za resetovanje lozinke'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Success Message */}
            {successMessage && (
              <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950/50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Error Message */}
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handlePasswordReset} className="space-y-4">
              {/* SECURITY: Show rate limit warning */}
              {isRateLimited && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <p className="text-sm text-destructive">
                    Previše neuspjelih pokušaja. Molimo pričekajte 15 minuta prije ponovnog pokušaja.
                  </p>
                </div>
              )}
              
              {loginAttempts >= 3 && loginAttempts < 5 && !isRateLimited && mode === 'login' && (
                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm text-yellow-700">
                    Upozorenje: Preostalo vam je {5 - loginAttempts} pokušaj(a) prije privremenog zaključavanja.
                  </p>
                </div>
              )}
              
              {mode === 'register' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Ime</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        setErrors({ ...errors, firstName: '' });
                      }}
                      required
                      maxLength={100}
                      className={errors.firstName ? "border-destructive" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Prezime</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        setErrors({ ...errors, lastName: '' });
                      }}
                      required
                      maxLength={100}
                      className={errors.lastName ? "border-destructive" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName}</p>
                    )}
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: '' });
                  }}
                  required
                  maxLength={255}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              
              {mode !== 'reset' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Lozinka</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors({ ...errors, password: '' });
                    }}
                    required
                    maxLength={128}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full bg-hero-gradient" disabled={isLoading || (isRateLimited && mode === 'login')}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'login' ? 'Prijavi se' : mode === 'register' ? 'Registruj se' : 'Pošalji link'}
              </Button>
            </form>

            {mode === 'login' && (
              <div className="mt-3 text-center">
                <button
                  onClick={() => setMode('reset')}
                  className="text-sm text-muted-foreground hover:text-primary hover:underline"
                >
                  Zaboravio si lozinku?
                </button>
              </div>
            )}

            <div className="mt-4 text-center text-sm">
              {mode === 'login' ? (
                <p>
                  Nemate račun?{' '}
                  <button
                    onClick={() => setMode('register')}
                    className="text-primary hover:underline"
                  >
                    Registrujte se
                  </button>
                </p>
              ) : mode === 'register' ? (
                <p>
                  Već imate račun?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-primary hover:underline"
                  >
                    Prijavite se
                  </button>
                </p>
              ) : (
                <p>
                  Sjetili ste se lozinke?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-primary hover:underline"
                  >
                    Prijavite se
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
