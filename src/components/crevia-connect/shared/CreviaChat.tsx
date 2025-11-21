import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreviaChat = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [selectedConversation]);

  const initializeChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      fetchConversations(user.id);
    }
  };

  const fetchConversations = async (userId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("sender_id, receiver_id, profiles!messages_sender_id_fkey(display_name, avatar_url)")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (data) {
      const uniqueConversations = Array.from(
        new Map(data.map(msg => {
          const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
          return [otherUserId, { userId: otherUserId, profile: msg.profiles }];
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
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel("messages")
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
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUserId) return;

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          sender_id: currentUserId,
          receiver_id: selectedConversation.userId,
          content: newMessage,
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[600px]">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {conversations.map((conv) => (
              <div
                key={conv.userId}
                className={`p-4 hover:bg-accent cursor-pointer border-b ${
                  selectedConversation?.userId === conv.userId ? "bg-accent" : ""
                }`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {conv.profile?.display_name?.[0] || "U"}
                  </div>
                  <div>
                    <p className="font-medium">{conv.profile?.display_name || "User"}</p>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="col-span-8">
        {selectedConversation ? (
          <>
            <CardHeader>
              <CardTitle>{selectedConversation.profile?.display_name || "Conversation"}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] mb-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender_id === currentUserId
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button onClick={sendMessage} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Select a conversation to start chatting</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default CreviaChat;