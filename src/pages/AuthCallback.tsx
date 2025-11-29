import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Obrada autentifikacije...');

  useEffect(() => {
    // Listen for auth state changes - this catches when Supabase processes the token
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session) {
        // User just confirmed email and got signed in
        // SECURITY: Verify this is actually a new email confirmation by checking:
        // 1. The URL contains type=signup or type=email (from Supabase)
        // 2. The email was confirmed very recently (within last 60 seconds)
        const urlHash = window.location.hash.toLowerCase();
        const isEmailConfirmation = urlHash.includes('type=signup') || 
                                    urlHash.includes('type=email') ||
                                    urlHash.includes('type=magiclink');
        
        // Check if email was confirmed recently (within 60 seconds)
        const emailConfirmedAt = session.user.email_confirmed_at 
          ? new Date(session.user.email_confirmed_at).getTime() 
          : 0;
        const now = Date.now();
        const isRecentConfirmation = (now - emailConfirmedAt) < 60000; // 60 seconds
        
        if (isEmailConfirmation && isRecentConfirmation) {
          // This is a legitimate email confirmation
          setStatus('success');
          setMessage('Email adresa je uspješno potvrđena!');
          
          // SECURITY: Use sessionStorage instead of URL params to pass verification status
          // This prevents URL manipulation attacks
          sessionStorage.setItem('email_verified', 'true');
          
          // Wait a moment to show success, then sign out and redirect
          setTimeout(async () => {
            await supabase.auth.signOut();
            navigate('/auth', { replace: true });
          }, 2000);
          return;
        }
        
        // Regular sign in (not email confirmation) - check profile and redirect
        const { data: profile } = await supabase
          .from('profiles')
          .select('registration_completed')
          .eq('id', session.user.id)
          .single();

        if (profile?.registration_completed) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/registracija', { replace: true });
        }
      } else if (event === 'PASSWORD_RECOVERY') {
        // User clicked password recovery link
        navigate('/auth?mode=reset&recovery=true', { replace: true });
      } else if (event === 'SIGNED_OUT') {
        // Already handled above
      }
    });

    // Also check URL for errors
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');
    
    if (error) {
      setStatus('error');
      setMessage(errorDescription || 'Došlo je do greške prilikom autentifikacije.');
      setTimeout(() => {
        navigate('/auth?error=' + encodeURIComponent(errorDescription || 'Greška'), { replace: true });
      }, 3000);
    }

    // Timeout fallback - if nothing happens in 10 seconds, redirect to auth
    const timeout = setTimeout(() => {
      if (status === 'processing') {
        navigate('/auth', { replace: true });
      }
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate, status]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              {status === 'processing' && (
                <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
              )}
              {status === 'success' && (
                <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              )}
              {status === 'error' && (
                <XCircle className="h-16 w-16 mx-auto text-destructive" />
              )}
              <h2 className={`text-xl font-semibold ${
                status === 'success' ? 'text-green-600 dark:text-green-400' : 
                status === 'error' ? 'text-destructive' : 
                'text-foreground'
              }`}>
                {status === 'processing' ? 'Obrada u toku...' : 
                 status === 'success' ? 'Uspješno!' : 'Greška'}
              </h2>
              <p className="text-muted-foreground">
                {message}
              </p>
              {status === 'success' && (
                <p className="text-sm text-muted-foreground animate-pulse">
                  Preusmjeravamo vas na stranicu za prijavu...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthCallback;
