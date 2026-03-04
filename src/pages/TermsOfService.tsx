import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
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

      <main className="container max-w-4xl px-4 py-8 md:py-16">
        <div className="mb-8 md:mb-12">
          <h1 className="font-vollkorn text-3xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Effective Date: March 8th, 2026
          </p>
        </div>

        <Card className="p-6 md:p-8 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">1. Acceptance of Terms</h2>
            <div className="text-muted-foreground leading-relaxed space-y-3">
              <p>
                These Terms of Service ("Terms") constitute a binding legal agreement between you ("User," "you," or "your") and Crevia Ventures ("Crevia," "we," "us," or "our"), a company organized under the laws of Kenya.
              </p>
              <p>
                By registering for, accessing, or using the Crevia platform—including Crevia Studio, Kira AI, Crevia Link, and any associated events (e.g., Crevia Summit)—you acknowledge that you have read, understood, and agree to be bound by these Terms.
              </p>
              <p className="font-semibold text-foreground">
                IF YOU DO NOT AGREE TO THESE TERMS, YOU MAY NOT USE OUR SERVICES.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">2. Accounts and Registration</h2>
            <div className="text-muted-foreground leading-relaxed space-y-4">
              <div>
                <h3 className="font-poppins font-semibold text-foreground mb-2">2.1 Account Types</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>"Creative":</strong> Individuals using the Service for portfolios, link-in-bio, or freelance management.</li>
                  <li><strong>"Brand/Business":</strong> Entities using the Service for hiring, contract management, or enterprise API access.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-poppins font-semibold text-foreground mb-2">2.2 Security</h3>
                <p>You are responsible for maintaining the confidentiality of your login credentials. You accept responsibility for all activities that occur under your account.</p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">3. Intellectual Property Rights</h2>
            <div className="text-muted-foreground leading-relaxed space-y-4">
              <div>
                <h3 className="font-poppins font-semibold text-foreground mb-2">3.1 Our IP Rights</h3>
                <p>The Service, including its "look and feel" (e.g., text, graphics, images, logos), proprietary code, software, and the Kira AI algorithms, is the exclusive property of Crevia Ventures.</p>
              </div>
              <div>
                <h3 className="font-poppins font-semibold text-foreground mb-2">3.2 Your Content ("Own Your Story")</h3>
                <p>You retain full ownership of all data, text, files, information, usernames, images, graphics, photos, profiles, audio and video clips, sounds, musical works, works of authorship, applications, links, and other content or materials (collectively, "User Content") that you submit, post, or display on or via the Service.</p>
              </div>
              <div>
                <h3 className="font-poppins font-semibold text-foreground mb-2">3.3 License Grant</h3>
                <p>By posting User Content, you grant Crevia a non-exclusive, worldwide, royalty-free, sublicensable, and transferable license to use, reproduce, display, distribute, and modify your User Content solely for the purposes of operating, developing, providing, and improving the Service.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">4. Specific Terms for "Kira" (AI Assistant)</h2>
            <div className="text-muted-foreground leading-relaxed space-y-4">
              <div>
                <h3 className="font-poppins font-semibold text-foreground mb-2">4.1 Nature of Service</h3>
                <p>Kira is an artificial intelligence tool designed to assist with creative strategy and business operations. Kira is not a lawyer, accountant, or professional financial advisor.</p>
              </div>
              <div>
                <h3 className="font-poppins font-semibold text-foreground mb-2">4.2 Disclaimer of Reliability</h3>
                <p className="mb-2">Artificial intelligence is probabilistic and may generate incorrect, offensive, or biased information ("Hallucinations"). You acknowledge that:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>You should not rely on Kira as a sole source of truth or professional advice.</li>
                  <li>You are responsible for evaluating the accuracy of any Output before using it.</li>
                  <li>Crevia makes no warranties regarding the accuracy, completeness, or reliability of any Output generated by Kira.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-poppins font-semibold text-foreground mb-2">4.3 Liability Shield</h3>
                <p>Crevia shall not be liable for any damages, losses, or legal consequences resulting from your use of or reliance on Kira, including but not limited to business failures, contract disputes, or financial losses.</p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">5. Payment and Subscriptions</h2>
            <div className="text-muted-foreground leading-relaxed space-y-4">
              <div>
                <h3 className="font-poppins font-semibold text-foreground mb-2">5.1 Fees</h3>
                <p>Certain aspects of the Service may be provided for a fee or other charge. If you elect to use paid aspects of the Service, you agree to the pricing and payment terms as we may update them from time to time.</p>
              </div>
              <div>
                <h3 className="font-poppins font-semibold text-foreground mb-2">5.2 No Refunds</h3>
                <p>All fees are non-refundable, except as required by applicable Kenyan law.</p>
              </div>
              <div>
                <h3 className="font-poppins font-semibold text-foreground mb-2">5.3 Taxes</h3>
                <p>You are responsible for paying all applicable taxes, including Value Added Tax (VAT) and Digital Service Tax (DST), associated with your use of the Service.</p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">6. Prohibited Conduct</h2>
            <div className="text-muted-foreground leading-relaxed">
              <p className="mb-3">You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate any applicable national or international law or regulation.</li>
                <li>Infringe the rights of any third party, including intellectual property, privacy, or publicity rights.</li>
                <li>Post Content that is hateful, threatening, pornographic, creates a risk of physical harm, or constitutes "hate speech."</li>
                <li>Reverse engineer, decompile, or disassemble any aspect of the Service.</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">7. Limitation of Liability (The "Shield")</h2>
            <div className="text-muted-foreground leading-relaxed space-y-3">
              <p className="uppercase font-semibold text-foreground text-sm">
                TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT SHALL CREVIA VENTURES, ITS AFFILIATES, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES.
              </p>
              <p className="uppercase font-semibold text-foreground text-sm">
                OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE IS LIMITED TO THE GREATER OF: (A) THE AMOUNT PAID BY YOU TO CREVIA IN THE SIX (6) MONTHS PRIOR TO THE EVENT GIVING RISE TO THE CLAIM; OR (B) KES 10,000.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">8. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to defend, indemnify, and hold harmless Crevia Ventures from and against any claims, liabilities, damages, losses, and expenses, including without limitation, reasonable legal and accounting fees, arising out of or in any way connected with: (i) your access to or use of the Service; (ii) your User Content; or (iii) your violation of these Terms.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">9. Dispute Resolution and Governing Law</h2>
            <div className="text-muted-foreground leading-relaxed space-y-4">
              <div>
                <h3 className="font-poppins font-semibold text-foreground mb-2">9.1 Governing Law</h3>
                <p>These Terms shall be governed by the laws of the Republic of Kenya.</p>
              </div>
              <div>
                <h3 className="font-poppins font-semibold text-foreground mb-2">9.2 Arbitration</h3>
                <p>Any dispute arising out of or in connection with this contract shall be referred to and finally resolved by arbitration under the Arbitration Act of Kenya (1995). The seat of arbitration shall be Nairobi, Kenya. The language of the arbitration shall be English.</p>
              </div>
              <div>
                <h3 className="font-poppins font-semibold text-foreground mb-2">9.3 Class Action Waiver</h3>
                <p>Disputes must be brought on an individual basis only, and may not be brought as a plaintiff or class member in any purported class, consolidated, or representative proceeding.</p>
              </div>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">10. Changes to Terms of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Crevia reserves the right to modify these Terms at any time. If we make material changes to these Terms, we will notify you via the Service or by email. Your continued use of the Service after the effective date of such changes constitutes your acceptance of such changes.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="font-poppins text-sm">
                <strong>Phone:</strong> +254795284028<br />
                <strong>Location:</strong> Nairobi, Kenya<br />
                <strong>Email:</strong> hi@crevia.app
              </p>
            </div>
          </section>
        </Card>
      </main>
    </div>
  );
};

export default TermsOfService;
