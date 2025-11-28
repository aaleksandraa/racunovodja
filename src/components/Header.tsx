import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, User, LogOut, Shield, Menu, X, Home, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  user?: any;
}

const Header = ({ user }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroGradient, setHeroGradient] = useState("");
  
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    // Generate random darker gradient for mobile menu
    const gradients = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)", // Blue to purple
      "linear-gradient(135deg, #434343 0%, #000000 50%, #434343 100%)", // Dark gray to black
      "linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)", // Deep blue
      "linear-gradient(135deg, #283c86 0%, #45a247 50%, #283c86 100%)", // Navy to forest green
      "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #0f2027 100%)", // Dark teal
      "linear-gradient(135deg, #2c3e50 0%, #3498db 50%, #2c3e50 100%)", // Dark slate to blue
      "linear-gradient(135deg, #232526 0%, #414345 50%, #232526 100%)", // Charcoal
      "linear-gradient(135deg, #134e5e 0%, #71b280 50%, #134e5e 100%)", // Ocean teal to green
      "linear-gradient(135deg, #360033 0%, #0b8793 50%, #360033 100%)", // Deep purple to teal
      "linear-gradient(135deg, #1f4037 0%, #99f2c8 50%, #1f4037 100%)", // Forest to mint
    ];
    
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
    setHeroGradient(randomGradient);

    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    // SECURITY: Using is_admin_secure() RPC which uses auth.uid() internally
    // This prevents attackers from spoofing admin status by passing arbitrary user IDs
    const { data, error } = await supabase.rpc('is_admin_secure');
    
    if (error) {
      console.error('Admin check error:', error);
      setIsAdmin(false);
      return;
    }
    
    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Greška prilikom odjave");
    } else {
      toast.success("Uspješno ste se odjavili");
      navigate("/");
    }
  };

  return (
    <header className={`relative z-10 w-full border-b ${isHomePage ? 'border-white/10' : 'border-border bg-white'}`}>
      <div className="container px-4 md:px-6">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group transition-all">
            <div className={`h-9 w-9 md:h-10 md:w-10 rounded-xl shadow-md group-hover:shadow-lg transition-all ${isHomePage ? 'bg-white/20' : 'bg-primary/20'}`} />
            <span className={`text-lg md:text-xl font-bold ${isHomePage ? 'text-white' : 'text-foreground'}`}>
              Moj računovođa
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/search">
              <Button variant="ghost" size="sm" className={`gap-2 ${isHomePage ? 'text-white hover:bg-white/10 hover:text-white' : 'hover:bg-accent'}`}>
                <Search className="h-4 w-4" />
                Pretraga
              </Button>
            </Link>

            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className={`gap-2 ${isHomePage ? 'text-white hover:bg-white/10 hover:text-white' : 'hover:bg-accent'}`}>
                      <Shield className="h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                 
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className={`gap-2 ${isHomePage ? 'text-white hover:bg-white/10 hover:text-white' : 'hover:bg-accent'}`}>
                      <User className="h-4 w-4" />
                      Profil
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        Moj profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-destructive">
                      <LogOut className="h-4 w-4" />
                      Odjava
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className={isHomePage ? 'text-white hover:bg-white/10 hover:text-white' : ''}>
                    Prijava
                  </Button>
                </Link>
                <Link to="/auth?mode=register">
                  <Button size="sm" className={isHomePage ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm' : ''}>
                    Registracija
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm" className={`p-2 ${isHomePage ? 'text-white' : ''}`}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-[280px] sm:w-[320px] border-white/20 text-white"
              style={{ background: heroGradient || "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)" }}
            >
              <SheetHeader className="text-left mb-6">
                <SheetTitle className="text-xl font-bold text-white">Meni</SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col gap-3">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-white/10 hover:text-white" size="lg">
                    <Home className="h-5 w-5" />
                    Početna
                  </Button>
                </Link>
                
                <Link to="/search" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-white/10 hover:text-white" size="lg">
                    <Search className="h-5 w-5" />
                    Pretraga
                  </Button>
                </Link>

                {user ? (
                  <>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-white/10 hover:text-white" size="lg">
                      <Shield className="h-5 w-5" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
                
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-white/10 hover:text-white" size="lg">
                    <User className="h-5 w-5" />
                    Moj profil
                  </Button>
                </Link>
                    
                    <div className="my-2 border-t border-white/20" />
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2 text-white hover:bg-white/10" 
                      size="lg"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      Odjava
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="my-2 border-t border-white/20" />
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm" size="lg">
                        Prijava
                      </Button>
                    </Link>
                    <Link to="/auth?mode=register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm" size="lg">
                        Registracija
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
