import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer, Copy, Share2, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface RateCardService {
  id: string;
  category: string;
  service_name: string;
  description: string | null;
  base_price: number;
  price_type: string;
  turnaround_days: number | null;
}

interface RateCardPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rateCard: any;
  services: RateCardService[];
}

const priceTypeLabels: Record<string, string> = {
  fixed: "",
  hourly: "/hour",
  per_post: "/post",
  per_video: "/video",
  negotiable: " (negotiable)",
};

const RateCardPreviewDialog = ({
  open,
  onOpenChange,
  rateCard,
  services,
}: RateCardPreviewDialogProps) => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (rateCard) {
      fetchProfile();
    }
  }, [rateCard]);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      setProfile(data);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: rateCard?.currency || "KES",
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const copyShareLink = () => {
    if (rateCard?.share_slug) {
      const url = `${window.location.origin}/rate-card/${rateCard.share_slug}`;
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  if (!rateCard) return null;

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, RateCardService[]>);

  const totalValue = services.reduce((acc, s) => acc + Number(s.base_price), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="font-vollkorn text-xl">Rate Card Preview</span>
            <div className="flex gap-2">
              {rateCard.is_public && (
                <Button variant="outline" size="sm" onClick={copyShareLink}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Rate Card Preview */}
        <div className="bg-white text-black rounded-lg shadow-inner print:shadow-none overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{rateCard.name}</h1>
                {rateCard.description && (
                  <p className="text-amber-100 max-w-md">{rateCard.description}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-amber-100 text-sm">Prepared by</p>
                <p className="text-xl font-semibold">
                  {profile?.display_name || profile?.handle || "Creator"}
                </p>
              </div>
            </div>
            
            {/* Validity */}
            {(rateCard.valid_from || rateCard.valid_until) && (
              <div className="mt-6 pt-4 border-t border-amber-500/30">
                <p className="text-amber-100 text-sm">
                  Valid: {rateCard.valid_from ? format(new Date(rateCard.valid_from), "MMMM d, yyyy") : "Now"} 
                  {" — "}
                  {rateCard.valid_until ? format(new Date(rateCard.valid_until), "MMMM d, yyyy") : "Until further notice"}
                </p>
              </div>
            )}
          </div>

          {/* Services */}
          <div className="p-8">
            {Object.entries(groupedServices).map(([category, categoryServices]) => (
              <div key={category} className="mb-8 last:mb-0">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-amber-200">
                  {category}
                </h2>
                <div className="space-y-4">
                  {categoryServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex justify-between items-start p-4 bg-gray-50 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {service.service_name}
                        </h3>
                        {service.description && (
                          <p className="text-gray-600 text-sm mt-1">
                            {service.description}
                          </p>
                        )}
                        {service.turnaround_days && (
                          <div className="flex items-center gap-1 mt-2 text-gray-500 text-xs">
                            <Clock className="h-3 w-3" />
                            {service.turnaround_days} day{service.turnaround_days > 1 ? "s" : ""} turnaround
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xl font-bold text-amber-700">
                          {formatCurrency(Number(service.base_price))}
                          <span className="text-sm font-normal text-gray-500">
                            {priceTypeLabels[service.price_type] || ""}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Total Value */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200">
              <div className="bg-amber-50 rounded-xl p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 text-sm">Total Package Value</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {services.length} service{services.length !== 1 ? "s" : ""} included
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-amber-700">
                    {formatCurrency(totalValue)}
                  </p>
                </div>
              </div>
            </div>

            {/* What's Included */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-4">What's Included</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Professional quality content
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Revision rounds included
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  High-resolution files
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Commercial usage rights
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                Interested in working together?
              </p>
              <p className="font-semibold text-gray-900 mt-1">
                {profile?.email || "Contact me for more details"}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-100 px-8 py-4 text-center">
            <p className="text-gray-400 text-xs">
              Generated with Crevia Studio
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RateCardPreviewDialog;
