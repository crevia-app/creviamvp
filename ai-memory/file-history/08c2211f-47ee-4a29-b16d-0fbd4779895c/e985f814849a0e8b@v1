import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download, File, Image as ImageIcon, Link2, FileSignature, Receipt, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface MediaMessage {
  id: string;
  content: string | null;
  message_type: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  invoice_id: string | null;
  contract_id: string | null;
  created_at: string;
}

interface ChatMediaPanelProps {
  roomId: string;
}

type TabType = "media" | "docs" | "links";

const ChatMediaPanel = ({ roomId }: ChatMediaPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("media");
  const [allMessages, setAllMessages] = useState<MediaMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("chat_messages")
        .select("id, content, message_type, file_url, file_name, file_type, file_size, invoice_id, contract_id, created_at")
        .eq("room_id", roomId)
        .in("message_type", ["file", "invoice", "contract", "text"])
        .order("created_at", { ascending: false });

      setAllMessages(data || []);
      setLoading(false);
    };
    fetchMedia();
  }, [roomId]);

  // Extract links from text messages
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const mediaItems = useMemo(
    () => allMessages.filter((m) => m.message_type === "file" && m.file_type?.startsWith("image/")),
    [allMessages]
  );

  const docItems = useMemo(
    () => [
      ...allMessages.filter(
        (m) =>
          (m.message_type === "file" && !m.file_type?.startsWith("image/")) ||
          m.message_type === "invoice" ||
          m.message_type === "contract"
      ),
    ],
    [allMessages]
  );

  const linkItems = useMemo(() => {
    const links: { id: string; url: string; created_at: string }[] = [];
    allMessages.forEach((m) => {
      if (m.content) {
        const matches = m.content.match(urlRegex);
        if (matches) {
          matches.forEach((url) => links.push({ id: m.id + url, url, created_at: m.created_at }));
        }
      }
    });
    return links;
  }, [allMessages]);

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: "media", label: "Media", count: mediaItems.length },
    { id: "docs", label: "Docs", count: docItems.length },
    { id: "links", label: "Links", count: linkItems.length },
  ];

  const downloadFile = async (fileUrl: string, fileName: string) => {
    const { data, error } = await supabase.storage.from("chat-files").download(fileUrl);
    if (error) {
      toast.error("Download failed");
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Group items by month
  const groupByMonth = <T extends { created_at: string }>(items: T[]) => {
    const groups: { label: string; items: T[] }[] = [];
    let currentLabel = "";
    items.forEach((item) => {
      const label = format(new Date(item.created_at), "MMMM yyyy").toUpperCase();
      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ label, items: [item] });
      } else {
        groups[groups.length - 1].items.push(item);
      }
    });
    return groups;
  };

  return (
    <div className="mt-4">
      {/* Tabs */}
      <div className="flex border-b border-border relative">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-semibold tracking-wider uppercase text-center transition-colors relative ${
              activeTab === tab.id
                ? "text-bronze"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1 text-[10px] opacity-60">{tab.count}</span>
            )}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-bronze rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <ScrollArea className="h-[280px] mt-2">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Loading...
          </div>
        ) : (
          <>
            {/* Media Tab */}
            {activeTab === "media" && (
              mediaItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <ImageIcon className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">No media shared yet</p>
                </div>
              ) : (
                <div className="space-y-3 px-1">
                  {groupByMonth(mediaItems).map((group) => (
                    <div key={group.label}>
                      <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-2">
                        {group.label}
                      </p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {group.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => downloadFile(item.file_url!, item.file_name || "image")}
                            className="aspect-square rounded-lg bg-muted overflow-hidden hover:opacity-80 transition-opacity relative group"
                          >
                            <div className="w-full h-full flex items-center justify-center bg-bronze/10">
                              <ImageIcon className="h-6 w-6 text-bronze/40" />
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <Download className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Docs Tab */}
            {activeTab === "docs" && (
              docItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <File className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">No documents shared yet</p>
                </div>
              ) : (
                <div className="space-y-3 px-1">
                  {groupByMonth(docItems).map((group) => (
                    <div key={group.label}>
                      <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-2">
                        {group.label}
                      </p>
                      <div className="space-y-1.5">
                        {group.items.map((item) => {
                          const isInvoice = item.message_type === "invoice";
                          const isContract = item.message_type === "contract";
                          const Icon = isInvoice ? Receipt : isContract ? FileSignature : File;

                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                if (item.file_url) downloadFile(item.file_url, item.file_name || "file");
                              }}
                              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors text-left"
                            >
                              <div className="h-10 w-10 rounded-lg bg-bronze/10 flex items-center justify-center flex-shrink-0">
                                <Icon className="h-5 w-5 text-bronze" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">
                                  {isInvoice
                                    ? "Invoice"
                                    : isContract
                                    ? "Contract"
                                    : item.file_name || "File"}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {item.file_size ? formatFileSize(item.file_size) + " • " : ""}
                                  {format(new Date(item.created_at), "MMM d, yyyy")}
                                </p>
                              </div>
                              {item.file_url && (
                                <Download className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Links Tab */}
            {activeTab === "links" && (
              linkItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <Link2 className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">No links shared yet</p>
                </div>
              ) : (
                <div className="space-y-3 px-1">
                  {groupByMonth(linkItems).map((group) => (
                    <div key={group.label}>
                      <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-2">
                        {group.label}
                      </p>
                      <div className="space-y-1.5">
                        {group.items.map((item) => {
                          let displayUrl = item.url;
                          try {
                            const parsed = new URL(item.url);
                            displayUrl = parsed.hostname + (parsed.pathname !== "/" ? parsed.pathname : "");
                          } catch {}

                          return (
                            <a
                              key={item.id}
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                            >
                              <div className="h-10 w-10 rounded-lg bg-bronze/10 flex items-center justify-center flex-shrink-0">
                                <Link2 className="h-5 w-5 text-bronze" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate text-foreground">
                                  {displayUrl}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {format(new Date(item.created_at), "MMM d, yyyy")}
                                </p>
                              </div>
                              <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </ScrollArea>
    </div>
  );
};

export default ChatMediaPanel;
