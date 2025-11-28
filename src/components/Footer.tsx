import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">O nama</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Online direktorij računovođa, knjigovođa i revizora u Bosni i Hercegovini.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Brzi linkovi</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Početna
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pretraga
                </Link>
              </li>
              <li>
                <Link to="/mapa" className="text-muted-foreground hover:text-foreground transition-colors">
                  Mapa
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Usluge</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/search?category=racunovodstvo" className="text-muted-foreground hover:text-foreground transition-colors">
                  Računovodstvo
                </Link>
              </li>
              <li>
                <Link to="/search?category=knjigovodstvo" className="text-muted-foreground hover:text-foreground transition-colors">
                  Knjigovodstvo
                </Link>
              </li>
              <li>
                <Link to="/search?category=revizija" className="text-muted-foreground hover:text-foreground transition-colors">
                  Revizija
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact/Registration */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Za profesionalce</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/auth?mode=register" className="text-muted-foreground hover:text-foreground transition-colors">
                  Registruj se
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                  Prijavi se
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Direktorij profesionalaca. Sva prava zadržana.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;