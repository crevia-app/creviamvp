import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  FileSignature,
  Receipt,
  Sparkles,
  Clock,
  ArrowRight,
  Trash2,
  UserPlus,
  Search,
  Loader2,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ContractPreviewDialog from "@/components/studio/ContractPreviewDialog";
import InvoicePreviewDialog from "@/components/studio/InvoicePreviewDialog";
import CreateContractDialog from "@/components/studio/CreateContractDialog";
import CreateInvoiceDialog from "@/components/studio/CreateInvoiceDialog";

interface Contract {
  id: string;
  title: string;
  client_name: string;
  status: string;
  [key: string]: any;
}

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  total: number;
  currency: string;
  status: string;
  [key: string]: any;
}

interface WorkspaceActionVaultProps {
  contracts: Contract[];
  invoices: Invoice[];
  userId: string;
  roomId: string;
  onRefresh?: () => void;
}

const WorkspaceActionVault = ({
  contracts,
  invoices,
  userId,
  roomId,
  onRefresh,
}: WorkspaceActionVaultProps) => {
  const navigate = useNavigate();
  const [contractDialog, setContractDialog] = useState<Contract | null>(null);
  const [invoiceDialog, setInvoiceDialog] = useState<Invoice | null>(null);
  const [confirmDeleteContract, setConfirmDeleteContract] = useState<Contract | null>(null);
  const [confirmDeleteInvoice, setConfirmDeleteInvoice] = useState<Invoice | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Create dialogs
  const [createContractOpen, setCreateContractOpen] = useState(false);
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);

  // Add member state
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [addingMember, setAddingMember] = useState<string | null>(null);

  const openAddMember = async () => {
    setMemberSearch("");
    setAddMemberOpen(true);
    setLoadingUsers(true);

    const { data: memberRows } = await supabase
      .from("chat_room_members")
      .select("user_id")
      .eq("room_id", roomId);

    const memberIds = new Set((memberRows || []).map((m: any) => m.user_id));

    const { data: users } = await supabase
      .from("profiles")
      .select("id, display_name, handle, avatar_url")
      .order("display_name");

    setAvailableUsers((users || []).filter((u: any) => !memberIds.has(u.id)));
    setLoadingUsers(false);
  };

  const handleAddMember = async (targetUserId: string) => {
    setAddingMember(targetUserId);
    const { error } = await supabase.from("chat_room_members").insert({
      room_id: roomId,
      user_id: targetUserId,
      role: "member",
    });
    if (error) {
      toast.error("Failed to add member");
    } else {
      toast.success("Member added");
      setAvailableUsers((prev) => prev.filter((u) => u.id !== targetUserId));
      fetchMembers();
    }
    setAddingMember(null);
  };

  const handleContractCreated = async (contractId: string) => {
    await supabase.from("chat_messages").insert({
      room_id: roomId,
      sender_id: userId,
      message_type: "contract",
      content: "Contract attached",
      contract_id: contractId,
      is_encrypted: false,
    });
    onRefresh?.();
  };

  const handleInvoiceCreated = async (invoiceId: string) => {
    await supabase.from("chat_messages").insert({
      room_id: roomId,
      sender_id: userId,
      message_type: "invoice",
      content: "Invoice attached",
      invoice_id: invoiceId,
      is_encrypted: false,
    });
    onRefresh?.();
  };

  const updateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
    const { error } = await supabase
      .from("invoices")
      .update({ status: newStatus })
      .eq("id", invoiceId);
    if (error) toast.error("Failed to update invoice");
    else onRefresh?.();
  };

  const deleteContract = async () => {
    if (!confirmDeleteContract) return;
    setDeleting(true);
    await supabase.from("chat_messages").delete().eq("room_id", roomId).eq("contract_id", confirmDeleteContract.id);
    const { error } = await supabase.from("contracts").delete().eq("id", confirmDeleteContract.id);
    if (error) toast.error("Failed to delete contract");
    else { toast.success("Contract deleted"); setConfirmDeleteContract(null); onRefresh?.(); }
    setDeleting(false);
  };

  const deleteInvoice = async () => {
    if (!confirmDeleteInvoice) return;
    setDeleting(true);
    await supabase.from("invoice_items").delete().eq("invoice_id", confirmDeleteInvoice.id);
    await supabase.from("chat_messages").delete().eq("room_id", roomId).eq("invoice_id", confirmDeleteInvoice.id);
    const { error } = await supabase.from("invoices").delete().eq("id", confirmDeleteInvoice.id);
    if (error) toast.error("Failed to delete invoice");
    else { toast.success("Invoice deleted"); setConfirmDeleteInvoice(null); onRefresh?.(); }
    setDeleting(false);
  };

  const filteredUsers = availableUsers.filter((u) => {
    const term = memberSearch.toLowerCase();
    return !term || u.display_name?.toLowerCase().includes(term) || u.handle?.toLowerCase().includes(term);
  });

  return (
    <>
      <div className="flex flex-col w-full md:w-60 xl:w-[268px] flex-shrink-0 border-l border-gray-100 dark:border-border/60 bg-gray-50/50 dark:bg-background/60 overflow-hidden max-h-52 md:max-h-none">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-border/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-bronze/10">
                <Sparkles className="w-3.5 h-3.5 text-bronze" />
              </div>
              <div>
                <h3 className="font-semibold text-[12px] tracking-tight">Action Vault</h3>
                <p className="text-[10px] text-muted-foreground/70">Contracts & invoices</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={openAddMember}
              className="h-7 text-[10px] gap-1 border-border hover:border-bronze/40 hover:text-bronze px-2"
            >
              <UserPlus className="w-3 h-3" />
              Add
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-4">

            {/* Contract Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <FileSignature className="w-3 h-3 text-bronze/80" />
                  <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Contracts</span>
                </div>
                <button
                  onClick={() => setCreateContractOpen(true)}
                  className="w-5 h-5 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-bronze hover:bg-bronze/8 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              {contracts.length === 0 ? (
                <div className="p-3.5 rounded-xl border border-dashed border-gray-200 dark:border-border/50 text-center">
                  <FileSignature className="w-5 h-5 text-muted-foreground/20 mx-auto mb-1.5" />
                  <p className="text-[10px] text-muted-foreground/60">No contracts yet</p>
                  <button
                    onClick={() => setCreateContractOpen(true)}
                    className="mt-1.5 text-[10px] text-bronze/70 hover:text-bronze font-medium transition-colors"
                  >
                    + Add contract
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {contracts.map((c) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-3 rounded-xl border border-gray-100 dark:border-border/40 bg-white dark:bg-card hover:border-bronze/30 hover:shadow-sm transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <p className="text-[11px] font-semibold truncate flex-1 leading-snug">{c.title}</p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-muted text-muted-foreground capitalize">{c.status}</span>
                          <button
                            onClick={() => setConfirmDeleteContract(c)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground/70 truncate mb-2.5">{c.client_name}</p>
                      {c.status !== "signed" ? (
                        <Button size="sm" onClick={() => setContractDialog(c)}
                          className="w-full h-7 text-[10px] bg-bronze hover:bg-bronze/90 text-background font-semibold gap-1.5 shadow-sm">
                          <FileSignature className="w-3 h-3" />
                          Sign Contract
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span className="text-[10px] text-emerald-600 font-semibold">Signed</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Invoice Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Receipt className="w-3 h-3 text-bronze/80" />
                  <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Invoices</span>
                </div>
                <button
                  onClick={() => setCreateInvoiceOpen(true)}
                  className="w-5 h-5 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-bronze hover:bg-bronze/8 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              {invoices.length === 0 ? (
                <div className="p-3.5 rounded-xl border border-dashed border-gray-200 dark:border-border/50 text-center">
                  <Receipt className="w-5 h-5 text-muted-foreground/20 mx-auto mb-1.5" />
                  <p className="text-[10px] text-muted-foreground/60">No invoices yet</p>
                  <button
                    onClick={() => setCreateInvoiceOpen(true)}
                    className="mt-1.5 text-[10px] text-bronze/70 hover:text-bronze font-medium transition-colors"
                  >
                    + Add invoice
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {invoices.map((inv) => (
                    <motion.div
                      key={inv.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-3 rounded-xl border border-gray-100 dark:border-border/40 bg-white dark:bg-card hover:border-bronze/30 hover:shadow-sm transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <p className="text-[11px] font-semibold truncate flex-1">{inv.invoice_number}</p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-muted text-muted-foreground capitalize">{inv.status}</span>
                          <button
                            onClick={() => setConfirmDeleteInvoice(inv)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground/70 truncate mb-0.5">{inv.client_name}</p>
                      <p className="text-xs font-bold text-bronze mb-2.5 tracking-tight">
                        {new Intl.NumberFormat("en-KE", { style: "currency", currency: inv.currency || "KES" }).format(Number(inv.total))}
                      </p>
                      {(() => {
                        const isCreator = (inv.user_id ?? inv.created_by) === userId;
                        if (inv.status === "paid") return (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] text-emerald-600 font-semibold">Paid</span>
                          </div>
                        );
                        if (inv.status === "received") {
                          if (isCreator) return (
                            <Button size="sm" onClick={() => setInvoiceDialog(inv)}
                              className="w-full h-7 text-[10px] bg-bronze hover:bg-bronze/90 text-background font-semibold gap-1.5">
                              <FileSignature className="w-3 h-3" />Generate Invoice
                            </Button>
                          );
                          return (
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-bronze/60" />
                              <span className="text-[10px] text-muted-foreground">Confirmed</span>
                            </div>
                          );
                        }
                        if (inv.status === "sent") {
                          if (isCreator) return (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-muted-foreground/50" />
                              <span className="text-[10px] text-muted-foreground/60">Awaiting confirmation…</span>
                            </div>
                          );
                          return (
                            <Button size="sm" variant="outline" onClick={() => updateInvoiceStatus(inv.id, "received")}
                              className="w-full h-7 text-[10px] border-bronze/25 text-bronze hover:bg-bronze/8 font-semibold gap-1.5">
                              <CheckCircle2 className="w-3 h-3" />Invoice Received
                            </Button>
                          );
                        }
                        if (isCreator) return (
                          <Button size="sm" onClick={() => updateInvoiceStatus(inv.id, "sent")}
                            className="w-full h-7 text-[10px] bg-bronze hover:bg-bronze/90 text-background font-semibold gap-1.5">
                            <Receipt className="w-3 h-3" />Invoice Sent
                          </Button>
                        );
                        return (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-muted-foreground/50" />
                            <span className="text-[10px] text-muted-foreground/60">Invoice pending…</span>
                          </div>
                        );
                      })()}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-1 border-t border-gray-100 dark:border-border/40">
              <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-2 px-1">Quick Actions</p>
              <div className="space-y-0.5">
                <Button variant="ghost" size="sm" onClick={() => navigate(`/crevia-studio?tab=contracts&workspace=${roomId}`)}
                  className="w-full justify-start h-8 text-[11px] gap-2 text-muted-foreground hover:text-foreground px-2 font-medium">
                  <FileSignature className="w-3.5 h-3.5 text-muted-foreground/60" />
                  All contracts
                  <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground/40" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/crevia-studio?tab=invoices&workspace=${roomId}`)}
                  className="w-full justify-start h-8 text-[11px] gap-2 text-muted-foreground hover:text-foreground px-2 font-medium">
                  <Receipt className="w-3.5 h-3.5 text-muted-foreground/60" />
                  All invoices
                  <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground/40" />
                </Button>
              </div>
            </div>

          </div>
        </ScrollArea>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onOpenChange={(o) => { if (!o) setAddMemberOpen(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Add Member to Workspace</DialogTitle>
          </DialogHeader>
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
            <Input
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Search people..."
              className="pl-8 h-9 text-sm"
              autoFocus
            />
          </div>
          <ScrollArea className="max-h-64">
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  {availableUsers.length === 0 ? "All users are already members" : "No users found"}
                </p>
              </div>
            ) : (
              <div className="space-y-0.5 pr-2">
                {filteredUsers.map((user) => {
                  const name = user.display_name || (user.handle ? `@${user.handle}` : "Unknown");
                  const isAdding = addingMember === user.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleAddMember(user.id)}
                      disabled={!!addingMember}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent transition-all duration-150 text-left disabled:opacity-60"
                    >
                      <div className="w-9 h-9 rounded-full bg-bronze/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {user.avatar_url
                          ? <img src={user.avatar_url} alt={name} className="w-full h-full object-cover rounded-full" />
                          : <span className="text-[13px] font-semibold text-bronze/70">{name[0].toUpperCase()}</span>
                        }
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{name}</p>
                        {user.handle && <p className="text-xs text-muted-foreground">@{user.handle}</p>}
                      </div>
                      {isAdding
                        ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />
                        : <UserPlus className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                      }
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Create Contract Dialog */}
      <CreateContractDialog
        open={createContractOpen}
        onOpenChange={setCreateContractOpen}
        onSuccess={() => onRefresh?.()}
        onCreated={handleContractCreated}
      />

      {/* Create Invoice Dialog */}
      <CreateInvoiceDialog
        open={createInvoiceOpen}
        onOpenChange={setCreateInvoiceOpen}
        onSuccess={() => onRefresh?.()}
        onCreated={handleInvoiceCreated}
      />

      {/* Contract signing dialog */}
      {contractDialog && (
        <ContractPreviewDialog
          open={!!contractDialog}
          onOpenChange={(open) => { if (!open) setContractDialog(null); }}
          contract={contractDialog}
          onContractUpdate={() => { onRefresh?.(); }}
        />
      )}

      {/* Invoice preview / generate dialog */}
      {invoiceDialog && (
        <InvoicePreviewDialog
          open={!!invoiceDialog}
          onOpenChange={(open) => { if (!open) setInvoiceDialog(null); }}
          invoice={invoiceDialog}
        />
      )}

      {/* Delete Contract Confirmation */}
      <AlertDialog open={!!confirmDeleteContract} onOpenChange={(o) => { if (!o) setConfirmDeleteContract(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold">Delete Contract</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Permanently delete <strong>{confirmDeleteContract?.title}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-8" disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteContract} disabled={deleting}
              className="text-xs h-8 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Invoice Confirmation */}
      <AlertDialog open={!!confirmDeleteInvoice} onOpenChange={(o) => { if (!o) setConfirmDeleteInvoice(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold">Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Permanently delete <strong>{confirmDeleteInvoice?.invoice_number}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-8" disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteInvoice} disabled={deleting}
              className="text-xs h-8 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WorkspaceActionVault;
