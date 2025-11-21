import { Link } from "react-router-dom";
import { Instagram, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border mt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-bronze rounded-lg"></div>
              <span className="font-vollkorn text-xl font-bold">Crevia</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Own Your Story
            </p>
            <div className="flex gap-3">
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
            <h4 className="font-poppins font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-sm text-muted-foreground hover:text-bronze transition-colors">Products</Link></li>
              <li><Link to="/pricing" className="text-sm text-muted-foreground hover:text-bronze transition-colors">Pricing</Link></li>
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-bronze transition-colors">About</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-poppins font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-bronze transition-colors">Terms</Link></li>
              <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-bronze transition-colors">Privacy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-poppins font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li><a href="mailto:hello@crevia.app" className="text-sm text-muted-foreground hover:text-bronze transition-colors">hello@crevia.app</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Crevia • All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
