"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Check,
  X,
  HardDrive,
  Zap,
  Tv,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserStore } from "@/lib/store";
import { getMediaStreaming } from "@/lib/api";
import type { DownloadLink, Episode, Season } from "@/lib/api";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mediaId: string;
  detailPath: string;
  type: "movie" | "episode";
  seasons?: Season[];
  downloadLinks?: DownloadLink[];
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
  detailPath,
  type,
  seasons,
  downloadLinks: initialDownloadLinks = [],
  episodes,
  seasonNumber,
  episodeNumber,
  isBulkDownload = false,
}: DownloadModalProps) {
  const [selectedQuality, setSelectedQuality] = useState<string>("");
  const [selectedEpisodes, setSelectedEpisodes] = useState<Set<string>>(
    new Set(episodes?.map((ep) => ep.id) || [])
  );
  const [selectedSeason, setSelectedSeason] = useState(seasonNumber || 1);
  const [selectedEpisodeNum, setSelectedEpisodeNum] = useState(episodeNumber || 1);
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>(initialDownloadLinks);
  const [isLoading, setIsLoading] = useState(false);
  const { addToDownloadQueue, addBulkToDownloadQueue } = useUserStore();

  const currentSeason = seasons?.find((s) => s.seasonNumber === selectedSeason);
  const availableEpisodes = currentSeason?.episodes || episodes || [];

  // Fetch download links when modal opens or selection changes
  useEffect(() => {
    if (!isOpen || !detailPath) return;

    const fetchDownloads = async () => {
      if (isBulkDownload) return; // Don't fetch for bulk, we'll fetch per episode on download
      
      setIsLoading(true);
      try {
        const mediaData = await getMediaStreaming(
          mediaId,
          detailPath,
          type === "episode" ? selectedSeason : undefined,
          type === "episode" ? selectedEpisodeNum : undefined
        );
        if (mediaData.downloads.length > 0) {
          setDownloadLinks(mediaData.downloads);
        }
      } catch (error) {
        console.error("Failed to fetch download links:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDownloads();
  }, [isOpen, mediaId, detailPath, type, selectedSeason, selectedEpisodeNum, isBulkDownload]);

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
    if (selectedEpisodes.size === availableEpisodes.length) {
      setSelectedEpisodes(new Set());
    } else {
      setSelectedEpisodes(new Set(availableEpisodes.map((ep) => ep.id)));
    }
  };

  const handleDownload = async () => {
    if (!selectedQuality) return;

    const link = downloadLinks.find((l) => l.quality === selectedQuality);
    
    if (isBulkDownload) {
      // Bulk download - fetch each episode's download link
      setIsLoading(true);
      const downloadItems: { url: string; title: string }[] = [];
      
      for (const ep of availableEpisodes.filter((ep) => selectedEpisodes.has(ep.id))) {
        try {
          const mediaData = await getMediaStreaming(
            mediaId,
            detailPath,
            selectedSeason,
            ep.episodeNumber
          );
          const qualityLink = mediaData.downloads.find(
            (d) => d.quality === selectedQuality
          );
          if (qualityLink?.downloadUrl || qualityLink?.url) {
            downloadItems.push({
              url: qualityLink.downloadUrl || qualityLink.url,
              title: `${title} - S${selectedSeason}E${ep.episodeNumber}`,
            });
          }
        } catch (error) {
          console.error(`Failed to get download for episode ${ep.episodeNumber}:`, error);
        }
      }

      // Add to queue
      addBulkToDownloadQueue(
        downloadItems.map((item, idx) => ({
          id: `${mediaId}-bulk-${idx}-${Date.now()}`,
          title: item.title,
          quality: selectedQuality,
          url: item.url,
          type: "episode" as const,
          seasonNumber: selectedSeason,
          episodeNumber: idx + 1,
        }))
      );

      // Open download links
      downloadItems.forEach((item, idx) => {
        setTimeout(() => {
          window.open(item.url, "_blank");
        }, idx * 1000); // Stagger downloads by 1 second
      });

      setIsLoading(false);
    } else {
      // Single download
      if (link) {
        addToDownloadQueue({
          id: `${mediaId}-${Date.now()}`,
          title:
            type === "episode"
              ? `${title} - S${selectedSeason}E${selectedEpisodeNum}`
              : title,
          quality: selectedQuality,
          url: link.downloadUrl || link.url,
          type,
          seasonNumber: selectedSeason,
          episodeNumber: selectedEpisodeNum,
        });

        if (link.downloadUrl || link.url) {
          window.open(link.downloadUrl || link.url, "_blank");
        }
      }
    }

    onClose();
    setSelectedQuality("");
    setSelectedEpisodes(new Set());
  };

  const getQualityIcon = (quality: string) => {
    if (quality.includes("4K") || quality.includes("2160"))
      return <Zap className="w-4 h-4 text-yellow-400" />;
    if (quality.includes("1080"))
      return <HardDrive className="w-4 h-4 text-green-400" />;
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
          <DialogDescription className="line-clamp-1">{title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Season & Episode Selection for Series */}
          {type === "episode" && seasons && seasons.length > 0 && !isBulkDownload && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Select Episode</h4>
              <div className="flex gap-3">
                <Select
                  value={selectedSeason.toString()}
                  onValueChange={(val) => {
                    setSelectedSeason(parseInt(val));
                    setSelectedEpisodeNum(1);
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Season" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem
                        key={season.seasonNumber}
                        value={season.seasonNumber.toString()}
                      >
                        Season {season.seasonNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedEpisodeNum.toString()}
                  onValueChange={(val) => setSelectedEpisodeNum(parseInt(val))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Episode" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentSeason?.episodes.map((ep) => (
                      <SelectItem
                        key={ep.id}
                        value={ep.episodeNumber.toString()}
                      >
                        Episode {ep.episodeNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Bulk Episode Selection */}
          {isBulkDownload && availableEpisodes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Select Episodes</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-8"
                >
                  {selectedEpisodes.size === availableEpisodes.length ? (
                    <>
                      <X className="w-4 h-4 mr-1" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Select All ({availableEpisodes.length})
                    </>
                  )}
                </Button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded-lg p-3 bg-secondary/30">
                {availableEpisodes.map((ep) => (
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
                {selectedEpisodes.size} episode
                {selectedEpisodes.size !== 1 ? "s" : ""} selected
              </p>
            </div>
          )}

          {/* Quality Selection */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Select Quality</h4>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading available qualities...
                </span>
              </div>
            ) : downloadLinks.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {downloadLinks.map((option) => (
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
                    <span className="text-xs text-muted-foreground">
                      {option.size}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No download links available. Try a different episode or quality.
              </p>
            )}
          </div>

          {/* Download Button */}
          <button
            className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full font-medium text-white transition-all shadow-lg ${
              !selectedQuality || isLoading || (isBulkDownload && selectedEpisodes.size === 0)
                ? "bg-gray-500 cursor-not-allowed opacity-50"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/25 hover:shadow-emerald-500/40"
            }`}
            disabled={
              !selectedQuality ||
              isLoading ||
              (isBulkDownload && selectedEpisodes.size === 0)
            }
            onClick={handleDownload}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isBulkDownload
              ? `Download ${selectedEpisodes.size} Episode${selectedEpisodes.size !== 1 ? "s" : ""}`
              : "Download Now"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
