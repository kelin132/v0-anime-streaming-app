"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { searchMedia, getPopularSearches } from "@/lib/api";
import { MediaCard } from "@/components/media-card";
import { Button } from "@/components/ui/button";
import { Loader2, Search, TrendingUp } from "lucide-react";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data: results, isLoading } = useSWR(
    query ? ["search", query] : null,
    () => searchMedia(query, "ALL", 1, 48),
    { revalidateOnFocus: false }
  );

  const { data: popularSearches } = useSWR(
    "popular-searches",
    getPopularSearches,
    { revalidateOnFocus: false }
  );

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Search</h1>
          <p className="text-muted-foreground mb-8">
            Enter a search term to find anime, movies, and series
          </p>

          {popularSearches && popularSearches.length > 0 && (
            <div className="max-w-xl mx-auto">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                <TrendingUp className="w-4 h-4" />
                Popular Searches
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {popularSearches.slice(0, 12).map((term, index) => (
                  <Link key={index} href={`/search?q=${encodeURIComponent(term)}`}>
                    <Button variant="secondary" size="sm" className="rounded-full">
                      {term}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Search Results</h1>
        <p className="text-muted-foreground mt-1">
          {isLoading
            ? "Searching..."
            : `${results?.items.length || 0} results for "${query}"`}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* No Results */}
      {!isLoading && results?.items.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground mb-6">
            Try a different search term
          </p>

          {popularSearches && popularSearches.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-3">Try searching for:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularSearches.slice(0, 6).map((term, index) => (
                  <Link key={index} href={`/search?q=${encodeURIComponent(term)}`}>
                    <Button variant="secondary" size="sm" className="rounded-full">
                      {term}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Grid */}
      {results && results.items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.items.map((item) => (
            <MediaCard key={item.id} item={item} size="md" />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
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
      <SearchContent />
    </Suspense>
  );
}
