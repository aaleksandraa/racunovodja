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
    // Check the URL hash immediately
    const fullHash = window.location.hash;
    console.log('AuthCallback - Full URL:', window.location.href);
    console.log('AuthCallback - URL hash:', fullHash);
    
    // If there's an access_token in the URL, this is coming from an email link
    const hasAccessToken = fullHash.includes('access_token=');
    const isPasswordRecovery = fullHash.toLowerCase().includes('type=recovery');
    
    // Any callback with access_token that isn't password recovery is email confirmation
    const isEmailConfirmation = hasAccessToken && !isPasswordRecovery;
    
    console.log('AuthCallback - Has access token:', hasAccessToken);
    console.log('AuthCallback - Is password recovery:', isPasswordRecovery);
    console.log('AuthCallback - Is email confirmation:', isEmailConfirmation);
    
    // Function to handle email confirmation
    const handleEmailConfirmation = async () => {
      console.log('Handling email confirmation - showing success');
      setStatus('success');
      setMessage('Email adresa je uspješno potvrđena!');
      
      // SECURITY: Use sessionStorage instead of URL params
      sessionStorage.setItem('email_verified', 'true');
      
      // Wait a moment to show success, then sign out and redirect
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/auth', { replace: true });
      }, 2000);
    };
    
    // If this looks like email confirmation, process it
    if (isEmailConfirmation) {
      // Give Supabase a moment to process the hash tokens, then check session
      const checkAndHandle = async () => {
        // Small delay for Supabase to process
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session check:', session?.user?.email);
        
        if (session?.user) {
          handleEmailConfirmation();
        }
      };
      
      checkAndHandle();
    }
    
    // Listen for auth state changes as backup
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'User:', session?.user?.email);
      
      if (event === 'SIGNED_IN' && session && isEmailConfirmation) {
        handleEmailConfirmation();
        return;
      }
      
      if (event === 'SIGNED_IN' && session && !isEmailConfirmation) {
        // Regular sign in - check profile and redirect
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
