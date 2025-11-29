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
    
    // If we have a code parameter, Supabase needs to exchange it
    // But PKCE requires the code_verifier from the original browser session
    // If code_verifier is missing (different browser/tab), the code exchange will fail
    // In that case, we should inform the user that email was verified but they need to login
    if (hasCode) {
      const tryExchangeCode = async () => {
        console.log('Attempting code exchange...');
        
        try {
          // First check if there's already a session (code might have been auto-processed)
          const { data: { session: existingSession } } = await supabase.auth.getSession();
          
          if (existingSession?.user) {
            console.log('Session already exists:', existingSession.user.email);
            if (isEmailConfirmation) {
              handleEmailConfirmation();
            }
            return;
          }
          
          // Try to exchange the code - this will only work if code_verifier exists
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.log('Code exchange failed (expected if different browser):', exchangeError.message);
            
            // If PKCE fails, the email IS still verified on Supabase's side
            // We just can't create a session. Show success and redirect to login.
            if (isEmailConfirmation) {
              setStatus('success');
              setMessage('Email adresa je uspješno potvrđena!');
              sessionStorage.setItem('email_verified', 'true');
              
              setTimeout(() => {
                navigate('/auth', { replace: true });
              }, 2000);
            }
            return;
          }
          
          console.log('Code exchange successful:', data?.user?.email);
          if (data?.session && isEmailConfirmation) {
            handleEmailConfirmation();
          }
        } catch (err) {
          console.error('Unexpected error:', err);
          // Still show success for email confirmation since the email IS verified
          if (isEmailConfirmation) {
            setStatus('success');
            setMessage('Email adresa je uspješno potvrđena!');
            sessionStorage.setItem('email_verified', 'true');
            
            setTimeout(() => {
              navigate('/auth', { replace: true });
            }, 2000);
          }
        }
      };
      
      tryExchangeCode();
      return;
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
