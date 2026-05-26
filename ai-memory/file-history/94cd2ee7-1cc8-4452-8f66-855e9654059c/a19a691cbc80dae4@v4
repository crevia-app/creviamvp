import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/use-subscription";
import UsageLimitBanner from "@/components/subscription/UsageLimitBanner";
import {
  Lightbulb,
  Users,
  FileText,
  BarChart3,
  TrendingUp,
  Send,
  MessageSquare,
  Plus,
  Search,
  Paperclip,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  Loader2,
  Sparkles,
  ArrowRight,
  FolderOpen,
  ChevronRight,
  Image,
  FileUp,
  X,
  Mic,
  FileSignature,
  Receipt,
  Copy,
  Check,
  Pencil,
  RotateCcw,
  Settings,
  MoreVertical,
  Pin,
  PinOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CreateProjectDialog } from "@/components/kira/CreateProjectDialog";
import { ProjectDetailSheet } from "@/components/kira/ProjectDetailSheet";
import { ProjectsView } from "@/components/kira/ProjectsView";
import { VoiceChatDialog } from "@/components/kira/VoiceChatDialog";
import CreateContractDialog from "@/components/studio/CreateContractDialog";
import CreateInvoiceDialog from "@/components/studio/CreateInvoiceDialog";
import { ApproveActionDialog } from "@/components/kira/ApproveActionDialog";
import { KiraSettingsPanel } from "@/components/kira/KiraSettingsPanel";
import { motion, AnimatePresence } from "framer-motion";


interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  project_id?: string | null;
  pinned?: boolean;
}

// ── Desktop chat item with 3-dot context menu ──
interface DesktopChatItemProps {
  chat: ChatHistory;
  isActive: boolean;
  isRenaming: boolean;
  renameValue: string;
  indent?: boolean;
  onSelect: () => void;
  onRenameChange: (v: string) => void;
  onRenameSubmit: () => void;
  onRenameCancel: () => void;
  onStartRename: () => void;
  onPin: () => void;
  onDelete: () => void;
}

