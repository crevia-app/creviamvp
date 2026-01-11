import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Move,
  Type,
  Image,
  StickyNote,
  CheckSquare,
  Users,
  MessageSquare,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Hand,
  MousePointer,
  Undo,
  Redo,
  Download,
  Share2,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import kiraImage from "@/assets/kira-mascot-new.png";

interface CanvasNode {
  id: string;
  type: "text" | "sticky" | "image" | "task" | "ai-suggestion";
  x: number;
  y: number;
  content: string;
  width?: number;
  height?: number;
  color?: string;
  completed?: boolean;
}

const KiraCanvas = () => {
  const [nodes, setNodes] = useState<CanvasNode[]>([
    {
      id: "welcome",
      type: "sticky",
      x: 100,
      y: 100,
      content: "Welcome to Kira Canvas! 🎨\n\nDrag items around, add notes, tasks, and get AI suggestions.",
      color: "#FEF3C7",
      width: 280,
    },
    {
      id: "ai-tip",
      type: "ai-suggestion",
      x: 420,
      y: 100,
      content: "💡 Tip: Ask Kira to help brainstorm content ideas for your next campaign!",
      width: 280,
    },
  ]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<"select" | "pan">("select");
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const stickyColors = [
    { name: "Yellow", value: "#FEF3C7" },
    { name: "Pink", value: "#FCE7F3" },
    { name: "Blue", value: "#DBEAFE" },
    { name: "Green", value: "#D1FAE5" },
    { name: "Purple", value: "#EDE9FE" },
    { name: "Orange", value: "#FFEDD5" },
  ];

  const addNode = (type: CanvasNode["type"]) => {
    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      type,
      x: 200 + Math.random() * 100,
      y: 200 + Math.random() * 100,
      content: type === "sticky" 
        ? "New note..." 
        : type === "task" 
        ? "New task" 
        : type === "text"
        ? "Click to edit"
        : "AI suggestion will appear here",
      color: type === "sticky" ? stickyColors[Math.floor(Math.random() * stickyColors.length)].value : undefined,
      width: type === "sticky" || type === "ai-suggestion" ? 240 : undefined,
      completed: type === "task" ? false : undefined,
    };
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode.id);
  };

  const updateNode = (id: string, updates: Partial<CanvasNode>) => {
    setNodes(nodes.map(node => 
      node.id === id ? { ...node, ...updates } : node
    ));
  };

  const deleteNode = (id: string) => {
    setNodes(nodes.filter(node => node.id !== id));
    setSelectedNode(null);
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId?: string) => {
    if (tool === "pan" || (e.button === 1)) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    } else if (nodeId) {
      setSelectedNode(nodeId);
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        setDragStart({ x: e.clientX - node.x, y: e.clientY - node.y });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && dragStart) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else if (selectedNode && dragStart && tool === "select") {
      updateNode(selectedNode, {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDragStart(null);
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.25, Math.min(2, prev + delta)));
  };

  const renderNode = (node: CanvasNode) => {
    const isSelected = selectedNode === node.id;

    return (
      <div
        key={node.id}
        className={cn(
          "absolute cursor-move select-none transition-shadow",
          isSelected && "ring-2 ring-bronze ring-offset-2"
        )}
        style={{
          left: node.x,
          top: node.y,
          width: node.width,
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, node.id);
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {node.type === "sticky" && (
          <div
            className="p-4 rounded-lg shadow-lg min-h-[120px]"
            style={{ backgroundColor: node.color }}
          >
            <textarea
              value={node.content}
              onChange={(e) => updateNode(node.id, { content: e.target.value })}
              className="w-full h-full min-h-[80px] bg-transparent resize-none border-none outline-none text-gray-800 text-sm font-medium"
              placeholder="Write something..."
            />
            {isSelected && (
              <div className="flex gap-1 mt-2">
                {stickyColors.map((color) => (
                  <button
                    key={color.value}
                    className={cn(
                      "w-5 h-5 rounded-full border-2",
                      node.color === color.value ? "border-gray-600" : "border-transparent"
                    )}
                    style={{ backgroundColor: color.value }}
                    onClick={() => updateNode(node.id, { color: color.value })}
                  />
                ))}
                <button
                  className="ml-auto p-1 hover:bg-black/10 rounded"
                  onClick={() => deleteNode(node.id)}
                >
                  <Trash2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
          </div>
        )}

        {node.type === "ai-suggestion" && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-bronze/20 to-bronze/10 border border-bronze/30 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <img src={kiraImage} alt="Kira" className="w-6 h-6" />
              <span className="text-xs font-semibold text-bronze">Kira Suggestion</span>
            </div>
            <p className="text-sm text-foreground">{node.content}</p>
            {isSelected && (
              <button
                className="mt-2 p-1 hover:bg-black/10 rounded"
                onClick={() => deleteNode(node.id)}
              >
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        )}

        {node.type === "task" && (
          <div className="p-3 rounded-lg bg-card border border-border shadow-md flex items-center gap-3 min-w-[200px]">
            <button
              className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                node.completed 
                  ? "bg-bronze border-bronze text-white" 
                  : "border-muted-foreground"
              )}
              onClick={() => updateNode(node.id, { completed: !node.completed })}
            >
              {node.completed && <CheckSquare className="w-3 h-3" />}
            </button>
            <input
              value={node.content}
              onChange={(e) => updateNode(node.id, { content: e.target.value })}
              className={cn(
                "flex-1 bg-transparent border-none outline-none text-sm",
                node.completed && "line-through text-muted-foreground"
              )}
            />
            {isSelected && (
              <button
                className="p-1 hover:bg-muted rounded"
                onClick={() => deleteNode(node.id)}
              >
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        )}

        {node.type === "text" && (
          <div className="min-w-[150px]">
            <input
              value={node.content}
              onChange={(e) => updateNode(node.id, { content: e.target.value })}
              className="bg-transparent border-none outline-none text-lg font-semibold text-foreground"
              style={{ width: `${Math.max(150, node.content.length * 12)}px` }}
            />
            {isSelected && (
              <button
                className="absolute -top-2 -right-2 p-1 bg-destructive rounded-full"
                onClick={() => deleteNode(node.id)}
              >
                <Trash2 className="w-3 h-3 text-white" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="h-14 border-b border-border/50 px-4 flex items-center justify-between bg-card/50">
        <div className="flex items-center gap-2">
          {/* Tool Selection */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", tool === "select" && "bg-background shadow-sm")}
              onClick={() => setTool("select")}
            >
              <MousePointer className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", tool === "pan" && "bg-background shadow-sm")}
              onClick={() => setTool("pan")}
            >
              <Hand className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-border mx-2" />

          {/* Add Items */}
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => addNode("sticky")}>
            <StickyNote className="w-4 h-4 text-yellow-500" />
            <span className="hidden sm:inline">Note</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => addNode("task")}>
            <CheckSquare className="w-4 h-4 text-green-500" />
            <span className="hidden sm:inline">Task</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => addNode("text")}>
            <Type className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline">Text</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => addNode("ai-suggestion")}>
            <Sparkles className="w-4 h-4 text-bronze" />
            <span className="hidden sm:inline">AI Idea</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleZoom(-0.1)}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleZoom(0.1)}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-border mx-2" />

          {/* Actions */}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={canvasRef}
        className={cn(
          "flex-1 relative overflow-hidden",
          tool === "pan" ? "cursor-grab" : "cursor-default",
          isPanning && "cursor-grabbing"
        )}
        style={{
          backgroundImage: `
            radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
        }}
        onMouseDown={(e) => handleMouseDown(e)}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => setSelectedNode(null)}
      >
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
          }}
        >
          {nodes.map(renderNode)}
        </div>

        {/* Empty State */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <img src={kiraImage} alt="Kira" className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Your canvas is empty</h3>
              <p className="text-sm text-muted-foreground mb-4">Add notes, tasks, and ideas to start planning</p>
              <Button onClick={() => addNode("sticky")} className="bg-bronze hover:bg-bronze-dark">
                <Plus className="w-4 h-4 mr-2" />
                Add First Note
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Collaborators (Future Feature Preview) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bronze to-bronze-dark flex items-center justify-center ring-2 ring-background">
            <span className="text-xs font-bold text-white">Y</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="w-4 h-4" />
          Invite
        </Button>
      </div>
    </div>
  );
};

export default KiraCanvas;
