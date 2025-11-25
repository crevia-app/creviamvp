import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, Image as ImageIcon, File, X, Check, CheckCheck, Download, MessageSquare, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import NewConversationDialog from "./NewConversationDialog";

const CreviaChat = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserType, setCurrentUserType] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      const channel = subscribeToMessages();
      return () => {
        if (channel) supabase.removeChannel(channel);
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        setCurrentUserType(profile.user_type);
      }
      
      fetchConversations(user.id);
    }
  };

  const handleNewConversation = (userId: string, profile: any) => {
    setSelectedConversation({
      userId,
      profile,
      lastMessage: "",
      lastMessageTime: null
    });
    
    const exists = conversations.find(c => c.userId === userId);
    if (!exists) {
      setConversations(prev => [{
        userId,
        profile,
        lastMessage: "",
        lastMessageTime: null
      }, ...prev]);
    }
  };

  const fetchConversations = async (userId: string) => {
    const { data } = await supabase
      .from("messages")
      .select(`
        sender_id, 
        receiver_id, 
        content,
        created_at,
        sender:profiles!messages_sender_id_fkey(display_name, avatar_url),
        receiver:profiles!messages_receiver_id_fkey(display_name, avatar_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (data) {
      const uniqueConversations = Array.from(
        new Map(data.map(msg => {
          const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
          const profile = msg.sender_id === userId ? msg.receiver : msg.sender;
          return [otherUserId, { 
            userId: otherUserId, 
            profile,
            lastMessage: msg.content,
            lastMessageTime: msg.created_at
          }];
        })).values()
      );
      setConversations(uniqueConversations);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation || !currentUserId) return;

    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedConversation.userId}),and(sender_id.eq.${selectedConversation.userId},receiver_id.eq.${currentUserId})`)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
      markMessagesAsRead();
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedConversation || !currentUserId) return;

    await supabase
      .from("messages")
      .update({ status: 'read' })
      .eq("receiver_id", currentUserId)
      .eq("sender_id", selectedConversation.userId)
      .neq("status", "read");
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages-${selectedConversation?.userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          if (
            (payload.new.sender_id === currentUserId && payload.new.receiver_id === selectedConversation?.userId) ||
            (payload.new.sender_id === selectedConversation?.userId && payload.new.receiver_id === currentUserId)
          ) {
            setMessages((prev) => [...prev, payload.new]);
            if (payload.new.receiver_id === currentUserId) {
              markMessagesAsRead();
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === payload.new.id ? payload.new : msg))
          );
        }
      )
      .subscribe();

    return channel;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from("chat-files")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("chat-files")
      .getPublicUrl(fileName);

    return {
      url: fileName,
      name: file.name,
      type: file.type,
      size: file.size,
    };
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedConversation || !currentUserId) return;

    try {
      setUploadingFile(true);
      let fileData = null;

      if (selectedFile) {
        fileData = await uploadFile(selectedFile);
      }

      const { error } = await supabase
        .from("messages")
        .insert({
          sender_id: currentUserId,
          receiver_id: selectedConversation.userId,
          content: newMessage || (fileData ? `Sent a file: ${fileData.name}` : ""),
          file_url: fileData?.url,
          file_name: fileData?.name,
          file_type: fileData?.type,
          file_size: fileData?.size,
        });

      if (error) throw error;

      setNewMessage("");
      setSelectedFile(null);
      setIsTyping(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    setIsTyping(value.length > 0);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("chat-files")
        .download(fileUrl);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b bg-background/95 backdrop-blur flex-shrink-0">
        <h2 className="font-vollkorn text-lg md:text-xl font-bold">Messages</h2>
        {currentUserId && currentUserType && (
          <NewConversationDialog 
            currentUserId={currentUserId}
            currentUserType={currentUserType}
            onConversationCreated={handleNewConversation}
          />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Conversations List */}
        <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} md:w-80 lg:w-96 border-b md:border-b-0 md:border-r flex-col bg-muted/20 flex-shrink-0`}>
          <ScrollArea className="flex-1">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1 opacity-70">Start a new conversation above</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {conversations.map((conv) => (
                  <button
                    key={conv.userId}
                    className={`w-full text-left p-3 md:p-4 hover:bg-accent/50 cursor-pointer transition-colors ${
                      selectedConversation?.userId === conv.userId ? "bg-accent" : ""
                    }`}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 md:h-12 md:w-12 rounded-full bg-bronze/20 flex items-center justify-center text-sm md:text-base font-semibold flex-shrink-0 text-bronze">
                        {conv.profile?.avatar_url ? (
                          <img src={conv.profile.avatar_url} alt="" className="h-11 w-11 md:h-12 md:w-12 rounded-full object-cover" />
                        ) : (
                          conv.profile?.display_name?.[0]?.toUpperCase() || "U"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-poppins font-semibold truncate text-sm md:text-base">{conv.profile?.display_name || "User"}</p>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">{conv.lastMessage || "No messages yet"}</p>
                      </div>
                      {conv.lastMessageTime && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {formatTime(conv.lastMessageTime)}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-background min-h-0`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3 md:p-4 border-b bg-background/95 backdrop-blur flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden -ml-2 h-8 w-8 p-0"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-bronze/20 flex items-center justify-center text-sm font-semibold flex-shrink-0 text-bronze">
                    {selectedConversation.profile?.avatar_url ? (
                      <img src={selectedConversation.profile.avatar_url} alt="" className="h-9 w-9 md:h-10 md:w-10 rounded-full object-cover" />
                    ) : (
                      selectedConversation.profile?.display_name?.[0]?.toUpperCase() || "U"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-poppins font-semibold text-sm md:text-base truncate">{selectedConversation.profile?.display_name || "User"}</p>
                    {otherUserTyping && <p className="text-xs md:text-sm text-muted-foreground">typing...</p>}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-3 md:p-4">
                <div className="space-y-3 md:space-y-4 max-w-3xl mx-auto pb-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-3 md:px-4 py-2.5 md:py-3 ${
                          msg.sender_id === currentUserId
                            ? "bg-bronze text-background"
                            : "bg-muted"
                        }`}
                      >
                        {msg.file_url && (
                          <div className="mb-2 p-2 rounded-lg bg-background/10 flex items-center gap-2">
                            {getFileIcon(msg.file_type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs md:text-sm font-medium truncate">{msg.file_name}</p>
                              <p className="text-xs opacity-70">{formatFileSize(msg.file_size)}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => downloadFile(msg.file_url, msg.file_name)}
                              className="h-7 w-7 p-0 hover:bg-background/20"
                            >
                              <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </Button>
                          </div>
                        )}
                        {msg.content && <p className="text-xs md:text-sm whitespace-pre-wrap break-words">{msg.content}</p>}
                        <div className="flex items-center gap-1 mt-1.5">
                          <p className="text-xs opacity-70">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {msg.sender_id === currentUserId && (
                            <span className="opacity-70 ml-1">
                              {msg.status === 'read' ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-3 md:p-4 border-t bg-background/95 backdrop-blur flex-shrink-0">
                <div className="max-w-3xl mx-auto">
                  {selectedFile && (
                    <div className="mb-2 p-2 bg-muted rounded-lg flex items-center gap-2">
                      {getFileIcon(selectedFile.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-medium truncate">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedFile(null)}
                        className="h-7 w-7 p-0"
                      >
                        <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                      className="flex-shrink-0 h-10 w-10 md:h-11 md:w-11"
                    >
                      <Paperclip className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                    <Textarea
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => handleTyping(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="flex-1 min-h-[2.5rem] max-h-[120px] resize-none text-sm md:text-base py-2.5"
                      disabled={uploadingFile}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={uploadingFile || (!newMessage.trim() && !selectedFile)}
                      className="self-end bg-bronze hover:bg-bronze/90 text-background flex-shrink-0 h-10 w-10 md:h-11 md:w-11 p-0"
                    >
                      <Send className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center p-6">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-base md:text-lg font-medium mb-2">No conversation selected</p>
                <p className="text-sm opacity-70">Choose a conversation or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreviaChat;
