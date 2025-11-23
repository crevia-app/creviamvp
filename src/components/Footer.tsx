import { Link } from "react-router-dom";
import { Instagram, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border mt-12 md:mt-20">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-bronze rounded-lg"></div>
              <span className="font-vollkorn text-lg md:text-xl font-bold">Crevia</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
              Own Your Story
            </p>
            <div className="flex gap-2 md:gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-bronze hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-bronze hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-bronze hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-poppins font-semibold text-sm md:text-base mb-3 md:mb-4">Quick Links</h4>
            <ul className="space-y-1.5 md:space-y-2">
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-bronze transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-bronze transition-colors">About</Link></li>
              <li><Link to="/pricing" className="text-sm text-muted-foreground hover:text-bronze transition-colors">Pricing</Link></li>
              <li><Link to="/crevia-connect" className="text-sm text-muted-foreground hover:text-bronze transition-colors">Crevia Connect</Link></li>
              <li><Link to="/crevia-link" className="text-sm text-muted-foreground hover:text-bronze transition-colors">Crevia Link</Link></li>
              <li><Link to="/crevia-ai" className="text-sm text-muted-foreground hover:text-bronze transition-colors">Crevia AI</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-poppins font-semibold text-sm md:text-base mb-3 md:mb-4">Legal</h4>
            <ul className="space-y-1.5 md:space-y-2">
              <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-bronze transition-colors">Terms</Link></li>
              <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-bronze transition-colors">Privacy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-poppins font-semibold text-sm md:text-base mb-3 md:mb-4">Contact</h4>
            <ul className="space-y-1.5 md:space-y-2">
              <li><a href="mailto:hello@crevia.app" className="text-sm text-muted-foreground hover:text-bronze transition-colors">hello@crevia.app</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 md:pt-8 border-t border-border text-center">
          <p className="text-xs md:text-sm text-muted-foreground">
            © 2024 Crevia • All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
