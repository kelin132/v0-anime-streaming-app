"use client";

import { useState, Suspense, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import {
  Play,
  Download,
  Heart,
  Star,
  Calendar,
  Clock,
  Film,
  Tv,
  ExternalLink,
  Loader2,
  Share2,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getItemDetails, getRecommendations, type MediaItem } from "@/lib/api";
import { useUserStore } from "@/lib/store";
import { MediaCarousel } from "@/components/media-carousel";
import { EpisodeSelector } from "@/components/episode-selector";
import { DownloadModal } from "@/components/download-modal";
import { RatingStars } from "@/components/rating-stars";
import { StreamingLinks } from "@/components/streaming-links";

interface WatchPageProps {
  params: Promise<{ id: string }>;
}

function WatchContent({ params }: WatchPageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const type = parseInt(searchParams.get("type") || "1");

  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  const { isInWatchlist, addToWatchlist, removeFromWatchlist, getRating } =
    useUserStore();

  const { data: item, isLoading } = useSWR<MediaItem | null>(
    ["item", id, type],
    () => getItemDetails(id, type),
    { revalidateOnFocus: false }
  );

  const { data: recommendations } = useSWR(
    item ? ["recommendations", id, type] : null,
    () => getRecommendations(id, type),
    { revalidateOnFocus: false }
  );

  const inWatchlist = item ? isInWatchlist(item.id) : false;
  const userRating = item ? getRating(item.id) : null;

  const handleWatchlistToggle = () => {
    if (!item) return;
    if (inWatchlist) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist(item);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: item?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Content Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The requested content could not be loaded.
          </p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isSeries = item.type === 2;
  const TypeIcon = isSeries ? Tv : Film;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative">
        {/* Background */}
        <div className="absolute inset-0 h-[60vh] sm:h-[70vh]">
          {item.backdrop || item.poster ? (
            <Image
              src={item.backdrop || item.poster}
              alt={item.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-background" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        </div>

        {/* Back Button */}
        <div className="relative container mx-auto px-4 pt-4">
          <Link href="/browse">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4 pt-20 pb-8 sm:pt-32">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="shrink-0 mx-auto md:mx-0">
              <div className="relative w-48 sm:w-64 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
                {item.poster ? (
                  <Image
                    src={item.poster}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="256px"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <TypeIcon className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              {/* Type badge & metadata */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase">
                  {isSeries ? "Series" : "Movie"}
                </span>
                {item.rating && item.rating > 0 && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{item.rating.toFixed(1)}</span>
                  </div>
                )}
                {item.year && (
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Calendar className="w-4 h-4" />
                    {item.year}
                  </div>
                )}
                {isSeries && item.seasons && (
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    {item.seasons.length} Season{item.seasons.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">
                {item.title}
              </h1>

              {/* Genres */}
              {item.genre && item.genre.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.genre.map((g) => (
                    <Link
                      key={g}
                      href={`/browse?genre=${encodeURIComponent(g)}`}
                    >
                      <span className="px-3 py-1 rounded-full bg-secondary/80 hover:bg-secondary text-secondary-foreground text-sm transition-colors">
                        {g}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Synopsis */}
              {item.synopsis && (
                <p className="text-muted-foreground max-w-2xl leading-relaxed">
                  {item.synopsis}
                </p>
              )}

              {/* User Rating */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Your Rating:</span>
                <RatingStars itemId={item.id} itemTitle={item.title} />
                {userRating && (
                  <span className="text-sm text-primary">{userRating}/5</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                {item.trailer && (
                  <a href={item.trailer} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="gap-2">
                      <Play className="w-5 h-5 fill-current" />
                      Watch Trailer
                    </Button>
                  </a>
                )}

                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2"
                  onClick={() => setDownloadModalOpen(true)}
                >
                  <Download className="w-5 h-5" />
                  Download
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2"
                  onClick={handleWatchlistToggle}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      inWatchlist ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                  {inWatchlist ? "In Watchlist" : "Add to List"}
                </Button>

                <Button
                  size="lg"
                  variant="ghost"
                  className="gap-2"
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue={isSeries ? "episodes" : "streaming"} className="space-y-6">
          <TabsList className="bg-secondary">
            {isSeries && <TabsTrigger value="episodes">Episodes</TabsTrigger>}
            <TabsTrigger value="streaming">Where to Watch</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          {/* Episodes Tab (Series Only) */}
          {isSeries && (
            <TabsContent value="episodes" className="space-y-6">
              {item.seasons && item.seasons.length > 0 ? (
                <EpisodeSelector
                  seasons={item.seasons}
                  title={item.title}
                  mediaId={item.id}
                  downloadLinks={item.downloadLinks}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Tv className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Episode information not available</p>
                </div>
              )}
            </TabsContent>
          )}

          {/* Streaming Tab */}
          <TabsContent value="streaming" className="space-y-6">
            <StreamingLinks services={item.streamingServices} title={item.title} />
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-card border border-border">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Type
                </h4>
                <p className="flex items-center gap-2">
                  <TypeIcon className="w-4 h-4 text-primary" />
                  {isSeries ? "TV Series" : "Movie"}
                </p>
              </div>
              {item.year && (
                <div className="p-4 rounded-lg bg-card border border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Release Year
                  </h4>
                  <p>{item.year}</p>
                </div>
              )}
              {item.rating && item.rating > 0 && (
                <div className="p-4 rounded-lg bg-card border border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Rating
                  </h4>
                  <p className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {item.rating.toFixed(1)} / 10
                  </p>
                </div>
              )}
              {isSeries && item.seasons && (
                <div className="p-4 rounded-lg bg-card border border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Seasons
                  </h4>
                  <p>{item.seasons.length}</p>
                </div>
              )}
              {item.genre && item.genre.length > 0 && (
                <div className="p-4 rounded-lg bg-card border border-border sm:col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Genres
                  </h4>
                  <p>{item.genre.join(", ")}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <MediaCarousel
            title="You May Also Like"
            items={recommendations}
            size="md"
          />
        </div>
      )}

      {/* Download Modal */}
      <DownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        title={item.title}
        mediaId={item.id}
        type="movie"
        downloadLinks={item.downloadLinks || []}
      />
    </div>
  );
}

export default function WatchPage(props: WatchPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      }
    >
      <WatchContent {...props} />
    </Suspense>
  );
}
