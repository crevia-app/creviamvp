import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building2,
  Camera,
  Save,
  CreditCard,
  FileText,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const currencies = [
  { code: "KES", name: "Kenyan Shilling" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "NGN", name: "Nigerian Naira" },
  { code: "ZAR", name: "South African Rand" },
  { code: "GHS", name: "Ghanaian Cedi" },
  { code: "TZS", name: "Tanzanian Shilling" },
  { code: "UGX", name: "Ugandan Shilling" },
];

const StudioSettingsTab = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState({
    business_name: "",
    business_email: "",
    business_phone: "",
    business_address: "",
    logo_url: "",
    tax_id: "",
    default_currency: "KES",
    default_tax_rate: 0,
    default_payment_terms: "Payment is due within 30 days of invoice date.",
    bank_name: "",
    bank_account_name: "",
    bank_account_number: "",
    mpesa_till_number: "",
  });

  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("business_settings")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (data) {
      setSettingsId(data.id);
      setSettings({
        business_name: data.business_name || "",
        business_email: data.business_email || "",
        business_phone: data.business_phone || "",
        business_address: data.business_address || "",
        logo_url: data.logo_url || "",
        tax_id: data.tax_id || "",
        default_currency: data.default_currency || "KES",
        default_tax_rate: Number(data.default_tax_rate) || 0,
        default_payment_terms: data.default_payment_terms || "",
        bank_name: data.bank_name || "",
        bank_account_name: data.bank_account_name || "",
        bank_account_number: data.bank_account_number || "",
        mpesa_till_number: data.mpesa_till_number || "",
      });
    } else {
      // Pre-fill from profile and auto-create the record so the invoice dialog
      // can find it without the user needing to manually click Save.
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        const defaults = {
          user_id: session.user.id,
          business_name: profile.display_name || "",
          business_email: profile.email || "",
          logo_url: profile.avatar_url || "",
          default_currency: "KES",
          default_tax_rate: 0,
          default_payment_terms: "Payment is due within 30 days of invoice date.",
        };
        setSettings((prev) => ({ ...prev, business_name: defaults.business_name, business_email: defaults.business_email, logo_url: defaults.logo_url }));
        const { data: inserted } = await supabase
          .from("business_settings")
          .insert(defaults)
          .select()
          .single();
        if (inserted) setSettingsId(inserted.id);
      }
    }

    setLoading(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB allowed");
      return;
    }

    setUploading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `business-logos/${session.user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-files")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("chat-files").getPublicUrl(filePath);
    setSettings((prev) => ({ ...prev, logo_url: publicUrl }));
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.success("Logo uploaded!");
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please log in");
      setSaving(false);
      return;
    }

    if (settingsId) {
      const { error } = await supabase
        .from("business_settings")
        .update(settings)
        .eq("id", settingsId);

      if (error) {
        toast.error("Failed to save: " + error.message);
      } else {
        toast.success("Settings saved!");
      }
    } else {
      const { data, error } = await supabase
        .from("business_settings")
        .insert({ ...settings, user_id: session.user.id })
        .select()
        .single();

      if (error) {
        toast.error("Failed to save: " + error.message);
      } else {
        setSettingsId(data.id);
        toast.success("Settings saved!");
      }
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-muted rounded-xl w-2/5" />
          <div className="h-64 bg-muted rounded-2xl" />
          <div className="h-48 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="font-vollkorn text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Studio Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your business details for invoices, receipts, and contracts
        </p>
      </div>

      {/* Business Profile */}
      <Card className="p-6 border-0 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-bronze/15">
            <Building2 className="h-5 w-5 text-bronze" />
          </div>
          <h3 className="font-vollkorn text-xl font-bold">Business Profile</h3>
        </div>

        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar className="h-20 w-20 ring-4 ring-bronze/20">
                <AvatarImage src={settings.logo_url} />
                <AvatarFallback className="bg-bronze/10 text-bronze text-xl font-bold">
                  {settings.business_name?.[0]?.toUpperCase() || "B"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-white" />
              </div>
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-foreground">Business Logo</p>
              <p className="text-xs text-muted-foreground">Appears on invoices, receipts & contracts. Max 5MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Business Name</Label>
              <Input
                value={settings.business_name}
                onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                placeholder="Your Business Name"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Business Email</Label>
              <Input
                type="email"
                value={settings.business_email}
                onChange={(e) => setSettings({ ...settings, business_email: e.target.value })}
                placeholder="billing@yourbusiness.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={settings.business_phone}
                onChange={(e) => setSettings({ ...settings, business_phone: e.target.value })}
                placeholder="+254 7XX XXX XXX"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Tax ID / PIN</Label>
              <Input
                value={settings.tax_id}
                onChange={(e) => setSettings({ ...settings, tax_id: e.target.value })}
                placeholder="P00XXXXXXX"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label>Business Address</Label>
            <Textarea
              value={settings.business_address}
              onChange={(e) => setSettings({ ...settings, business_address: e.target.value })}
              placeholder="Street, City, Country"
              className="mt-1"
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* Invoice & Receipt Defaults */}
      <Card className="p-6 border-0 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-emerald-500/15">
            <FileText className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className="font-vollkorn text-xl font-bold">Invoice & Receipt Defaults</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Default Currency</Label>
              <Select
                value={settings.default_currency}
                onValueChange={(v) => setSettings({ ...settings, default_currency: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} - {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Default Tax Rate (%)</Label>
              <Input
                type="number"
                value={settings.default_tax_rate}
                onChange={(e) => setSettings({ ...settings, default_tax_rate: Number(e.target.value) })}
                className="mt-1"
                min={0}
                max={100}
              />
            </div>
          </div>
          <div>
            <Label>Default Payment Terms</Label>
            <Textarea
              value={settings.default_payment_terms}
              onChange={(e) => setSettings({ ...settings, default_payment_terms: e.target.value })}
              placeholder="Payment terms..."
              className="mt-1"
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* Payment Details */}
      <Card className="p-6 border-0 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-blue-500/15">
            <CreditCard className="h-5 w-5 text-blue-500" />
          </div>
          <h3 className="font-vollkorn text-xl font-bold">Payment Details</h3>
          <p className="text-xs text-muted-foreground ml-auto">Shown on invoices & receipts</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Bank Name</Label>
              <Input
                value={settings.bank_name}
                onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                placeholder="e.g. Equity Bank"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Account Name</Label>
              <Input
                value={settings.bank_account_name}
                onChange={(e) => setSettings({ ...settings, bank_account_name: e.target.value })}
                placeholder="Account holder name"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Account Number</Label>
              <Input
                value={settings.bank_account_number}
                onChange={(e) => setSettings({ ...settings, bank_account_number: e.target.value })}
                placeholder="XXXXXXXXXX"
                className="mt-1"
              />
            </div>
            <div>
              <Label>M-Pesa Till/Paybill</Label>
              <Input
                value={settings.mpesa_till_number}
                onChange={(e) => setSettings({ ...settings, mpesa_till_number: e.target.value })}
                placeholder="Till or Paybill number"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full gap-2 bg-bronze hover:bg-bronze/90 shadow-lg shadow-bronze/20 h-12"
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
};

export default StudioSettingsTab;
