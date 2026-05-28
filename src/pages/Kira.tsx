import { useState, useRef, useEffect, useCallback } from "react";
import { useVisualViewport } from "@/hooks/use-visual-viewport";
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
  Share2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { CreateProjectDialog } from "@/components/kira/CreateProjectDialog";
import { ProjectDetailSheet } from "@/components/kira/ProjectDetailSheet";
import { ProjectsView } from "@/components/kira/ProjectsView";
import CreateCanvasDialog from "@/components/studio/CreateCanvasDialog";
import CreateInvoiceDialog from "@/components/studio/CreateInvoiceDialog";
import { ApproveActionDialog } from "@/components/kira/ApproveActionDialog";
import { KiraSettingsPanel } from "@/components/kira/KiraSettingsPanel";
import { motion, AnimatePresence } from "framer-motion";
import { useIOSKeyboardFit } from "@/hooks/use-keyboard-fit";


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
  onShare: () => void;
}

function DesktopChatItem({
  chat, isActive, isRenaming, renameValue, indent = false,
  onSelect, onRenameChange, onRenameSubmit, onRenameCancel, onStartRename, onPin, onDelete, onShare,
}: DesktopChatItemProps) {
  const [hovered, setHovered] = useState(false);
  const showMenu = isActive || hovered;

  return (
    <div
      onClick={() => { if (!isRenaming) onSelect(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative' }}
      className={`flex items-center gap-2 ${indent ? 'py-1.5 pl-7 pr-8' : 'py-2 pl-2.5 pr-8'} rounded-lg cursor-pointer transition-all ${
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
          className="flex-1 bg-transparent text-base md:text-sm outline-none border-b border-bronze/50 focus:border-bronze text-foreground min-w-0"
        />
      ) : (
        <span className="flex-1 min-w-0 text-sm truncate">{chat.title}</span>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <button
            style={{
              position: 'absolute',
              right: '4px',
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 1,
              pointerEvents: 'auto',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              color: 'inherit',
            }}
          >
            <MoreVertical style={{ width: '14px', height: '14px' }} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onClick={(e) => { e.stopPropagation(); onShare(); }}
            className="gap-2 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </DropdownMenuItem>
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
      className={`flex items-center gap-2 py-2 px-2.5 min-h-[44px] rounded-lg cursor-pointer transition-all select-none ${
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
          className="flex-1 bg-transparent text-base outline-none border-b border-bronze/50 focus:border-bronze text-foreground min-w-0"
        />
      ) : (
        <span className="flex-1 min-w-0 text-sm truncate">{chat.title}</span>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); onLongPress(); }}
        className="flex items-center justify-center rounded-lg flex-shrink-0 text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/80 transition-all min-w-[44px] min-h-[44px]"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ThinkingIndicator() {
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
          <span className="text-sm text-muted-foreground">Thinking...</span>
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

function detectKiraIntent(text: string): string | null {
  const t = text.toLowerCase();
  if (/\b(canvas|contract|agreement)\b/.test(t) && /\b(create|draft|open|let'?s|ready|shall i|want me|here'?s|go ahead|click)\b/.test(t)) return 'open_contract';
  if (/\binvoice\b/.test(t) && /\b(create|draft|send|open|let'?s|ready|shall i|want me|here'?s|go ahead|click)\b/.test(t)) return 'open_invoice';
  return null;
}

const Kira = () => {
  const { toast } = useToast();
  const { kiraActionsToday, kiraActionsLimit } = useSubscription();
  const { keyboardOpen } = useVisualViewport();
  const isAtKiraLimit = kiraActionsToday >= kiraActionsLimit;
  const [userType, setUserType] = useState<'creator' | 'brand' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef    = useRef<HTMLDivElement>(null);
  // Direct scroll-container ref — used for reliable programmatic scrollToBottom.
  // scrollIntoView() is unreliable on iOS/Android when the scroll container has
  // percentage-based children (it can't always identify the scrollable ancestor).
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [userName, setUserName] = useState<string | null>(null);
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
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<'image' | 'text' | null>(null);
  
  // View modes and dialogs
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectDetailOpen, setProjectDetailOpen] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  // Smart auto-scroll: only pull to bottom if the user is already near it.
  // When the user scrolls up to read history, streaming chars don't fight them.
  const isNearBottomRef = useRef(true);
  useIOSKeyboardFit(chatContainerRef, () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }));

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
          .select('user_type, display_name, handle')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserType(profile.user_type);
          setUserName(profile.display_name || profile.handle || null);
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
          // Always land on a fresh new-chat state; user picks from sidebar to resume
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
    // Always start a newly-opened chat scrolled to the bottom.
    isNearBottomRef.current = true;
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

  // TopBar hamburger fires this — opens mobile sheet or toggles desktop collapse
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth < 768) {
        setMobileSidebarOpen(true);
      } else {
        setSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener("kira:toggle-sidebar", handler);
    return () => window.removeEventListener("kira:toggle-sidebar", handler);
  }, []);

  // Smart auto-scroll: pull to bottom only when the user is already near the
  // bottom (~150 px threshold).  This means streaming chars don't yank the
  // viewport while the user is scrolling up to read earlier messages.
  // Force-scroll is triggered explicitly (handleSend / chat switch) by setting
  // isNearBottomRef.current = true before the messages state update.
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (!isNearBottomRef.current) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
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

  const streamKiraResponse = useCallback(async (
    userMessages: Message[],
    conversationId: string,
    attachContent?: string | null,
    attachType?: 'image' | 'text' | null,
    projectCtx?: { name: string; description: string | null; custom_instructions: string | null } | null,
  ) => {
    const lastUserContent = userMessages[userMessages.length - 1].content;
    const history = userMessages.slice(-7, -1).map(m => ({ role: m.role, content: m.content }));

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("Not authenticated");

    const body: Record<string, unknown> = { prompt: lastUserContent, history, conversationId };
    if (attachContent && attachType) {
      body.fileContent = attachContent;
      body.fileType = attachType;
    }
    if (projectCtx) {
      body.projectContext = projectCtx;
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kira-gpt`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify(body),
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
    const attachContent = selectedFileContent;
    const attachType = selectedFileType;
    // User just sent — always scroll to their message regardless of where they were.
    isNearBottomRef.current = true;
    setMessages(updatedMessages);
    if (!overrideInput) setInput("");
    setSelectedFile(null);
    setSelectedFileContent(null);
    setSelectedFileType(null);
    setPendingAction(null);
    setKiraContractContext(null);
    setKiraInvoiceContext(null);
    setIsLoading(true);

    await saveMessage(conversationId, "user", newMessage.content, newMessage.file);

    if (messages.length === 0) {
      await updateConversationTitle(conversationId, newMessage.content);
    }

    try {
      const activeProject = projects.find(p => p.id === activeProjectId);
      const projectCtx = activeProject
        ? { name: activeProject.name, description: activeProject.description, custom_instructions: activeProject.custom_instructions }
        : null;

      const responseContent = await streamKiraResponse(updatedMessages, conversationId, attachContent, attachType, projectCtx);

      if (responseContent) {
        const intent = detectKiraIntent(responseContent);
        if (intent) setPendingAction(intent);
      }

      const nowIso = new Date().toISOString();
      await supabase
        .from('kira_conversations')
        .update({ updated_at: nowIso })
        .eq('id', conversationId);

      // Keep project activity timestamp in sync so "Sort by Activity" is accurate
      if (activeProjectId) {
        await supabase
          .from('kira_projects')
          .update({ updated_at: nowIso })
          .eq('id', activeProjectId);
        setProjects(prev =>
          prev.map(p => p.id === activeProjectId ? { ...p, updated_at: nowIso } : p),
        );
      }

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

  const handleNewChat = (projectId?: string | null) => {
    setActiveChat(null);
    setActiveProjectId(projectId ?? null);
    setMessages([]);
    setViewMode("chat");
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

  const handleShareChat = async (chatId: string, chatTitle: string) => {
    const url = `${window.location.origin}/kira`;
    const shareData = {
      title: chatTitle,
      text: `Kira AI conversation: "${chatTitle}"`,
      url,
    };
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled — no toast needed
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied", description: chatTitle });
      } catch {
        toast({ title: "Couldn't copy link", variant: "destructive" });
      }
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
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isText = file.type === 'text/plain' || file.name.endsWith('.txt');

    if (!isImage && !isText) {
      toast({ title: "Unsupported file type", description: "Only images and .txt files are supported", variant: "destructive" });
      return;
    }

    setSelectedFile(file);

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new window.Image();
        img.onload = () => {
          const MAX = 1024;
          let { width, height } = img;
          if (width > MAX || height > MAX) {
            const ratio = Math.min(MAX / width, MAX / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
          setSelectedFileContent(canvas.toDataURL('image/jpeg', 0.85));
          setSelectedFileType('image');
        };
        img.src = ev.target!.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedFileContent((ev.target!.result as string).slice(0, 6000));
        setSelectedFileType('text');
      };
      reader.readAsText(file);
    }
  };

  const handleSelectProject = async (projectId: string | null) => {
    setActiveProjectId(projectId);
    if (activeChat) {
      await supabase
        .from('kira_conversations')
        .update({ project_id: projectId })
        .eq('id', activeChat);
      setChatHistories(prev => prev.map(c =>
        c.id === activeChat ? { ...c, project_id: projectId } : c
      ));
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
    chat.title !== 'New conversation' &&
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
    <div ref={chatContainerRef} className="h-full flex bg-background overscroll-none">
      {/* Desktop Sidebar */}
      <div 
        className={`hidden md:flex flex-col bg-card/50 border-r border-border/50 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-72'
        }`}
      >
        <div className="px-3 pt-3 pb-3">
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

            <ScrollArea className="flex-1">
              <div className="space-y-1 pb-3 px-2">
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
                            onShare={() => handleShareChat(chat.id, chat.title)}
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
                        onShare={() => handleShareChat(chat.id, chat.title)}
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
                                onShare={() => handleShareChat(chat.id, chat.title)}
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
          <div className="flex flex-col items-center gap-2 px-2 flex-1">
            <Button variant="ghost" size="icon" onClick={() => { setSidebarCollapsed(false); setViewMode("chat"); }} className="w-10 h-10 text-muted-foreground hover:text-foreground">
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { setSidebarCollapsed(false); setViewMode("projects"); }} className="w-10 h-10 text-muted-foreground hover:text-foreground">
              <FolderOpen className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Settings — pinned to bottom */}
        <div className={`border-t border-border/40 p-3 flex-shrink-0 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={() => setMemoryPanelOpen(true)}
            className={`group flex flex-col items-start gap-1 rounded-xl transition-all duration-200 hover:bg-bronze/10 ${
              sidebarCollapsed ? 'p-2 items-center' : 'w-full py-2.5 pl-2'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-muted/60 group-hover:bg-bronze/15 border border-border/50 group-hover:border-bronze/30 flex items-center justify-center transition-all shadow-sm">
              <Settings className="w-4 h-4 text-muted-foreground group-hover:text-bronze transition-colors" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-bronze transition-colors font-poppins tracking-wide uppercase">
                Settings
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0 bg-card">
          <SheetHeader className="h-14 flex items-center px-4 border-b border-border/50">
            <SheetTitle className="font-vollkorn text-2xl font-bold text-foreground tracking-tight">
              Kira
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col h-[calc(100%-56px)]">
            <div className="p-3">
              <Button onClick={() => { handleNewChat(null); setMobileSidebarOpen(false); }} className="w-full justify-start gap-2 bg-bronze hover:bg-bronze/90 text-background h-11 text-base">
                <Plus className="w-4 h-4" />
                New Chat
              </Button>
            </div>

            <div className="px-3 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search chats..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-11 text-base" />
              </div>
            </div>

            <div className="px-3 space-y-1 mb-2">
              <button onClick={() => setViewMode("chat")} className={`w-full flex items-center gap-2 px-3 py-3 min-h-[44px] rounded-lg text-sm transition-colors ${viewMode === "chat" ? "bg-bronze/10 text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}>
                <MessageSquare className="w-4 h-4" />
                Chats
              </button>
              <button onClick={() => { setViewMode("projects"); setMobileSidebarOpen(false); }} className={`w-full flex items-center gap-2 px-3 py-3 min-h-[44px] rounded-lg text-sm transition-colors ${viewMode === "projects" ? "bg-bronze/10 text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}>
                <FolderOpen className="w-4 h-4" />
                Projects
                <span className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">{projects.length}</span>
              </button>
            </div>

            <div className="px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Chats</p>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-1 pb-3 px-2">
                {/* Pinned general chats */}
                {pinnedGeneralChats.length > 0 && (
                  <p className="text-xs font-medium text-muted-foreground px-2 py-1.5 flex items-center gap-1.5">
                    <Pin className="w-3 h-3" /> Pinned
                  </p>
                )}
                {pinnedGeneralChats.map((chat) => (
                  <MobileChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={activeChat === chat.id}
                    isRenaming={renamingChatId === chat.id}
                    renameValue={renameValue}
                    onSelect={() => { setActiveChat(chat.id); setActiveProjectId(null); setMobileSidebarOpen(false); setViewMode("chat"); }}
                    onRenameChange={setRenameValue}
                    onRenameSubmit={() => handleRenameChat(chat.id)}
                    onRenameCancel={() => { setRenamingChatId(null); setRenameValue(""); }}
                    onLongPress={() => setMobileLongPressChat(chat)}
                    onLongPressStart={() => handleLongPressStart(chat)}
                    onLongPressEnd={handleLongPressEnd}
                  />
                ))}

                {/* Unpinned general chats */}
                {unpinnedGeneralChats.map((chat) => (
                  <MobileChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={activeChat === chat.id}
                    isRenaming={renamingChatId === chat.id}
                    renameValue={renameValue}
                    onSelect={() => { setActiveChat(chat.id); setActiveProjectId(null); setMobileSidebarOpen(false); setViewMode("chat"); }}
                    onRenameChange={setRenameValue}
                    onRenameSubmit={() => handleRenameChat(chat.id)}
                    onRenameCancel={() => { setRenamingChatId(null); setRenameValue(""); }}
                    onLongPress={() => setMobileLongPressChat(chat)}
                    onLongPressStart={() => handleLongPressStart(chat)}
                    onLongPressEnd={handleLongPressEnd}
                  />
                ))}

                {/* Project groups — matches desktop sidebar grouping */}
                {projects.map(project => {
                  const projectConversations = projectChats.filter(c => c.project_id === project.id);
                  if (projectConversations.length === 0) return null;
                  return (
                    <div key={project.id} className="mt-3">
                      <button
                        onClick={() => { setSelectedProject(project); setProjectDetailOpen(true); setMobileSidebarOpen(false); }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[36px]"
                      >
                        <FolderOpen className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate flex-1">{project.name}</span>
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                      </button>
                      <div className="space-y-1 mt-1">
                        {projectConversations.slice(0, 3).map((chat) => (
                          <MobileChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={activeChat === chat.id}
                            isRenaming={renamingChatId === chat.id}
                            renameValue={renameValue}
                            onSelect={() => { setActiveChat(chat.id); setActiveProjectId(project.id); setMobileSidebarOpen(false); setViewMode("chat"); }}
                            onRenameChange={setRenameValue}
                            onRenameSubmit={() => handleRenameChat(chat.id)}
                            onRenameCancel={() => { setRenamingChatId(null); setRenameValue(""); }}
                            onLongPress={() => setMobileLongPressChat(chat)}
                            onLongPressStart={() => handleLongPressStart(chat)}
                            onLongPressEnd={handleLongPressEnd}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Settings — pinned to bottom of mobile sidebar */}
            <div className="border-t border-border/40 p-3 flex-shrink-0">
              <button
                onClick={() => { setMemoryPanelOpen(true); setMobileSidebarOpen(false); }}
                className="group flex flex-col items-start gap-1 rounded-xl transition-all duration-200 hover:bg-bronze/10 w-full py-2.5 pl-2"
              >
                <div className="w-9 h-9 rounded-xl bg-muted/60 group-hover:bg-bronze/15 border border-border/50 group-hover:border-bronze/30 flex items-center justify-center transition-all shadow-sm">
                  <Settings className="w-4 h-4 text-muted-foreground group-hover:text-bronze transition-colors" />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-bronze transition-colors font-poppins tracking-wide uppercase">
                  Settings
                </span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">

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
          {/* Project Context Banner */}
          {activeProject && (
            <button
              onClick={() => { setSelectedProject(activeProject); setProjectDetailOpen(true); }}
              className="flex items-center gap-2 px-4 py-3 min-h-[44px] bg-bronze/5 border-b border-bronze/20 hover:bg-bronze/10 transition-colors"
            >
              <FolderOpen className="w-4 h-4 text-bronze" />
              <span className="text-sm font-medium">{activeProject.name}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </button>
          )}

          {/* Messages Area
              Native overflow-y-auto is used here instead of Radix <ScrollArea>
              because Radix injects a display:table wrapper that confuses iOS Safari
              and Android Chrome touch-scroll detection. A plain div with
              touch-pan-y + overscroll-y-contain is the correct cross-platform
              primitive for a chat message list. */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <UsageLimitBanner
              current={kiraActionsToday}
              limit={kiraActionsLimit}
              feature="Kira AI actions"
            />
            {/*
              SCROLL CONTAINER — ref + direct scrollTop control.
              KEY iOS/Android fix: NO min-h-full or height:100% children.
              On iOS Safari, min-height:100% inside overflow:auto is calculated
              against scrollHeight (not clientHeight), creating a circular
              dependency where scrollHeight always === clientHeight → no scroll.
              Fix: flat structure with dvh-based empty-state centering.
            */}
            <div
              ref={scrollContainerRef}
              className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y"
              onScroll={() => {
                const el = scrollContainerRef.current;
                if (!el) return;
                isNearBottomRef.current =
                  el.scrollHeight - el.scrollTop - el.clientHeight < 150;
              }}
            >
              {messages.length === 0 ? (
                /* Empty state: use min-h in dvh units — avoids % circular
                   dependency inside overflow:auto on iOS/Android. */
                <div className="min-h-[55dvh] flex flex-col items-center justify-center px-4 py-12 text-center">
                  <div className="max-w-md w-full">
                    {activeProject ? (
                      <>
                        <h1 className="font-vollkorn text-2xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-bronze to-bronze-dark bg-clip-text text-transparent">
                          Working on {activeProject.name}
                        </h1>
                        <p className="text-muted-foreground text-base mb-12">
                          {activeProject.description || "Start chatting with project context"}
                        </p>
                      </>
                    ) : (
                      <>
                        <h1 className="font-vollkorn text-3xl md:text-4xl font-bold mb-3 text-foreground">
                          Hello{userName ? `, ${userName}` : ""}!
                        </h1>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="px-4 py-6">
                  <div className="max-w-2xl mx-auto w-full">
                    <div className="space-y-6 py-4">
                      {messages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 12, filter: "blur(3px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          transition={{ duration: 0.4, delay: idx === messages.length - 1 ? 0.05 : 0, ease: [0.25, 0.46, 0.45, 0.94] }}
                          onMouseEnter={() => setHoveredIdx(idx)}
                          onMouseLeave={() => setHoveredIdx(null)}
                          className="group"
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
                                    className="w-full rounded-2xl px-4 py-3 text-base bg-muted border border-bronze/50 focus:outline-none focus:ring-1 focus:ring-bronze resize-none"
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

                                 

                                  {/* ── ACTION BUTTONS: always visible on mobile, hover-reveal on desktop ── */}
                                  <div className={`flex items-center gap-1 mt-1 transition-opacity duration-150 opacity-60 md:opacity-0 md:group-hover:opacity-100 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <button
                                      onClick={() => handleCopy(msg.content, idx)}
                                      className="flex items-center gap-1.5 px-2.5 py-2 min-h-[44px] rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted transition-all border border-transparent hover:border-border/50"
                                    >
                                      {copiedIdx === idx ? (
                                        <><Check className="w-3 h-3 text-green-500" /><span className="hidden sm:inline text-green-500">Copied</span></>
                                      ) : (
                                        <><Copy className="w-3 h-3" /><span className="hidden sm:inline">Copy</span></>
                                      )}
                                    </button>

                                    {msg.role === 'user' && (
                                      <>
                                        <button
                                          onClick={() => { setEditingMessageIdx(idx); setEditingContent(msg.content); }}
                                          className="flex items-center gap-1.5 px-2.5 py-2 min-h-[44px] rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted transition-all border border-transparent hover:border-border/50"
                                        >
                                          <Pencil className="w-3 h-3" />
                                          <span className="hidden sm:inline">Edit</span>
                                        </button>
                                        <button
                                          onClick={() => handleRetry(msg.content, idx)}
                                          className="flex items-center gap-1.5 px-2.5 py-2 min-h-[44px] rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted transition-all border border-transparent hover:border-border/50"
                                        >
                                          <RotateCcw className="w-3 h-3" />
                                          <span className="hidden sm:inline">Retry</span>
                                        </button>
                                      </>
                                    )}
                                  </div>
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
                  </div>
                </div>
              )}
            </div>{/* end scroll container */}
          </div>

          {/* Input Area
              Bottom padding uses --nav-bottom-offset so it contracts in sync
              with the bottom nav sliding away. On desktop the variable is 0px
              (set in :root) so md:p-6 wins via the inline-style guard below. */}
          <div
            className="flex-shrink-0 pt-3 px-4 bg-background transition-[padding-bottom] duration-300 ease-in-out md:p-6"
            style={
              // Only apply the dynamic padding on mobile — on desktop let md:p-6
              // handle it so the inline style doesn't override the 24 px desktop value.
              window.innerWidth < 768
                ? {
                    paddingBottom: keyboardOpen
                      ? "0.75rem"   // 12 px — keyboard is up, no nav gap needed
                      : "calc(var(--nav-bottom-offset) + 0.75rem)", // nav height + gap
                  }
                : undefined
            }
          >
            <div className="max-w-2xl mx-auto">
              {/* File attachment preview */}
              {selectedFile && (
                <div className="mb-2 flex items-center gap-2 px-4 py-2 bg-muted rounded-2xl text-sm border border-border/50">
                  {selectedFileType === 'image' && selectedFileContent ? (
                    <img src={selectedFileContent} alt="preview" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                  ) : (
                    <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="flex-1 truncate text-foreground/80">{selectedFile.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedFile(null); setSelectedFileContent(null); setSelectedFileType(null); }} className="h-9 w-9 p-0 hover:bg-destructive/10 rounded-full flex-shrink-0">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {/* Single-row pill input — Gemini/Claude style */}
              <div className="flex items-center gap-1 bg-muted/40 rounded-full border border-border/60 px-2 py-1.5 shadow-sm transition-all duration-200 focus-within:border-bronze/50 focus-within:bg-card focus-within:shadow-md">
                <input type="file" ref={imageInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                <input type="file" ref={textInputRef} onChange={handleFileSelect} className="hidden" accept=".txt,text/plain" />

                {/* Plus / attachment menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full hover:bg-background/80 flex-shrink-0">
                      <Plus className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem onClick={() => imageInputRef.current?.click()} className="gap-3 cursor-pointer">
                      <Image className="w-4 h-4 text-muted-foreground" />
                      <div className="flex flex-col"><span className="font-medium">Add images</span><span className="text-xs text-muted-foreground">Photos, screenshots, charts</span></div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => textInputRef.current?.click()} className="gap-3 cursor-pointer">
                      <FileUp className="w-4 h-4 text-muted-foreground" />
                      <div className="flex flex-col"><span className="font-medium">Add files</span><span className="text-xs text-muted-foreground">.txt files only</span></div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="gap-3 cursor-pointer">
                        <FolderOpen className="w-4 h-4 text-muted-foreground" />
                        <div className="flex flex-col text-left">
                          <span className="font-medium">Use project</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[130px]">
                            {activeProject ? activeProject.name : 'Add project context'}
                          </span>
                        </div>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-52">
                        {activeProjectId && (
                          <>
                            <DropdownMenuItem onClick={() => handleSelectProject(null)} className="gap-2 cursor-pointer text-muted-foreground">
                              <X className="w-3.5 h-3.5" />
                              <span className="text-sm">Remove project</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {projects.length === 0 ? (
                          <DropdownMenuItem onClick={() => setCreateProjectOpen(true)} className="gap-2 cursor-pointer">
                            <Plus className="w-3.5 h-3.5" />
                            <span className="text-sm">Create first project</span>
                          </DropdownMenuItem>
                        ) : (
                          <>
                            {projects.map(p => (
                              <DropdownMenuItem key={p.id} onClick={() => handleSelectProject(p.id)} className="gap-2 cursor-pointer">
                                <FolderOpen className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm truncate flex-1">{p.name}</span>
                                {activeProjectId === p.id && <Check className="w-3.5 h-3.5 text-bronze flex-shrink-0" />}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setCreateProjectOpen(true)} className="gap-2 cursor-pointer text-muted-foreground">
                              <Plus className="w-3.5 h-3.5" />
                              <span className="text-sm">New project</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Text input */}
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && !isLoading && !isAtKiraLimit && handleSend()}
                  placeholder={
                    isAtKiraLimit
                      ? 'Daily limit reached · Upgrade to continue'
                      : isLoading
                        ? 'Kira is responding...'
                        : activeProject
                          ? `Ask Kira about ${activeProject.name}...`
                          : 'Ask Kira anything...'
                  }
                  className="border-0 bg-transparent h-9 text-base focus-visible:ring-0 px-2 flex-1 min-w-0 placeholder:text-muted-foreground/60"
                  disabled={isAtKiraLimit}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="sentences"
                  spellCheck={false}
                  data-form-type="other"
                />

                {/* Usage counter */}
                {kiraActionsLimit < 1000 && (
                  <span className={`text-[10px] font-semibold tabular-nums flex-shrink-0 pr-1 ${isAtKiraLimit ? "text-destructive" : "text-muted-foreground/40"}`}>
                    {kiraActionsToday}/{kiraActionsLimit}
                  </span>
                )}

                {/* Send button — always visible; disabled when nothing to send */}
                <Button
                  onClick={() => handleSend()}
                  disabled={isLoading || isAtKiraLimit || (!input.trim() && !selectedFile)}
                  size="icon"
                  className="h-11 w-11 rounded-full bg-bronze hover:bg-bronze/90 text-background flex-shrink-0 disabled:opacity-30 transition-opacity"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>

            </div>
          </div>
        </div>
        )}
      </div>

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

      <CreateCanvasDialog
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
                handleShareChat(mobileLongPressChat!.id, mobileLongPressChat!.title);
                setMobileLongPressChat(null);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-xl hover:bg-muted transition-colors text-left"
            >
              <Share2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Share conversation</span>
            </button>
            <button
              onClick={() => {
                handlePinChat(mobileLongPressChat!.id, !!mobileLongPressChat!.pinned);
                setMobileLongPressChat(null);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-xl hover:bg-muted transition-colors text-left"
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
              className="w-full flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-xl hover:bg-muted transition-colors text-left"
            >
              <Pencil className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Rename</span>
            </button>
            <button
              onClick={() => {
                setChatToDelete(mobileLongPressChat!.id);
                setMobileLongPressChat(null);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-left"
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