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
    // Check the URL for auth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code'); // PKCE flow uses code parameter
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    const fullHash = window.location.hash;
    
    console.log('AuthCallback - Full URL:', window.location.href);
    console.log('AuthCallback - Code param:', code);
    console.log('AuthCallback - URL hash:', fullHash);
    
    // Check for hash-based tokens (older flow) or code parameter (PKCE flow)
    const hasAccessToken = fullHash.includes('access_token=');
    const hasCode = !!code;
    const isPasswordRecovery = fullHash.toLowerCase().includes('type=recovery') || 
                               urlParams.get('type') === 'recovery';
    
    // Any callback with code or access_token that isn't password recovery is email confirmation
    const isEmailConfirmation = (hasAccessToken || hasCode) && !isPasswordRecovery;
    
    console.log('AuthCallback - Has code:', hasCode);
    console.log('AuthCallback - Has access token:', hasAccessToken);
    console.log('AuthCallback - Is password recovery:', isPasswordRecovery);
    console.log('AuthCallback - Is email confirmation:', isEmailConfirmation);
    
    // Handle errors first
    if (error) {
      setStatus('error');
      setMessage(errorDescription || 'Došlo je do greške prilikom autentifikacije.');
      setTimeout(() => {
        navigate('/auth', { replace: true });
      }, 3000);
      return;
    }
    
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
    
    // If we have a code, we need to exchange it for a session (PKCE flow)
    if (hasCode && isEmailConfirmation) {
      const exchangeCode = async () => {
        console.log('Exchanging code for session...');
        
        // Supabase client automatically handles the code exchange when we call getSession
        // or when we use exchangeCodeForSession
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        console.log('Code exchange result:', data?.user?.email, exchangeError);
        
        if (exchangeError) {
          console.error('Code exchange error:', exchangeError);
          setStatus('error');
          setMessage('Greška pri verifikaciji: ' + exchangeError.message);
          setTimeout(() => {
            navigate('/auth', { replace: true });
          }, 3000);
          return;
        }
        
        if (data?.session) {
          handleEmailConfirmation();
        }
      };
      
      exchangeCode();
      return; // Don't set up auth listener if we're handling PKCE
    }
    
    // For hash-based flow, check session
    if (hasAccessToken && isEmailConfirmation) {
      const checkAndHandle = async () => {
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
