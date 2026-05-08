"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { getTrending, searchMedia, getHotMoviesSeries } from "@/lib/api";
import { MediaCard } from "@/components/media-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter,
  Grid,
  LayoutList,
  Loader2,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { MediaItem } from "@/lib/api";

const GENRES = [
  "All Genres",
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
];

const YEARS = [
  "All Years",
  "2026",
  "2025",
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
  "2019",
  "2018",
  "2010s",
  "2000s",
  "1990s",
  "Classic",
];

const TYPES = [
  { value: "all", label: "All Types" },
  { value: "movie", label: "Movies" },
  { value: "series", label: "Series" },
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialType = searchParams.get("type") || "all";
  const initialGenre = searchParams.get("genre") || "All Genres";
  const initialYear = searchParams.get("year") || "All Years";
  
  const [type, setType] = useState(initialType);
  const [genre, setGenre] = useState(initialGenre);
  const [year, setYear] = useState(initialYear);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [allItems, setAllItems] = useState<MediaItem[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data
  const { data: trendingData, isLoading: trendingLoading } = useSWR(
    ["trending", type, page],
    () => getTrending(type, page),
    { revalidateOnFocus: false }
  );

  const { data: hotData } = useSWR(
    "hot-browse",
    getHotMoviesSeries,
    { revalidateOnFocus: false }
  );

  // Combine and filter items
  useEffect(() => {
    const hotMovies = hotData?.movies || [];
    const hotSeries = hotData?.series || [];
    const items = [...(trendingData || []), ...hotMovies, ...hotSeries];
    
    // Remove duplicates
    const uniqueItems = items.reduce((acc: MediaItem[], item) => {
      if (!acc.find((i) => i.id === item.id)) {
        acc.push(item);
      }
      return acc;
    }, []);

    // Apply filters
    let filtered = uniqueItems;

    if (type !== "all") {
      const typeNum = type === "movie" ? 1 : 2;
      filtered = filtered.filter((item) => item.type === typeNum);
    }

    if (genre !== "All Genres") {
      filtered = filtered.filter((item) =>
        item.genre?.some((g) => g.toLowerCase().includes(genre.toLowerCase()))
      );
    }

    if (year !== "All Years") {
      filtered = filtered.filter((item) => {
        if (!item.year) return false;
        if (year === "2010s") return item.year >= "2010" && item.year < "2020";
        if (year === "2000s") return item.year >= "2000" && item.year < "2010";
        if (year === "1990s") return item.year >= "1990" && item.year < "2000";
        if (year === "Classic") return parseInt(item.year) < 1990;
        return item.year === year;
      });
    }

    setAllItems(filtered);
  }, [trendingData, hotData, type, genre, year]);

  // Update URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (genre !== "All Genres") params.set("genre", genre);
    if (year !== "All Years") params.set("year", year);
    
    const queryString = params.toString();
    router.replace(`/browse${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [type, genre, year, router]);

  const clearFilters = () => {
    setType("all");
    setGenre("All Genres");
    setYear("All Years");
    setPage(1);
  };

  const hasActiveFilters = type !== "all" || genre !== "All Genres" || year !== "All Years";
  const isLoading = trendingLoading;

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Browse</h1>
          <p className="text-muted-foreground mt-1">
            Discover your next favorite {type === "movie" ? "movie" : type === "series" ? "series" : "content"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-none"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-none"
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile Filter Toggle */}
          <Button
            variant="secondary"
            className="sm:hidden gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className={`${showFilters ? "block" : "hidden"} sm:block mb-8`}>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 p-4 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="w-4 h-4" />
            Filters:
          </div>

          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              {GENRES.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={clearFilters}
            >
              <X className="w-4 h-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {allItems.length} result{allItems.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && allItems.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* No Results */}
      {!isLoading && allItems.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search terms
          </p>
          <Button onClick={clearFilters} variant="secondary">
            Clear Filters
          </Button>
        </div>
      )}

      {/* Results Grid */}
      {allItems.length > 0 && (
        <>
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                : "flex flex-col gap-4"
            }
          >
            {allItems.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                size={viewMode === "grid" ? "md" : "lg"}
              />
            ))}
          </div>

          {/* Load More */}
          <div className="flex justify-center mt-8">
            <Button
              variant="secondary"
              size="lg"
              onClick={loadMore}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Load More
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}
