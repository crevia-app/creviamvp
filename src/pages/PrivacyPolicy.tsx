import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-black border-b border-white/10">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link to="/" className="font-vollkorn text-2xl font-bold text-white">
            Crevia
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-white/80 hover:text-bronze">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl px-4 py-8 md:py-16">
        <div className="mb-8 md:mb-12">
          <h1 className="font-vollkorn text-3xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <Card className="p-6 md:p-8 space-y-8">
          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              At Crevia, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our platform. Please read this privacy policy carefully. 
              If you do not agree with the terms of this privacy policy, please do not access the platform.
            </p>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Information We Collect</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-poppins font-semibold text-foreground mb-2">Personal Information</h3>
                <p>
                  We collect personal information that you voluntarily provide to us when you register on the platform, 
                  express an interest in obtaining information about us or our products and services, or otherwise contact us.
                  This may include:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Profile information (bio, avatar, social media links)</li>
                  <li>Professional information (creator type, business details)</li>
                  <li>Payment and billing information</li>
                </ul>
              </div>

              <div>
                <h3 className="font-poppins font-semibold text-foreground mb-2">Automatically Collected Information</h3>
                <p>
                  When you access our platform, we automatically collect certain information about your device, including:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>IP address and browser type</li>
                  <li>Operating system and device identifiers</li>
                  <li>Usage data and analytics</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use the information we collect or receive to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Facilitate account creation and authentication</li>
              <li>Provide and maintain our services</li>
              <li>Process transactions and send notifications</li>
              <li>Improve and personalize user experience</li>
              <li>Send marketing and promotional communications</li>
              <li>Detect and prevent fraud and security threats</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Sharing Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We may share your information in the following situations:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>With Other Users:</strong> When you engage with campaigns or collaborations, certain profile information may be visible to other users</li>
              <li><strong>With Service Providers:</strong> We may share your information with third-party vendors who perform services on our behalf</li>
              <li><strong>For Business Transfers:</strong> In connection with any merger, sale of company assets, or acquisition</li>
              <li><strong>With Your Consent:</strong> We may disclose your information for any other purpose with your consent</li>
              <li><strong>Legal Requirements:</strong> If required by law or in response to valid requests by public authorities</li>
            </ul>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information. 
              However, no electronic transmission over the Internet or information storage technology can be guaranteed to be 
              100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Your Privacy Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>The right to access your personal information</li>
              <li>The right to correct inaccurate information</li>
              <li>The right to request deletion of your information</li>
              <li>The right to restrict or object to processing</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our platform and hold certain information. 
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, 
              if you do not accept cookies, you may not be able to use some portions of our platform.
            </p>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our platform is not intended for children under 13 years of age. We do not knowingly collect personal 
              information from children under 13. If you become aware that a child has provided us with personal information, 
              please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy 
              Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions or concerns about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="font-poppins text-sm">
                <strong>Email:</strong> privacy@crevia.com<br />
                <strong>Address:</strong> 123 Creator Street, Innovation City, IC 12345
              </p>
            </div>
          </section>
        </Card>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