function DesktopChatItem({
  chat, isActive, isRenaming, renameValue, indent = false,
  onSelect, onRenameChange, onRenameSubmit, onRenameCancel, onStartRename, onPin, onDelete,
}: DesktopChatItemProps) {
  const [hovered, setHovered] = useState(false);
  const showDots = isActive || hovered;

  return (
    <div
      onClick={() => { if (!isRenaming) onSelect(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex items-center gap-2 ${indent ? 'py-2.5 px-2 pl-7' : 'py-3.5 px-2.5'} rounded-lg cursor-pointer transition-all ${
        isActive ? 'bg-bronze/10 text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      }`}
    >
      <MessageSquare className={`w-${indent ? '3.5' : '4'} h-${indent ? '3.5' : '4'} flex-shrink-0 ${isActive ? 'text-bronze' : ''}`} />

      {isRenaming ? (
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => onRenameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onRenameSubmit();
            if (e.key === 'Escape') onRenameCancel();
          }}
          onBlur={onRenameSubmit}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-transparent text-sm outline-none border-b border-bronze/50 focus:border-bronze text-foreground min-w-0"
        />
      ) : (
        <span className="flex-1 text-sm truncate">{chat.title}</span>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <button
            style={{ opacity: showDots ? 1 : 0, pointerEvents: showDots ? 'auto' : 'none' }}
            className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-opacity duration-150 hover:bg-muted/80 ${
              isActive ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onClick={(e) => { e.stopPropagation(); onPin(); }}
            className="gap-2 cursor-pointer"
          >
            {chat.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            {chat.pinned ? 'Unpin' : 'Pin'}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => { e.stopPropagation(); onStartRename(); }}
            className="gap-2 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ── Mobile chat item with long-press ──
interface MobileChatItemProps {
  chat: ChatHistory;
  isActive: boolean;
  isRenaming: boolean;
  renameValue: string;
  onSelect: () => void;
  onRenameChange: (v: string) => void;
  onRenameSubmit: () => void;
  onRenameCancel: () => void;
  onLongPress: () => void;
  onLongPressStart: () => void;
  onLongPressEnd: () => void;
}

function MobileChatItem({
  chat, isActive, isRenaming, renameValue,
  onSelect, onRenameChange, onRenameSubmit, onRenameCancel,
  onLongPress, onLongPressStart, onLongPressEnd,
}: MobileChatItemProps) {
  return (
    <div
      onClick={() => { if (!isRenaming) onSelect(); }}
      onTouchStart={onLongPressStart}
      onTouchEnd={onLongPressEnd}
      onTouchMove={onLongPressEnd}
      onContextMenu={(e) => { e.preventDefault(); onLongPress(); }}
      className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all select-none ${
        isActive ? 'bg-bronze/10' : 'hover:bg-muted/50'
      }`}
    >
      <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-bronze' : 'text-muted-foreground'}`} />

      {isRenaming ? (
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => onRenameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onRenameSubmit();
            if (e.key === 'Escape') onRenameCancel();
          }}
          onBlur={onRenameSubmit}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-transparent text-sm outline-none border-b border-bronze/50 focus:border-bronze text-foreground min-w-0"
        />
      ) : (
        <span className="flex-1 text-sm truncate">{chat.title}</span>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); onLongPress(); }}
        className="p-1 rounded flex-shrink-0 text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/80 transition-all"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

const THINKING_STATES = [
  "Thinking...",
  "Cooking something up...",
  "Connecting the dots...",
  "Reading between the lines...",
  "Pulling it together...",
  "Working through this...",
  "Let me dig in...",
  "Weighing the details...",
  "Crafting your response...",
  "On it...",
  "Processing the context...",
  "Laying the groundwork...",
  "Sharpening my thoughts...",
  "Almost there...",
];

function ThinkingIndicator() {
  const [stateIdx, setStateIdx] = useState(() => Math.floor(Math.random() * THINKING_STATES.length));
  useEffect(() => {
    const id = setInterval(() => setStateIdx(i => (i + 1) % THINKING_STATES.length), 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3"
    >
      <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="block w-1.5 h-1.5 rounded-full bg-bronze"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={stateIdx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-muted-foreground"
            >
              {THINKING_STATES[stateIdx]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function StreamingCursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      className="inline-block w-0.5 h-4 bg-foreground/70 ml-0.5 align-middle"
    />
  );
}

interface Message {
  role: "user" | "assistant";
  content: string;
  file?: string;
  timestamp?: Date;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  custom_instructions: string | null;
  created_at: string;
  updated_at: string;
}

type ViewMode = "chat" | "projects";

const Kira = () => {
  const { toast } = useToast();
  const { kiraActionsToday, kiraActionsLimit } = useSubscription();
  const isAtKiraLimit = kiraActionsToday >= kiraActionsLimit;
  const [userType, setUserType] = useState<'creator' | 'brand' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const creatorGreetings = [
    "Hey there! Let's build something great today",
    "The world needs your story — let's tell it better",
    "Ready to turn creative vision into action?",
    "Your next big collaboration starts here",
    "Let's craft content that truly resonates"
  ];

  const brandGreetings = [
    "Hey there! Let's find the perfect storytellers for your brand",
    "Ready to connect with creators who share your vision?",
    "Your next winning campaign starts here",
    "Let's build partnerships that drive real impact",
    "Time to create something your audience will love"
  ];

  const greetings = userType === 'brand' ? brandGreetings : creatorGreetings;

  const getGreeting = () => {
    const lastChange = localStorage.getItem('kira-greeting-date');
    const storedIndex = localStorage.getItem('kira-greeting-index');
    const today = new Date().toDateString();
    
    if (lastChange !== today) {
      const currentIndex = storedIndex ? parseInt(storedIndex) : 0;
      const newIndex = (currentIndex + 1) % greetings.length;
      localStorage.setItem('kira-greeting-date', today);
      localStorage.setItem('kira-greeting-index', newIndex.toString());
      return greetings[newIndex];
    }
    
    const index = storedIndex ? parseInt(storedIndex) : 0;
    return greetings[index];
  };

  const [currentGreeting, setCurrentGreeting] = useState(getGreeting());
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // View modes and dialogs
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectDetailOpen, setProjectDetailOpen] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [kiraContractContext, setKiraContractContext] = useState<Record<string, unknown> | null>(null);
  const [kiraInvoiceContext, setKiraInvoiceContext] = useState<Record<string, unknown> | null>(null);

  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [memoryPanelOpen, setMemoryPanelOpen] = useState(false);
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [mobileLongPressChat, setMobileLongPressChat] = useState<ChatHistory | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamBufferRef = useRef('');
  const animFrameRef = useRef<number | null>(null);
  const networkDoneRef = useRef(false);

  // ── NEW: message interaction state ──
  const [editingMessageIdx, setEditingMessageIdx] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserType(profile.user_type);
        }

        const { data: conversations, error } = await supabase
          .from('kira_conversations')
          .select('*')
          .order('updated_at', { ascending: false });

        if (!error && conversations) {
          setChatHistories(conversations.map(c => ({
            id: c.id,
            title: c.title,
            timestamp: new Date(c.updated_at),
            project_id: c.project_id,
            pinned: c.pinned ?? false,
          })));
          
          if (conversations.length > 0) {
            setActiveChat(conversations[0].id);
            setActiveProjectId(conversations[0].project_id || null);
          }
        }

        const { data: projectsData, error: projectsError } = await supabase
          .from('kira_projects')
          .select('*')
          .order('updated_at', { ascending: false });

        if (!projectsError && projectsData) {
          setProjects(projectsData);
        }
        setIsLoadingProjects(false);
      }
      setIsLoadingHistory(false);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChat) {
        setMessages([]);
        return;
      }

      const { data: msgs, error } = await supabase
        .from('kira_messages')
        .select('*')
        .eq('conversation_id', activeChat)
        .order('created_at', { ascending: true });

      if (!error && msgs) {
        setMessages(msgs.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
          file: m.file_name || undefined,
          timestamp: new Date(m.created_at),
        })));
      }
    };

    loadMessages();
  }, [activeChat]);

  useEffect(() => {
    if (userType) {
      const greeting = getGreeting();
      setCurrentGreeting(greeting);
    }
  }, [userType]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveMessage = async (conversationId: string, role: "user" | "assistant", content: string, fileName?: string) => {
    if (!content) {
      console.log("saveMessage skipped- content is empty");
      return;
    }
    const { error } = await supabase.from('kira_messages').insert({
      conversation_id: conversationId,
      role,
      content,
      file_name: fileName
    });

    if (error) {
      console.log("saveMessage error:", JSON.stringify(error));
      console.log("values:", { conversationId, role, content, fileName });
    }
  };

  const updateConversationTitle = async (conversationId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    await supabase
      .from('kira_conversations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', conversationId);
    
    setChatHistories(prev => prev.map(c => 
      c.id === conversationId ? { ...c, title, timestamp: new Date() } : c
    ));
  };

  const getActiveProject = () => {
    return projects.find(p => p.id === activeProjectId);
  };

  // Character-reveal animation: drains streamBufferRef at ~6 chars/frame (~360 chars/sec)
  // so tokens appear smoothly instead of jumping in as large batches.
  useEffect(() => {
    if (!isStreaming) return;
    const CHARS_PER_FRAME = 6;

    const tick = () => {
      if (streamBufferRef.current.length > 0) {
        const batch = streamBufferRef.current.slice(0, CHARS_PER_FRAME);
        streamBufferRef.current = streamBufferRef.current.slice(CHARS_PER_FRAME);
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: last.content + batch };
          }
          return updated;
        });
      }

      if (streamBufferRef.current.length === 0 && networkDoneRef.current) {
        setIsStreaming(false);
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isStreaming]);

  const streamKiraResponse = useCallback(async (userMessages: Message[], conversationId: string) => {
    const lastUserContent = userMessages[userMessages.length - 1].content;
    const history = userMessages.slice(-7, -1).map(m => ({ role: m.role, content: m.content }));

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kira-gpt`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ prompt: lastUserContent, history, conversationId }),
      }
    );

    if (!response.ok) {
      let msg = "Couldn't reach Kira right now. Please try again!";
      try {
        const body = await response.json();
        if (body?.error) msg = body.error;
      } catch { /* ignore */ }
      throw new Error(msg);
    }

    const contentType = response.headers.get('content-type') ?? '';

    // Streaming path — edge function returns text/plain
    if (contentType.includes('text/plain') && response.body) {
      streamBufferRef.current = '';
      networkDoneRef.current = false;
      setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date() }]);
      setIsStreaming(true);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          streamBufferRef.current += chunk;
        }
        networkDoneRef.current = true;
      } catch (err) {
        streamBufferRef.current = '';
        networkDoneRef.current = true;
        throw err;
      }

      await saveMessage(conversationId, 'assistant', fullContent);
      return fullContent;
    }

    // Fallback: JSON (prompt-abuse reply or unexpected content-type)
    const data = await response.json();
    const assistantContent = data.reply;
    if (!assistantContent) throw new Error("Kira didn't respond. Please try again!");
    setMessages(prev => [...prev, { role: 'assistant', content: assistantContent, timestamp: new Date() }]);
    await saveMessage(conversationId, 'assistant', assistantContent);
    return assistantContent;
  }, [userType, activeProjectId, projects]);

  // ── NEW: copy handler ──
  const handleCopy = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // ── NEW: send with optional override (used by retry/edit) ──
  const handleSend = async (overrideInput?: string) => {
    const messageContent = overrideInput ?? input;
    if (!messageContent.trim() && !selectedFile) return;
    if (!userId) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to chat with Kira",
        variant: "destructive",
      });
      return;
    }
    if (isAtKiraLimit) {
      toast({
        title: "Daily limit reached",
        description: `You've used all ${kiraActionsLimit} Kira messages for today. Upgrade for more.`,
        variant: "destructive",
      });
      return;
    }
    
    const newMessage: Message = { 
      role: "user", 
      content: messageContent,
      file: selectedFile?.name,
      timestamp: new Date(),
    };
    
    let conversationId = activeChat;
    
    if (!conversationId) {
      const { data: newConvo, error } = await supabase
        .from('kira_conversations')
        .insert({ 
          user_id: userId, 
          title: 'New conversation',
          project_id: activeProjectId 
        })
        .select()
        .single();
      
      if (error || !newConvo) {
        toast({
          title: "Error",
          description: "Couldn't start a new conversation",
          variant: "destructive",
        });
        return;
      }
      
      conversationId = newConvo.id;
      setActiveChat(conversationId);
      setChatHistories(prev => [{
        id: newConvo.id,
        title: 'New conversation',
        timestamp: new Date(),
        project_id: activeProjectId
      }, ...prev]);
    }

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    if (!overrideInput) setInput("");
    setSelectedFile(null);
    setPendingAction(null);
    setKiraContractContext(null);
    setKiraInvoiceContext(null);
    setIsLoading(true);
    
    await saveMessage(conversationId, "user", newMessage.content, newMessage.file);
    
    if (messages.length === 0) {
      await updateConversationTitle(conversationId, newMessage.content);
    }
    
    try {
      await streamKiraResponse(updatedMessages, conversationId);
      
      await supabase
        .from('kira_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
        
    } catch (error) {
      toast({
        title: "Oops!",
        description: error instanceof Error ? error.message : "Couldn't reach Kira right now. Please try again!",
        variant: "destructive",
      });
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I had a little hiccup! Could you try asking me again?",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── NEW: edit + retry handler ──
  const handleEditRetry = async (idx: number) => {
    const edited = editingContent.trim();
    if (!edited) return;

    // Slice off this message and everything after it
    const newMessages = messages.slice(0, idx);
    setMessages(newMessages);
    setEditingMessageIdx(null);
    setEditingContent("");

    // Send the edited content directly
    await handleSend(edited);
  };

  // ── NEW: retry without editing ──
  const handleRetry = async (content: string, idx: number) => {
    const newMessages = messages.slice(0, idx);
    setMessages(newMessages);
    await handleSend(content);
  };

  const handleNewChat = async (projectId?: string | null) => {
    if (!userId) return;
    
    const { data: newConvo, error } = await supabase
      .from('kira_conversations')
      .insert({ 
        user_id: userId, 
        title: 'New conversation',
        project_id: projectId ?? null
      })
      .select()
      .single();
    
    if (!error && newConvo) {
      const newChat: ChatHistory = {
        id: newConvo.id,
        title: 'New conversation',
        timestamp: new Date(),
        project_id: projectId ?? null
      };
      setChatHistories([newChat, ...chatHistories]);
      setActiveChat(newChat.id);
      setActiveProjectId(projectId ?? null);
      setMessages([]);
      setViewMode("chat");
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    const { error } = await supabase
      .from('kira_conversations')
      .delete()
      .eq('id', chatId);

    if (!error) {
      setChatHistories(prev => prev.filter(c => c.id !== chatId));
      if (activeChat === chatId) {
        const remaining = chatHistories.filter(c => c.id !== chatId);
        setActiveChat(remaining.length > 0 ? remaining[0].id : null);
      }
    }
    setChatToDelete(null);
  };

  const handlePinChat = async (chatId: string, currentlyPinned: boolean) => {
    const { error } = await supabase
      .from('kira_conversations')
      .update({ pinned: !currentlyPinned })
      .eq('id', chatId);
    if (!error) {
      setChatHistories(prev => prev.map(c =>
        c.id === chatId ? { ...c, pinned: !currentlyPinned } : c
      ));
    }
  };

  const handleRenameChat = async (chatId: string) => {
    const trimmed = renameValue.trim();
    setRenamingChatId(null);
    setRenameValue("");
    if (!trimmed) return;
    const { error } = await supabase
      .from('kira_conversations')
      .update({ title: trimmed })
      .eq('id', chatId);
    if (!error) {
      setChatHistories(prev => prev.map(c =>
        c.id === chatId ? { ...c, title: trimmed } : c
      ));
    }
  };

  const handleLongPressStart = (chat: ChatHistory) => {
    longPressTimerRef.current = setTimeout(() => {
      setMobileLongPressChat(chat);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProjectCreated = (project: Project) => {
    setProjects(prev => [project, ...prev]);
  };

  const handleProjectUpdated = (project: Project) => {
    setProjects(prev => prev.map(p => p.id === project.id ? project : p));
    setSelectedProject(project);
  };

  const handleProjectDeleted = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
    }
  };

  const handleConversationSelect = (conversationId: string, projectId: string) => {
    setActiveChat(conversationId);
    setActiveProjectId(projectId);
    setViewMode("chat");
  };

  const filteredChats = chatHistories.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generalChats = filteredChats.filter(c => !c.project_id);
  const projectChats = filteredChats.filter(c => c.project_id);
  const pinnedGeneralChats = generalChats.filter(c => c.pinned);
  const unpinnedGeneralChats = generalChats.filter(c => !c.pinned);

  const quickActions = userType === 'brand' ? [
    { icon: Users, label: "Find creators", prompt: "Help me find creators for my next campaign" },
    { icon: FileText, label: "Write a brief", prompt: "Help me write a campaign brief" },
    { icon: BarChart3, label: "Analyze ROI", prompt: "How do I measure influencer marketing ROI?" },
    { icon: TrendingUp, label: "Strategy tips", prompt: "Give me campaign optimization tips" },
  ] : [
    { icon: Lightbulb, label: "Content ideas", prompt: "Give me content ideas for this week" },
    { icon: FileText, label: "Write a pitch", prompt: "Help me write a brand pitch" },
    { icon: Users, label: "Find collabs", prompt: "How do I find brand collaborations?" },
    { icon: TrendingUp, label: "Growth tips", prompt: "Give me tips to grow my audience" },
  ];

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const activeProject = getActiveProject();

  // const formatTime = (date?: Date) => {
  //   if (!date) return "";
  //   return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  // };

  return (
    <div className="h-[calc(100vh-64px-64px)] md:h-[calc(100vh-64px)] flex bg-background">
      {/* Desktop Sidebar */}
      <div 
        className={`hidden md:flex flex-col bg-card/50 border-r border-border/50 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-72'
        }`}
      >
        <div className="h-14 flex items-center justify-between px-3 border-b border-border/50">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bronze to-bronze-dark flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-background" />
              </div>
              <span className="font-poppins font-semibold text-sm">Kira AI</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            {!sidebarCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMemoryPanelOpen(true)}
                title="Kira settings"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              {sidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="p-3">
          <Button 
            onClick={() => handleNewChat(null)}
            className={`w-full gap-2 bg-bronze hover:bg-bronze/90 text-background font-poppins ${
              sidebarCollapsed ? 'px-0 justify-center' : 'justify-start'
            }`}
            size="sm"
          >
            <Plus className="w-4 h-4" />
            {!sidebarCollapsed && "New Chat"}
          </Button>
        </div>

        {!sidebarCollapsed && (
          <div className="px-3 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search chats..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm bg-muted/50 border-border/50"
              />
            </div>
          </div>
        )}

        {!sidebarCollapsed && (
          <div className="px-3 space-y-1 mb-2">
            <button
              onClick={() => setViewMode("chat")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                viewMode === "chat" ? "bg-bronze/10 text-foreground" : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Chats
            </button>
            <button
              onClick={() => setViewMode("projects")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                viewMode === "projects" ? "bg-bronze/10 text-foreground" : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              Projects
              <span className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                {projects.length}
              </span>
            </button>
          </div>
        )}

        {!sidebarCollapsed && viewMode === "chat" && (
          <>
            <div className="px-3 py-2">
              <p className="text-xs font-poppins font-medium text-muted-foreground uppercase tracking-wider">
                Recent Chats
              </p>
            </div>

            <ScrollArea className="flex-1 px-2">
              <div className="space-y-1 pb-3">
                {isLoadingHistory ? (
                  <div className="py-8 text-center">
                    <Loader2 className="w-5 h-5 mx-auto text-muted-foreground animate-spin mb-2" />
                    <p className="text-xs text-muted-foreground">Loading...</p>
                  </div>
                ) : generalChats.length === 0 && projectChats.length === 0 ? (
                  <div className="py-8 text-center">
                    <MessageSquare className="w-6 h-6 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {searchQuery ? 'No chats found' : 'No chats yet'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Pinned section */}
                    {pinnedGeneralChats.length > 0 && (
                      <div className="mb-1">
                        <p className="text-xs font-medium text-muted-foreground px-2 py-1.5 flex items-center gap-1.5">
                          <Pin className="w-3 h-3" /> Pinned
                        </p>
                        {pinnedGeneralChats.map((chat) => (
                          <DesktopChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={activeChat === chat.id}
                            isRenaming={renamingChatId === chat.id}
                            renameValue={renameValue}
                            onSelect={() => { setActiveChat(chat.id); setActiveProjectId(null); setViewMode("chat"); }}
                            onRenameChange={setRenameValue}
                            onRenameSubmit={() => handleRenameChat(chat.id)}
                            onRenameCancel={() => { setRenamingChatId(null); setRenameValue(""); }}
                            onStartRename={() => { setRenamingChatId(chat.id); setRenameValue(chat.title); }}
                            onPin={() => handlePinChat(chat.id, !!chat.pinned)}
                            onDelete={() => setChatToDelete(chat.id)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Recent chats */}
                    {unpinnedGeneralChats.map((chat) => (
                      <DesktopChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={activeChat === chat.id}
                        isRenaming={renamingChatId === chat.id}
                        renameValue={renameValue}
                        onSelect={() => { setActiveChat(chat.id); setActiveProjectId(null); setViewMode("chat"); }}
                        onRenameChange={setRenameValue}
                        onRenameSubmit={() => handleRenameChat(chat.id)}
                        onRenameCancel={() => { setRenamingChatId(null); setRenameValue(""); }}
                        onStartRename={() => { setRenamingChatId(chat.id); setRenameValue(chat.title); }}
                        onPin={() => handlePinChat(chat.id, !!chat.pinned)}
                        onDelete={() => setChatToDelete(chat.id)}
                      />
                    ))}

                    {projects.map(project => {
                      const projectConversations = projectChats.filter(c => c.project_id === project.id);
                      if (projectConversations.length === 0) return null;
                      return (
                        <div key={project.id} className="mt-3">
                          <button
                            onClick={() => { setSelectedProject(project); setProjectDetailOpen(true); }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <FolderOpen className="w-3 h-3" />
                            <span className="truncate">{project.name}</span>
                            <ChevronRight className="w-3 h-3 ml-auto" />
                          </button>
                          <div className="space-y-1 mt-1">
                            {projectConversations.slice(0, 3).map((chat) => (
                              <DesktopChatItem
                                key={chat.id}
                                chat={chat}
                                isActive={activeChat === chat.id}
                                isRenaming={renamingChatId === chat.id}
                                renameValue={renameValue}
                                indent
                                onSelect={() => { setActiveChat(chat.id); setActiveProjectId(project.id); setViewMode("chat"); }}
                                onRenameChange={setRenameValue}
                                onRenameSubmit={() => handleRenameChat(chat.id)}
                                onRenameCancel={() => { setRenamingChatId(null); setRenameValue(""); }}
                                onStartRename={() => { setRenamingChatId(chat.id); setRenameValue(chat.title); }}
                                onPin={() => handlePinChat(chat.id, !!chat.pinned)}
                                onDelete={() => setChatToDelete(chat.id)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </ScrollArea>
          </>
        )}

        {sidebarCollapsed && (
          <div className="flex flex-col items-center gap-2 px-2">
            <Button variant="ghost" size="icon" onClick={() => { setSidebarCollapsed(false); setViewMode("chat"); }} className="w-10 h-10 text-muted-foreground hover:text-foreground">
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { setSidebarCollapsed(false); setViewMode("projects"); }} className="w-10 h-10 text-muted-foreground hover:text-foreground">
              <FolderOpen className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setMemoryPanelOpen(true)} title="Kira settings" className="w-10 h-10 text-muted-foreground hover:text-foreground">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0 bg-card">
          <SheetHeader className="h-14 flex items-center px-4 border-b border-border/50">
            <SheetTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bronze to-bronze-dark flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-background" />
              </div>
              <span className="font-poppins font-semibold text-sm">Kira AI</span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col h-[calc(100%-56px)]">
            <div className="p-3">
              <Button onClick={() => { handleNewChat(null); setMobileSidebarOpen(false); }} className="w-full justify-start gap-2 bg-bronze hover:bg-bronze/90 text-background" size="sm">
                <Plus className="w-4 h-4" />
                New Chat
              </Button>
            </div>

            <div className="px-3 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search chats..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" />
              </div>
            </div>

            <div className="px-3 space-y-1 mb-2">
              <button onClick={() => setViewMode("chat")} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${viewMode === "chat" ? "bg-bronze/10 text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}>
                <MessageSquare className="w-4 h-4" />
                Chats
              </button>
              <button onClick={() => { setViewMode("projects"); setMobileSidebarOpen(false); }} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${viewMode === "projects" ? "bg-bronze/10 text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}>
                <FolderOpen className="w-4 h-4" />
                Projects
                <span className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">{projects.length}</span>
              </button>
            </div>

            <div className="px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Chats</p>
            </div>

            <ScrollArea className="flex-1 px-2">
              <div className="space-y-1 pb-3">
                {/* Pinned mobile */}
                {filteredChats.filter(c => c.pinned).length > 0 && (
                  <p className="text-xs font-medium text-muted-foreground px-2 py-1.5 flex items-center gap-1.5">
                    <Pin className="w-3 h-3" /> Pinned
                  </p>
                )}
                {filteredChats.filter(c => c.pinned).map((chat) => (
                  <MobileChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={activeChat === chat.id}
                    isRenaming={renamingChatId === chat.id}
                    renameValue={renameValue}
                    onSelect={() => { setActiveChat(chat.id); setActiveProjectId(chat.project_id || null); setMobileSidebarOpen(false); setViewMode("chat"); }}
                    onRenameChange={setRenameValue}
                    onRenameSubmit={() => handleRenameChat(chat.id)}
                    onRenameCancel={() => { setRenamingChatId(null); setRenameValue(""); }}
                    onLongPress={() => setMobileLongPressChat(chat)}
                    onLongPressStart={() => handleLongPressStart(chat)}
                    onLongPressEnd={handleLongPressEnd}
                  />
                ))}

                {/* Recent mobile */}
                {filteredChats.filter(c => !c.pinned).map((chat) => (
                  <MobileChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={activeChat === chat.id}
                    isRenaming={renamingChatId === chat.id}
                    renameValue={renameValue}
                    onSelect={() => { setActiveChat(chat.id); setActiveProjectId(chat.project_id || null); setMobileSidebarOpen(false); setViewMode("chat"); }}
                    onRenameChange={setRenameValue}
                    onRenameSubmit={() => handleRenameChat(chat.id)}
                    onRenameCancel={() => { setRenamingChatId(null); setRenameValue(""); }}
                    onLongPress={() => setMobileLongPressChat(chat)}
                    onLongPressStart={() => handleLongPressStart(chat)}
                    onLongPressEnd={handleLongPressEnd}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      {viewMode === "projects" ? (
        <ProjectsView
          projects={projects}
          isLoading={isLoadingProjects}
          onCreateProject={() => setCreateProjectOpen(true)}
          onSelectProject={(project) => { setSelectedProject(project); setProjectDetailOpen(true); }}
          onDeleteProject={handleProjectDeleted}
        />
      ) : (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <div className="md:hidden h-12 flex items-center gap-3 px-4 border-b border-border/50">
            <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(true)} className="h-8 w-8">
              <PanelLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 flex-1">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-bronze to-bronze-dark flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-background" />
              </div>
              <span className="font-poppins font-semibold text-sm">Kira</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMemoryPanelOpen(true)} title="Kira settings" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Project Context Banner */}
          {activeProject && (
            <button
              onClick={() => { setSelectedProject(activeProject); setProjectDetailOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-bronze/5 border-b border-bronze/20 hover:bg-bronze/10 transition-colors"
            >
              <FolderOpen className="w-4 h-4 text-bronze" />
              <span className="text-sm font-medium">{activeProject.name}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </button>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-hidden flex flex-col">
          <UsageLimitBanner
            current={kiraActionsToday}
            limit={kiraActionsLimit}
            feature="Kira AI actions"
          />
            <ScrollArea className="flex-1">
              <div className="min-h-full flex flex-col px-4 py-6">
                <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
                  {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                      <h1 className="font-vollkorn text-2xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-bronze to-bronze-dark bg-clip-text text-transparent">
                        {activeProject ? `Working on ${activeProject.name}` : currentGreeting}
                      </h1>
                      <p className="text-muted-foreground text-base max-w-md mb-12">
                        {activeProject 
                          ? activeProject.description || "Start chatting with project context"
                          : userType === 'brand' 
                            ? "I can help with creator discovery, campaign briefs, and strategy"
                            : "I can help with content ideas, brand pitches, and growth strategies"
                        }
                      </p>
                      <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                        {quickActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickAction(action.prompt)}
                            className="group flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-bronze/50 hover:bg-muted/50 transition-all text-left"
                          >
                            <div className="p-2 rounded-lg bg-bronze/10 text-bronze group-hover:bg-bronze group-hover:text-background transition-all">
                              <action.icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium leading-snug">{action.label}</span>
                            <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 py-4">
                      {messages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 12, filter: "blur(3px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          transition={{ duration: 0.4, delay: idx === messages.length - 1 ? 0.05 : 0, ease: [0.25, 0.46, 0.45, 0.94] }}
                          onMouseEnter={() => setHoveredIdx(idx)}
                          onMouseLeave={() => setHoveredIdx(null)}
                        >
                          <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            {msg.role === 'user' && (
                              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-bronze text-background">
                                <span className="text-xs font-semibold">You</span>
                              </div>
                            )}

                            <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                              
                              {/* ── EDIT MODE ── */}
                              {editingMessageIdx === idx ? (
                                <div className="inline-flex flex-col gap-2 max-w-[85%] w-full text-left">
                                  <textarea
                                    value={editingContent}
                                    onChange={(e) => setEditingContent(e.target.value)}
                                    className="w-full rounded-2xl px-4 py-3 text-sm bg-muted border border-bronze/50 focus:outline-none focus:ring-1 focus:ring-bronze resize-none"
                                    rows={3}
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleEditRetry(idx);
                                      }
                                      if (e.key === 'Escape') setEditingMessageIdx(null);
                                    }}
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() => { setEditingMessageIdx(null); setEditingContent(""); }}
                                      className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-muted-foreground hover:bg-muted transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleEditRetry(idx)}
                                      className="px-3 py-1.5 text-xs rounded-lg bg-bronze text-background hover:bg-bronze/90 transition-colors"
                                    >
                                      Resend
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {/* ── MESSAGE BUBBLE ── */}
                                  <div
                                    className={`inline-block max-w-[85%] rounded-2xl px-4 py-3 ${
                                      msg.role === 'user'
                                        ? 'bg-bronze text-background rounded-tr-md'
                                        : 'bg-muted rounded-tl-md'
                                    }`}
                                  >
                                    <p className="text-base whitespace-pre-wrap text-left">
                                      {msg.content}
                                      {isStreaming && idx === messages.length - 1 && msg.role === 'assistant' && (
                                        <StreamingCursor />
                                      )}
                                    </p>
                                    {msg.file && (
                                      <div className="mt-2 flex items-center gap-2 text-xs opacity-70">
                                        <Paperclip className="w-3 h-3" />
                                        {msg.file}
                                      </div>
                                    )}
                                  </div>

                                 

                                  {/* ── HOVER ACTION BUTTONS ── */}
                                  <AnimatePresence>
                                    {hoveredIdx === idx && (
                                      <motion.div
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 4 }}
                                        transition={{ duration: 0.15 }}
                                        className={`flex items-center gap-1 mt-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                      >
                                        {/* Copy */}
                                        <button
                                          onClick={() => handleCopy(msg.content, idx)}
                                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-all border border-transparent hover:border-border/50"
                                        >
                                          {copiedIdx === idx ? (
                                            <><Check className="w-3 h-3 text-green-500" /><span className="text-green-500">Copied</span></>
                                          ) : (
                                            <><Copy className="w-3 h-3" /><span>Copy</span></>
                                          )}
                                        </button>

                                        {/* Edit + Retry — user messages only */}
                                        {msg.role === 'user' && (
                                          <>
                                            <button
                                              onClick={() => { setEditingMessageIdx(idx); setEditingContent(msg.content); }}
                                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-all border border-transparent hover:border-border/50"
                                            >
                                              <Pencil className="w-3 h-3" />
                                              <span>Edit</span>
                                            </button>
                                            <button
                                              onClick={() => handleRetry(msg.content, idx)}
                                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-all border border-transparent hover:border-border/50"
                                            >
                                              <RotateCcw className="w-3 h-3" />
                                              <span>Retry</span>
                                            </button>
                                          </>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Action card — shown below last assistant message */}
                          {msg.role === 'assistant' && idx === messages.length - 1 && !isLoading && pendingAction && (
                            <div className="ml-11 mt-3">
                              {pendingAction === 'open_contract' && (
                                <button onClick={() => setContractDialogOpen(true)} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-bronze/40 bg-bronze/5 hover:bg-bronze/10 hover:border-bronze/60 transition-all text-left w-fit">
                                  <div className="p-1.5 rounded-lg bg-bronze/15 text-bronze"><FileSignature className="w-4 h-4" /></div>
                                  <div><p className="text-sm font-medium">Create Canvas</p><p className="text-xs text-muted-foreground">Open the Canvas builder</p></div>
                                  <ArrowRight className="w-4 h-4 text-bronze ml-2" />
                                </button>
                              )}
                              {pendingAction === 'open_invoice' && (
                                <button onClick={() => setInvoiceDialogOpen(true)} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-bronze/40 bg-bronze/5 hover:bg-bronze/10 hover:border-bronze/60 transition-all text-left w-fit">
                                  <div className="p-1.5 rounded-lg bg-bronze/15 text-bronze"><Receipt className="w-4 h-4" /></div>
                                  <div><p className="text-sm font-medium">Create Invoice</p><p className="text-xs text-muted-foreground">Open the invoice builder</p></div>
                                  <ArrowRight className="w-4 h-4 text-bronze ml-2" />
                                </button>
                              )}
                              {pendingAction === 'open_approve' && (
                                <button onClick={() => setApproveDialogOpen(true)} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-bronze/40 bg-bronze/5 hover:bg-bronze/10 hover:border-bronze/60 transition-all text-left w-fit">
                                  <div className="p-1.5 rounded-lg bg-bronze/15 text-bronze"><FileSignature className="w-4 h-4" /></div>
                                  <div><p className="text-sm font-medium">Approve / Update Document</p><p className="text-xs text-muted-foreground">Move a Canvas or invoice to the next stage</p></div>
                                  <ArrowRight className="w-4 h-4 text-bronze ml-2" />
                                </button>
                              )}
                            </div>
                          )}
                        </motion.div>
                      ))}
                      
                      {/* Thinking indicator — shown before streaming begins */}
                      <AnimatePresence>
                        {isLoading && !isStreaming && messages[messages.length - 1]?.role === 'user' && (
                          <ThinkingIndicator />
                        )}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 bg-background">
            <div className="max-w-2xl mx-auto">
              {selectedFile && (
                <div className="mb-3 flex items-center gap-2 p-3 bg-muted rounded-xl text-sm border border-border/50">
                  <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 truncate">{selectedFile.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)} className="h-6 w-6 p-0 hover:bg-destructive/10">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              
              <div className="bg-card rounded-2xl border border-border/50 p-3 shadow-lg">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && !isLoading && !isAtKiraLimit && handleSend()}
                  placeholder={isAtKiraLimit ? `Daily limit reached (${kiraActionsLimit}/${kiraActionsLimit}) · Upgrade to continue` : activeProject ? `Ask Kira about ${activeProject.name}...` : "How can I help you today?"}
                  className="border-0 bg-transparent h-12 text-base focus-visible:ring-0 px-1 placeholder:text-muted-foreground/70"
                  disabled={isLoading || isAtKiraLimit}
                />
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                  <div className="flex items-center gap-1">
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,.pdf,.doc,.docx,.txt" />
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted">
                          <Plus className="w-5 h-5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="gap-3 cursor-pointer">
                          <Image className="w-4 h-4 text-muted-foreground" />
                          <div className="flex flex-col"><span className="font-medium">Add images</span><span className="text-xs text-muted-foreground">Upload photos or screenshots</span></div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="gap-3 cursor-pointer">
                          <FileUp className="w-4 h-4 text-muted-foreground" />
                          <div className="flex flex-col"><span className="font-medium">Add files</span><span className="text-xs text-muted-foreground">PDF, DOC, TXT files</span></div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setVoiceChatOpen(true)} className="gap-3 cursor-pointer">
                          <Mic className="w-4 h-4 text-muted-foreground" />
                          <div className="flex flex-col"><span className="font-medium">Voice chat</span><span className="text-xs text-muted-foreground">Talk with Kira</span></div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setViewMode("projects")} className="gap-3 cursor-pointer">
                          <FolderOpen className="w-4 h-4 text-muted-foreground" />
                          <div className="flex flex-col"><span className="font-medium">Use project</span><span className="text-xs text-muted-foreground">Add project context</span></div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {kiraActionsLimit < 1000 && (
                      <span className={`text-[10px] font-semibold tabular-nums ${isAtKiraLimit ? "text-destructive" : "text-muted-foreground/50"}`}>
                        {kiraActionsToday}/{kiraActionsLimit}
                      </span>
                    )}
                    <Button
                      onClick={() => handleSend()}
                      disabled={isLoading || isAtKiraLimit || (!input.trim() && !selectedFile)}
                      size="icon"
                      className="h-9 w-9 rounded-lg bg-bronze hover:bg-bronze-dark text-background"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Kira may occasionally make mistakes. Please verify important information.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      {userId && (
        <CreateProjectDialog
          open={createProjectOpen}
          onOpenChange={setCreateProjectOpen}
          userId={userId}
          onProjectCreated={handleProjectCreated}
        />
      )}

      <ProjectDetailSheet
        project={selectedProject}
        open={projectDetailOpen}
        onOpenChange={setProjectDetailOpen}
        onProjectUpdated={handleProjectUpdated}
        onProjectDeleted={handleProjectDeleted}
        onConversationSelect={handleConversationSelect}
        onNewChat={(projectId) => handleNewChat(projectId)}
      />

      <VoiceChatDialog
        open={voiceChatOpen}
        onOpenChange={setVoiceChatOpen}
        userType={userType}
        projectContext={getActiveProject() ? {
          name: getActiveProject()!.name,
          description: getActiveProject()!.description,
          customInstructions: getActiveProject()!.custom_instructions
        } : null}
      />

      <CreateContractDialog
        open={contractDialogOpen}
        onOpenChange={setContractDialogOpen}
        onSuccess={() => setContractDialogOpen(false)}
        kiraContext={kiraContractContext}
      />

      <CreateInvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        onSuccess={() => setInvoiceDialogOpen(false)}
        kiraContext={kiraInvoiceContext}
      />

      <ApproveActionDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
      />

      {userId && (
        <KiraSettingsPanel
          open={memoryPanelOpen}
          onOpenChange={setMemoryPanelOpen}
          userId={userId}
        />
      )}

      {/* Mobile long-press chat actions */}
      <Sheet open={!!mobileLongPressChat} onOpenChange={(open) => { if (!open) setMobileLongPressChat(null); }}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader className="pb-3">
            <SheetTitle className="text-sm font-medium truncate text-left">
              {mobileLongPressChat?.title}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-1">
            <button
              onClick={() => {
                handlePinChat(mobileLongPressChat!.id, !!mobileLongPressChat!.pinned);
                setMobileLongPressChat(null);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted transition-colors text-left"
            >
              {mobileLongPressChat?.pinned
                ? <PinOff className="w-4 h-4 text-muted-foreground" />
                : <Pin className="w-4 h-4 text-muted-foreground" />}
              <span className="text-sm font-medium">{mobileLongPressChat?.pinned ? 'Unpin' : 'Pin'}</span>
            </button>
            <button
              onClick={() => {
                setRenamingChatId(mobileLongPressChat!.id);
                setRenameValue(mobileLongPressChat!.title);
                setActiveChat(mobileLongPressChat!.id);
                setMobileLongPressChat(null);
                setMobileSidebarOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted transition-colors text-left"
            >
              <Pencil className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Rename</span>
            </button>
            <button
              onClick={() => {
                setChatToDelete(mobileLongPressChat!.id);
                setMobileLongPressChat(null);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-left"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">Delete</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Chat delete confirmation */}
      <AlertDialog open={!!chatToDelete} onOpenChange={(open) => { if (!open) setChatToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This conversation will be permanently deleted and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => chatToDelete && handleDeleteChat(chatToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Kira;