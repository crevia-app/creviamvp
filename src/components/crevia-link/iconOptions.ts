import {
  Link2, Instagram, Twitter, Linkedin, Youtube, Mail, Globe, Github,
  Facebook, Music, Twitch, MapPin, Phone, Calendar, ShoppingBag,
  Camera, Headphones, Podcast, Rss, MessageCircle, Send,
  CreditCard, DollarSign, Heart, Star, Play, Video,
  FileText, BookOpen, GraduationCap, Briefcase, Store,
  Smartphone, Wifi, Coffee, Gift, Palette, Pen,
  Mic, Radio, Tv, Monitor, Gamepad2, Trophy,
  Newspaper, Hash, AtSign, QrCode, Download, ExternalLink,
  Crown, Flame, Zap, Sparkles, Music2, Disc3,
  Share2, Users, UserPlus, Bell, Bookmark, Flag,
  Clock, Map, Navigation, Ticket, BadgeCheck, Megaphone,
  type LucideIcon,
} from "lucide-react";

export interface IconOption {
  value: string;
  label: string;
  icon: LucideIcon;
  category: string;
}

export const iconOptions: IconOption[] = [
  // General
  { value: "link", label: "Link", icon: Link2, category: "General" },
  { value: "website", label: "Website", icon: Globe, category: "General" },
  { value: "email", label: "Email", icon: Mail, category: "General" },
  { value: "phone", label: "Phone", icon: Phone, category: "General" },
  { value: "location", label: "Location", icon: MapPin, category: "General" },
  { value: "qrcode", label: "QR Code", icon: QrCode, category: "General" },
  { value: "download", label: "Download", icon: Download, category: "General" },
  { value: "external", label: "External Link", icon: ExternalLink, category: "General" },
  { value: "share", label: "Share", icon: Share2, category: "General" },

  // Social Media
  { value: "instagram", label: "Instagram", icon: Instagram, category: "Social" },
  { value: "twitter", label: "Twitter/X", icon: Twitter, category: "Social" },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin, category: "Social" },
  { value: "facebook", label: "Facebook", icon: Facebook, category: "Social" },
  { value: "youtube", label: "YouTube", icon: Youtube, category: "Social" },
  { value: "tiktok", label: "TikTok", icon: Music, category: "Social" },
  { value: "twitch", label: "Twitch", icon: Twitch, category: "Social" },
  { value: "github", label: "GitHub", icon: Github, category: "Social" },
  { value: "threads", label: "Threads", icon: AtSign, category: "Social" },
  { value: "discord", label: "Discord", icon: Gamepad2, category: "Social" },
  { value: "reddit", label: "Reddit", icon: Hash, category: "Social" },
  { value: "pinterest", label: "Pinterest", icon: Heart, category: "Social" },
  { value: "snapchat", label: "Snapchat", icon: Camera, category: "Social" },

  // Messaging
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle, category: "Messaging" },
  { value: "telegram", label: "Telegram", icon: Send, category: "Messaging" },
  { value: "signal", label: "Signal", icon: Wifi, category: "Messaging" },

  // Content & Media
  { value: "podcast", label: "Podcast", icon: Podcast, category: "Content" },
  { value: "spotify", label: "Spotify", icon: Music2, category: "Content" },
  { value: "apple-music", label: "Apple Music", icon: Disc3, category: "Content" },
  { value: "soundcloud", label: "SoundCloud", icon: Headphones, category: "Content" },
  { value: "video", label: "Video", icon: Video, category: "Content" },
  { value: "play", label: "Play", icon: Play, category: "Content" },
  { value: "rss", label: "RSS Feed", icon: Rss, category: "Content" },
  { value: "blog", label: "Blog", icon: FileText, category: "Content" },
  { value: "newsletter", label: "Newsletter", icon: Newspaper, category: "Content" },
  { value: "radio", label: "Radio", icon: Radio, category: "Content" },
  { value: "tv", label: "TV / Stream", icon: Tv, category: "Content" },
  { value: "mic", label: "Microphone", icon: Mic, category: "Content" },

  // Business & Commerce
  { value: "shop", label: "Shop", icon: ShoppingBag, category: "Business" },
  { value: "store", label: "Store", icon: Store, category: "Business" },
  { value: "payment", label: "Payment", icon: CreditCard, category: "Business" },
  { value: "donate", label: "Donate", icon: DollarSign, category: "Business" },
  { value: "tip", label: "Tip Jar", icon: Coffee, category: "Business" },
  { value: "gift", label: "Gift / Merch", icon: Gift, category: "Business" },
  { value: "calendar", label: "Book / Calendar", icon: Calendar, category: "Business" },
  { value: "ticket", label: "Tickets / Events", icon: Ticket, category: "Business" },
  { value: "briefcase", label: "Portfolio", icon: Briefcase, category: "Business" },
  { value: "megaphone", label: "Promo", icon: Megaphone, category: "Business" },

  // Creative
  { value: "palette", label: "Art / Design", icon: Palette, category: "Creative" },
  { value: "pen", label: "Writing", icon: Pen, category: "Creative" },
  { value: "camera", label: "Photography", icon: Camera, category: "Creative" },
  { value: "monitor", label: "Desktop / App", icon: Monitor, category: "Creative" },
  { value: "smartphone", label: "Mobile App", icon: Smartphone, category: "Creative" },
  { value: "gaming", label: "Gaming", icon: Gamepad2, category: "Creative" },

  // Learning
  { value: "course", label: "Course", icon: GraduationCap, category: "Learning" },
  { value: "ebook", label: "eBook", icon: BookOpen, category: "Learning" },

  // Status & Badges
  { value: "verified", label: "Verified", icon: BadgeCheck, category: "Badges" },
  { value: "crown", label: "Premium", icon: Crown, category: "Badges" },
  { value: "fire", label: "Trending", icon: Flame, category: "Badges" },
  { value: "zap", label: "Flash / New", icon: Zap, category: "Badges" },
  { value: "sparkles", label: "Featured", icon: Sparkles, category: "Badges" },
  { value: "star", label: "Favorite", icon: Star, category: "Badges" },
  { value: "trophy", label: "Achievement", icon: Trophy, category: "Badges" },
  { value: "flag", label: "Flag", icon: Flag, category: "Badges" },

  // Community
  { value: "community", label: "Community", icon: Users, category: "Community" },
  { value: "follow", label: "Follow", icon: UserPlus, category: "Community" },
  { value: "notify", label: "Subscribe", icon: Bell, category: "Community" },
  { value: "bookmark", label: "Save", icon: Bookmark, category: "Community" },
  { value: "map", label: "Map", icon: Map, category: "Community" },
  { value: "navigate", label: "Directions", icon: Navigation, category: "Community" },
  { value: "clock", label: "Hours / Time", icon: Clock, category: "Community" },
];

// Build a lookup map for icon rendering
export const iconMap: Record<string, LucideIcon> = {};
iconOptions.forEach((opt) => {
  iconMap[opt.value] = opt.icon;
});

// Get unique categories in order
export const iconCategories = [...new Set(iconOptions.map((o) => o.category))];
