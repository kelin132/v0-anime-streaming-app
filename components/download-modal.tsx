"use client";

import { useState } from "react";
import {
  Download,
  Check,
  X,
  HardDrive,
  Zap,
  Film,
  Tv,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserStore } from "@/lib/store";
import type { DownloadLink, Episode } from "@/lib/api";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mediaId: string;
  type: "movie" | "episode";
  downloadLinks: DownloadLink[];
  episodes?: Episode[];
  seasonNumber?: number;
  episodeNumber?: number;
  isBulkDownload?: boolean;
}

export function DownloadModal({
  isOpen,
  onClose,
  title,
  mediaId,
  type,
  downloadLinks,
  episodes,
  seasonNumber,
  episodeNumber,
  isBulkDownload = false,
}: DownloadModalProps) {
  const [selectedQuality, setSelectedQuality] = useState<string>("");
  const [selectedEpisodes, setSelectedEpisodes] = useState<Set<string>>(new Set());
  const { addToDownloadQueue, addBulkToDownloadQueue } = useUserStore();

  const qualityOptions = downloadLinks.length > 0 
    ? downloadLinks 
    : [
        { quality: "4K", size: "~8GB", url: "#" },
        { quality: "1080p", size: "~4GB", url: "#" },
        { quality: "720p", size: "~2GB", url: "#" },
        { quality: "480p", size: "~1GB", url: "#" },
      ];

  const handleEpisodeToggle = (episodeId: string) => {
    const newSelected = new Set(selectedEpisodes);
    if (newSelected.has(episodeId)) {
      newSelected.delete(episodeId);
    } else {
      newSelected.add(episodeId);
    }
    setSelectedEpisodes(newSelected);
  };

  const handleSelectAll = () => {
    if (episodes) {
      if (selectedEpisodes.size === episodes.length) {
        setSelectedEpisodes(new Set());
      } else {
        setSelectedEpisodes(new Set(episodes.map((ep) => ep.id)));
      }
    }
  };

  const handleDownload = () => {
    if (!selectedQuality) return;

    const link = qualityOptions.find((l) => l.quality === selectedQuality);
    if (!link) return;

    if (isBulkDownload && episodes) {
      const items = episodes
        .filter((ep) => selectedEpisodes.has(ep.id))
        .map((ep) => ({
          id: `${mediaId}-${ep.id}`,
          title: `${title} - S${ep.seasonNumber || 1}E${ep.episodeNumber}`,
          quality: selectedQuality,
          url: ep.downloadLinks?.[0]?.url || link.url,
          type: "episode" as const,
          seasonNumber: ep.seasonNumber,
          episodeNumber: ep.episodeNumber,
        }));
      addBulkToDownloadQueue(items);
    } else {
      addToDownloadQueue({
        id: `${mediaId}-${Date.now()}`,
        title: type === "episode" 
          ? `${title} - S${seasonNumber}E${episodeNumber}` 
          : title,
        quality: selectedQuality,
        url: link.url,
        type,
        seasonNumber,
        episodeNumber,
      });
    }

    // Trigger download
    if (link.url && link.url !== "#") {
      window.open(link.url, "_blank");
    }

    onClose();
    setSelectedQuality("");
    setSelectedEpisodes(new Set());
  };

  const getQualityIcon = (quality: string) => {
    if (quality.includes("4K") || quality.includes("2160")) return <Zap className="w-4 h-4 text-yellow-400" />;
    if (quality.includes("1080")) return <HardDrive className="w-4 h-4 text-green-400" />;
    return <HardDrive className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            {isBulkDownload ? "Bulk Download" : "Download"}
          </DialogTitle>
          <DialogDescription className="line-clamp-1">
            {title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Bulk Episode Selection */}
          {isBulkDownload && episodes && episodes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Select Episodes</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-8"
                >
                  {selectedEpisodes.size === episodes.length ? (
                    <>
                      <X className="w-4 h-4 mr-1" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Select All ({episodes.length})
                    </>
                  )}
                </Button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded-lg p-3 bg-secondary/30">
                {episodes.map((ep) => (
                  <label
                    key={ep.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedEpisodes.has(ep.id)}
                      onCheckedChange={() => handleEpisodeToggle(ep.id)}
                    />
                    <Tv className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        Episode {ep.episodeNumber}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {ep.title}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedEpisodes.size} episode{selectedEpisodes.size !== 1 ? "s" : ""} selected
              </p>
            </div>
          )}

          {/* Quality Selection */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Select Quality</h4>
            <div className="grid grid-cols-2 gap-2">
              {qualityOptions.map((option) => (
                <button
                  key={option.quality}
                  onClick={() => setSelectedQuality(option.quality)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    selectedQuality === option.quality
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {getQualityIcon(option.quality)}
                    <span className="font-medium text-sm">{option.quality}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{option.size}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Download Button */}
          <Button
            className="w-full gap-2"
            size="lg"
            disabled={!selectedQuality || (isBulkDownload && selectedEpisodes.size === 0)}
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
            {isBulkDownload
              ? `Download ${selectedEpisodes.size} Episode${selectedEpisodes.size !== 1 ? "s" : ""}`
              : "Download Now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
