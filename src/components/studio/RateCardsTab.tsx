import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Search, 
  FileText, 
  Eye,
  MoreHorizontal,
  Edit,
  Trash2,
  Share2,
  Copy,
  ExternalLink,
  Globe,
  Lock
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateRateCardDialog from "./CreateRateCardDialog";
import RateCardPreviewDialog from "./RateCardPreviewDialog";

interface RateCard {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  share_slug: string | null;
  theme: string;
  currency: string;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
}

interface RateCardService {
  id: string;
  rate_card_id: string;
  category: string;
  service_name: string;
  description: string | null;
  base_price: number;
  price_type: string;
  turnaround_days: number | null;
  order_index: number;
}

const RateCardsTab = () => {
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [services, setServices] = useState<Record<string, RateCardService[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingRateCard, setEditingRateCard] = useState<RateCard | null>(null);
  const [previewRateCard, setPreviewRateCard] = useState<RateCard | null>(null);

  const fetchRateCards = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("rate_cards")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load rate cards");
      return;
    }

    setRateCards(data || []);

    // Fetch services for each rate card
    if (data && data.length > 0) {
      const servicePromises = data.map(async (card) => {
        const { data: servicesData } = await supabase
          .from("rate_card_services")
          .select("*")
          .eq("rate_card_id", card.id)
          .order("order_index");
        return { cardId: card.id, services: servicesData || [] };
      });

      const allServices = await Promise.all(servicePromises);
      const servicesMap: Record<string, RateCardService[]> = {};
      allServices.forEach(({ cardId, services }) => {
        servicesMap[cardId] = services;
      });
      setServices(servicesMap);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRateCards();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("rate_cards").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete rate card");
      return;
    }
    toast.success("Rate card deleted");
    fetchRateCards();
  };

  const handleTogglePublic = async (id: string, isPublic: boolean) => {
    let shareSlug = null;
    
    if (isPublic) {
      // Generate a unique share slug
      shareSlug = `rc_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
    }

    const { error } = await supabase
      .from("rate_cards")
      .update({ is_public: isPublic, share_slug: shareSlug })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update visibility");
      return;
    }
    
    toast.success(isPublic ? "Rate card is now public" : "Rate card is now private");
    fetchRateCards();
  };

  const copyShareLink = (slug: string) => {
    const url = `${window.location.origin}/rate-card/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency || "KES",
    }).format(amount);
  };

  const filteredRateCards = rateCards.filter(
    (card) =>
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (card.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const getServiceCount = (cardId: string) => {
    return services[cardId]?.length || 0;
  };

  const getTotalValue = (cardId: string) => {
    const cardServices = services[cardId] || [];
    return cardServices.reduce((acc, s) => acc + Number(s.base_price), 0);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-vollkorn text-2xl font-semibold text-foreground">
            Rate Cards
          </h2>
          <p className="text-sm text-muted-foreground">
            Create beautiful rate cards to share with brands
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="gap-2 bg-bronze hover:bg-bronze/90"
        >
          <Plus className="h-4 w-4" />
          Create Rate Card
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search rate cards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Rate Cards Grid */}
      {filteredRateCards.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-bronze/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-bronze" />
          </div>
          <h3 className="font-vollkorn text-xl font-semibold text-foreground mb-2">
            No rate cards yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Create your first rate card to share your services with brands
          </p>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="gap-2 bg-bronze hover:bg-bronze/90"
          >
            <Plus className="h-4 w-4" />
            Create Rate Card
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRateCards.map((card) => (
            <Card
              key={card.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-bronze/30"
            >
              {/* Card Header */}
              <div className="p-4 bg-gradient-to-r from-bronze/10 to-transparent">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground truncate">
                        {card.name}
                      </h4>
                      {card.is_public ? (
                        <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                          <Globe className="h-3 w-3" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="h-3 w-3" />
                          Private
                        </Badge>
                      )}
                    </div>
                    {card.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {card.description}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setPreviewRateCard(card)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingRateCard(card)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {card.is_public && card.share_slug && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => copyShareLink(card.share_slug!)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(`/rate-card/${card.share_slug}`, "_blank")}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Link
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(card.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-foreground">
                      {getServiceCount(card.id)}
                    </p>
                    <p className="text-xs text-muted-foreground">Services</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-bold text-foreground">
                      {formatCurrency(getTotalValue(card.id), card.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Value</p>
                  </div>
                </div>

                {/* Validity */}
                {(card.valid_from || card.valid_until) && (
                  <div className="text-xs text-muted-foreground">
                    Valid: {card.valid_from ? format(new Date(card.valid_from), "MMM d, yyyy") : "—"} 
                    {" - "}
                    {card.valid_until ? format(new Date(card.valid_until), "MMM d, yyyy") : "No expiry"}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Public</span>
                    <Switch
                      checked={card.is_public}
                      onCheckedChange={(checked) => handleTogglePublic(card.id, checked)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewRateCard(card)}
                    className="gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateRateCardDialog
        open={createDialogOpen || !!editingRateCard}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setEditingRateCard(null);
        }}
        editingRateCard={editingRateCard}
        onSuccess={fetchRateCards}
      />

      <RateCardPreviewDialog
        open={!!previewRateCard}
        onOpenChange={(open) => !open && setPreviewRateCard(null)}
        rateCard={previewRateCard}
        services={previewRateCard ? services[previewRateCard.id] || [] : []}
      />
    </div>
  );
};

export default RateCardsTab;
