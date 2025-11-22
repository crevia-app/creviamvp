import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const TermsOfService = () => {
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
          <h1 className="font-vollkorn text-3xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <Card className="p-6 md:p-8 space-y-8">
          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Crevia, you agree to be bound by these Terms of Service and all applicable laws and 
              regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform. 
              The materials contained in this platform are protected by applicable copyright and trademark law.
            </p>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">User Accounts</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
                Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
              </p>
              <p>
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Maintaining the confidentiality of your account and password</li>
                <li>Restricting access to your computer and account</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">User Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              As a user of Crevia, you agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate and truthful information in your profile and campaigns</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Respect intellectual property rights of others</li>
              <li>Not use the platform for any unlawful or fraudulent purpose</li>
              <li>Not harass, abuse, or harm other users</li>
              <li>Not transmit spam, viruses, or malicious code</li>
              <li>Not attempt to gain unauthorized access to the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Creator-Brand Relationships</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Crevia facilitates connections between creators and brands but is not a party to any agreements made between them. 
                All collaborations, campaigns, and partnerships are agreements directly between creators and brands.
              </p>
              <p>
                We are not responsible for:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>The quality or delivery of services by creators</li>
                <li>Payment disputes between parties</li>
                <li>The accuracy of campaign descriptions or creator profiles</li>
                <li>Any damages resulting from collaborations formed through the platform</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Payments and Fees</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Certain features of Crevia may require payment of fees. You agree to pay all applicable fees as described on the platform.
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>All fees are non-refundable unless otherwise stated</li>
                <li>Prices are subject to change with notice</li>
                <li>You are responsible for all taxes associated with your use of the platform</li>
                <li>Subscription fees are billed in advance on a recurring basis</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The platform and its original content, features, and functionality are owned by Crevia and are protected by 
              international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You retain all rights to content you submit or upload to the platform. By posting content, you grant Crevia 
              a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content in connection 
              with operating and promoting the platform.
            </p>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Prohibited Activities</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You may not access or use the platform for any purpose other than that for which we make it available. 
              Prohibited activities include but are not limited to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Systematically retrieving data to create a competing service</li>
              <li>Using the platform to advertise or sell goods and services unrelated to creator-brand collaborations</li>
              <li>Engaging in unauthorized framing of or linking to the platform</li>
              <li>Interfering with, disrupting, or creating an undue burden on the platform</li>
              <li>Attempting to impersonate another user or person</li>
              <li>Using any information obtained from the platform to harass, abuse, or harm others</li>
            </ul>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account and access to the platform immediately, without prior notice or liability, 
              for any reason, including if you breach these Terms of Service. Upon termination, your right to use the platform 
              will immediately cease. All provisions of the Terms which by their nature should survive termination shall survive, 
              including ownership provisions, warranty disclaimers, and limitations of liability.
            </p>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall Crevia, its directors, employees, or agents be liable for any indirect, incidental, special, 
              consequential, or punitive damages, including loss of profits, data, or other intangible losses, resulting from 
              your access to or use of or inability to access or use the platform. Our total liability shall not exceed the 
              amount you paid us in the twelve (12) months prior to the event giving rise to the liability.
            </p>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              The platform is provided on an "AS IS" and "AS AVAILABLE" basis. Crevia makes no warranties, expressed or implied, 
              and hereby disclaims all warranties including, without limitation, implied warranties of merchantability, fitness 
              for a particular purpose, or non-infringement. We do not warrant that the platform will be uninterrupted, 
              secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which Crevia operates, 
              without regard to its conflict of law provisions. Any disputes arising from these Terms will be resolved in the 
              courts of that jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify or replace these Terms at any time at our sole discretion. We will provide notice 
              of any material changes by posting the new Terms on this page and updating the "Last updated" date. Your continued 
              use of the platform after any changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="font-poppins text-sm">
                <strong>Email:</strong> legal@crevia.com<br />
                <strong>Address:</strong> 123 Creator Street, Innovation City, IC 12345
              </p>
            </div>
          </section>
        </Card>
      </main>
    </div>
  );
};

export default TermsOfService;
