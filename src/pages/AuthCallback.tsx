import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Obrada autentifikacije...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get URL hash parameters (Supabase uses hash for tokens)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type') || searchParams.get('type');
        const error = hashParams.get('error') || searchParams.get('error');
        const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');

        // Handle errors from Supabase
        if (error) {
          console.error('Auth callback error:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || 'Došlo je do greške prilikom autentifikacije.');
          setTimeout(() => {
            navigate('/auth?error=' + encodeURIComponent(errorDescription || 'Greška prilikom autentifikacije'));
          }, 2000);
          return;
        }

        // Handle email confirmation (signup, email_change, recovery)
        if (type === 'signup' || type === 'email_change' || type === 'magiclink') {
          setMessage('Potvrđujemo vašu email adresu...');
          
          // If we have tokens, set the session first
          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (sessionError) {
              console.error('Session error:', sessionError);
              setStatus('error');
              setMessage('Greška prilikom potvrde. Link je možda istekao.');
              setTimeout(() => {
                navigate('/auth?error=' + encodeURIComponent('Link za potvrdu je istekao. Molimo registrujte se ponovo.'));
              }, 2500);
              return;
            }
          }

          // Sign out the user so they have to log in manually
          await supabase.auth.signOut();
          
          setStatus('success');
          setMessage('Email adresa je uspješno potvrđena!');
          
          // Redirect to login with success message
          setTimeout(() => {
            navigate('/auth?verified=true');
          }, 1500);
          return;
        }

        // Handle password recovery
        if (type === 'recovery') {
          setMessage('Preusmjeravanje na stranicu za promjenu lozinke...');
          
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
          }
          
          // Redirect to password reset page
          navigate('/auth?mode=reset&recovery=true');
          return;
        }

        // For other cases, check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Check if user has completed registration
          const { data: profile } = await supabase
            .from('profiles')
            .select('registration_completed')
            .eq('id', session.user.id)
            .single();

          if (profile?.registration_completed) {
            navigate('/dashboard');
          } else {
            navigate('/registracija');
          }
        } else {
          // No session, redirect to login
          navigate('/auth');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('Došlo je do neočekivane greške.');
        setTimeout(() => {
          navigate('/auth?error=' + encodeURIComponent('Došlo je do greške. Molimo pokušajte ponovo.'));
        }, 2000);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {status === 'processing' && (
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-12 w-12 mx-auto text-destructive" />
            )}
            <p className={`text-lg font-medium ${
              status === 'success' ? 'text-green-600' : 
              status === 'error' ? 'text-destructive' : 
              'text-muted-foreground'
            }`}>
              {message}
            </p>
            {status === 'processing' && (
              <p className="text-sm text-muted-foreground">
                Molimo sačekajte...
              </p>
            )}
            {status === 'success' && (
              <p className="text-sm text-muted-foreground">
                Preusmjeravamo vas na stranicu za prijavu...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
