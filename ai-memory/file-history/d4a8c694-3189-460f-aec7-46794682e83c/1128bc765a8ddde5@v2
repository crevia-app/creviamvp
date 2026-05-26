import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Pencil, Trash2, Check, X, Plus, Mail, Phone, MapPin, Hash } from "lucide-react";
import { toast } from "sonner";

export interface SavedClient {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  billing_address: string | null;
  tax_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ClientAddressBookProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm = {
  client_name: "",
  client_email: "",
  client_phone: "",
  billing_address: "",
  tax_id: "",
};

export default function ClientAddressBook({ open, onOpenChange }: ClientAddressBookProps) {
  const [clients, setClients] = useState<SavedClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [addingNew, setAddingNew] = useState(false);
  const [newForm, setNewForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<SavedClient | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) fetchClients();
  }, [open]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await (supabase as any)
        .from("saved_clients")
        .select("*")
        .eq("user_id", session.user.id)
        .order("client_name", { ascending: true });
      if (error) throw error;
      setClients(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (client: SavedClient) => {
    setEditingId(client.id);
    setEditForm({
      client_name: client.client_name,
      client_email: client.client_email || "",
      client_phone: client.client_phone || "",
      billing_address: client.billing_address || "",
      tax_id: client.tax_id || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const saveEdit = async () => {
    if (!editForm.client_name.trim()) {
      toast.error("Client name is required");
      return;
    }
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("saved_clients")
        .update({
          client_name: editForm.client_name.trim(),
          client_email: editForm.client_email || null,
          client_phone: editForm.client_phone || null,
          billing_address: editForm.billing_address || null,
          tax_id: editForm.tax_id || null,
        })
        .eq("id", editingId);
      if (error) throw error;
      toast.success("Client updated");
      setEditingId(null);
      fetchClients();
    } catch (err: any) {
      toast.error(err.message || "Failed to update client");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error } = await (supabase as any)
        .from("saved_clients")
        .delete()
        .eq("id", deleteTarget.id);
      if (error) throw error;
      toast.success(`${deleteTarget.client_name} removed`);
      setDeleteTarget(null);
      fetchClients();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete client");
    }
  };

  const saveNew = async () => {
    if (!newForm.client_name.trim()) {
      toast.error("Client name is required");
      return;
    }
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { error } = await (supabase as any)
        .from("saved_clients")
        .insert({
          user_id: session.user.id,
          client_name: newForm.client_name.trim(),
          client_email: newForm.client_email || null,
          client_phone: newForm.client_phone || null,
          billing_address: newForm.billing_address || null,
          tax_id: newForm.tax_id || null,
        });
      if (error) throw error;
      toast.success("Client saved");
      setAddingNew(false);
      setNewForm(emptyForm);
      fetchClients();
    } catch (err: any) {
      toast.error(err.message || "Failed to save client");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto flex flex-col gap-0 p-0">
          <SheetHeader className="px-6 py-5 border-b border-border sticky top-0 bg-background z-10">
            <SheetTitle className="flex items-center gap-2 font-vollkorn text-lg">
              <Users className="h-5 w-5 text-bronze" />
              Client Address Book
              {clients.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs font-normal">
                  {clients.length}
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 px-6 py-5 space-y-4">
            {/* Add New Client */}
            {!addingNew ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 border-dashed border-bronze/40 text-bronze hover:bg-bronze/5"
                onClick={() => setAddingNew(true)}
              >
                <Plus className="h-4 w-4" />
                Add New Client
              </Button>
            ) : (
              <ClientForm
                form={newForm}
                onChange={setNewForm}
                onSave={saveNew}
                onCancel={() => { setAddingNew(false); setNewForm(emptyForm); }}
                saving={saving}
                title="New Client"
              />
            )}

            {/* Client List */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 rounded-xl bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : clients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No saved clients yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Clients you save while creating invoices appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {clients.map(client => (
                  <div
                    key={client.id}
                    className="rounded-xl border border-border bg-muted/20 overflow-hidden"
                  >
                    {editingId === client.id ? (
                      <div className="p-4">
                        <ClientForm
                          form={editForm}
                          onChange={setEditForm}
                          onSave={saveEdit}
                          onCancel={cancelEdit}
                          saving={saving}
                          title="Edit Client"
                        />
                      </div>
                    ) : (
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {client.client_name}
                            </p>
                            {client.client_email && (
                              <p className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                {client.client_email}
                              </p>
                            )}
                            {client.client_phone && (
                              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                {client.client_phone}
                              </p>
                            )}
                            {client.billing_address && (
                              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                <span className="whitespace-pre-line">{client.billing_address}</span>
                              </p>
                            )}
                            {client.tax_id && (
                              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Hash className="h-3 w-3 flex-shrink-0" />
                                Tax ID: {client.tax_id}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => startEdit(client)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteTarget(client)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Client</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <strong>{deleteTarget?.client_name}</strong> from your address book? This does not affect any existing invoices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface ClientFormProps {
  form: typeof emptyForm;
  onChange: (form: typeof emptyForm) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  title: string;
}

function ClientForm({ form, onChange, onSave, onCancel, saving, title }: ClientFormProps) {
  const set = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...form, [field]: e.target.value });

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
      <div className="grid grid-cols-1 gap-2.5">
        <div>
          <Label className="text-xs">Name *</Label>
          <Input value={form.client_name} onChange={set("client_name")} placeholder="Company or individual" className="mt-1 h-8 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Email</Label>
            <Input type="email" value={form.client_email} onChange={set("client_email")} placeholder="client@co.com" className="mt-1 h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Phone</Label>
            <Input value={form.client_phone} onChange={set("client_phone")} placeholder="+254 700 000 000" className="mt-1 h-8 text-sm" />
          </div>
        </div>
        <div>
          <Label className="text-xs">Billing Address</Label>
          <Textarea value={form.billing_address} onChange={set("billing_address")} placeholder="Full address" className="mt-1 text-sm" rows={2} />
        </div>
        <div>
          <Label className="text-xs">Tax ID / KRA PIN</Label>
          <Input value={form.tax_id} onChange={set("tax_id")} placeholder="Optional" className="mt-1 h-8 text-sm" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={onSave} disabled={saving} className="bg-bronze hover:bg-bronze/90 gap-1.5">
          <Check className="h-3.5 w-3.5" />
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} className="gap-1.5">
          <X className="h-3.5 w-3.5" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
