"use client";

import useSWR from "swr";
import { getHomepage, getTrending, getHotMoviesSeries, getPopularSearches } from "@/lib/api";
import { HeroBanner } from "@/components/hero-banner";
import { MediaCarousel } from "@/components/media-carousel";
import { Search, TrendingUp, Flame, Film, Tv, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { data: homepage, isLoading: homepageLoading } = useSWR(
    "homepage",
    getHomepage,
    { revalidateOnFocus: false }
  );

  const { data: trending, isLoading: trendingLoading } = useSWR(
    "trending",
    () => getTrending("all", 1),
    { revalidateOnFocus: false }
  );

  const { data: hotContent, isLoading: hotLoading } = useSWR(
    "hot-movies",
    getHotMoviesSeries,
    { revalidateOnFocus: false }
  );

  const { data: popularSearches } = useSWR(
    "popular-searches",
    getPopularSearches,
    { revalidateOnFocus: false }
  );

  const isLoading = homepageLoading || trendingLoading || hotLoading;

  // Get hero items from banners or trending
  const heroItems = [
    ...(homepage?.banners?.map(b => b.subject).filter(Boolean) || []),
    ...(trending?.slice(0, 5) || []),
  ].slice(0, 5);

  const trendingItems = trending || [];
  const hotMovies = hotContent?.movies || [];
  const hotSeries = hotContent?.series || [];

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <HeroBanner items={heroItems} isLoading={isLoading && heroItems.length === 0} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Popular Searches */}
        {popularSearches && popularSearches.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Popular Searches</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularSearches.slice(0, 12).map((term, index) => (
                <Link key={index} href={`/search?q=${encodeURIComponent(term)}`}>
                  <Button variant="secondary" size="sm" className="rounded-full">
                    {term}
                  </Button>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Loading State */}
        {isLoading && trendingItems.length === 0 && hotMovies.length === 0 && (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-8 w-48 bg-secondary rounded animate-pulse" />
                <div className="flex gap-4 overflow-hidden">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <div
                      key={j}
                      className="w-44 aspect-[2/3] bg-secondary rounded-lg shrink-0 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trending Section */}
        {trendingItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                What&apos;s Hot
              </span>
            </div>
            <MediaCarousel title="Trending Now" items={trendingItems} size="md" />
          </div>
        )}

        {/* Hot Movies */}
        {hotMovies.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-accent" />
              <span className="text-xs font-medium text-accent uppercase tracking-wider">
                Must Watch
              </span>
            </div>
            <MediaCarousel title="Hot Movies" items={hotMovies} size="lg" />
          </div>
        )}

        {/* Hot Series */}
        {hotSeries.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                Binge-Worthy
              </span>
            </div>
            <MediaCarousel title="Hot Series" items={hotSeries} size="lg" />
          </div>
        )}

        {/* More Trending */}
        {trendingItems.length > 8 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-xs font-medium text-yellow-400 uppercase tracking-wider">
                Discover More
              </span>
            </div>
            <MediaCarousel
              title="More to Explore"
              items={trendingItems.slice(8)}
              size="sm"
            />
          </div>
        )}

        {/* Browse All CTA */}
        <section className="text-center py-8">
          <Link href="/browse">
            <Button size="lg" className="px-8">
              Browse All Content
            </Button>
          </Link>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-lg">Xinverse</h3>
              <p className="text-sm text-muted-foreground">
                Your ultimate destination for anime, movies &amp; series
              </p>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="/browse" className="hover:text-foreground transition-colors">
                Browse
              </Link>
              <Link href="/watchlist" className="hover:text-foreground transition-colors">
                Watchlist
              </Link>
              <Link href="/downloads" className="hover:text-foreground transition-colors">
                Downloads
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
