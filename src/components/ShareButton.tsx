import { useState } from "react";
import { Share2, Twitter, Facebook, MessageCircle, Link as LinkIcon, Check, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  variant?: "icon" | "full";
}

export default function ShareButton({ title, text, url, variant = "icon" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareText = text || `Check out "${title}" on Nabees Novel Zone`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl });
        return true;
      } catch (e) {
        // user cancelled or failed; fall through to dropdown
      }
    }
    return false;
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const links = [
    { label: "Twitter / X", icon: Twitter, href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` },
    { label: "Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { label: "Telegram", icon: Send, href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
  ];

  const trigger =
    variant === "full" ? (
      <button className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
        <Share2 className="h-4 w-4" /> Share
      </button>
    ) : (
      <button
        aria-label="Share"
        className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted transition-colors"
      >
        <Share2 className="h-4 w-4" />
      </button>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        onClick={async (e) => {
          // Try native share first; if used, prevent dropdown
          const ok = await handleNativeShare();
          if (ok) e.preventDefault();
        }}
      >
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {links.map((l) => (
          <DropdownMenuItem key={l.label} asChild>
            <a href={l.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
              <l.icon className="h-4 w-4" />
              {l.label}
            </a>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={copyLink} className="cursor-pointer">
          {copied ? <Check className="h-4 w-4 text-primary" /> : <LinkIcon className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy link"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
