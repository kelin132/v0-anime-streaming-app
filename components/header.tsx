"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Menu,
  X,
  Film,
  Tv,
  Heart,
  Download,
  Home,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/store";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { watchlist, downloadQueue } = useUserStore();

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery("");
        setIsMenuOpen(false);
      }
    },
    [searchQuery, router]
  );

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/browse", label: "Browse", icon: TrendingUp },
    { href: "/browse?type=movie", label: "Movies", icon: Film },
    { href: "/browse?type=series", label: "Series", icon: Tv },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg overflow-hidden relative bg-primary">
              <Image
                src="/logo.jpg"
                alt="Xinverse"
                fill
                className="object-cover"
                priority
                sizes="36px"
              />
            </div>
            <span className="font-bold text-xl hidden sm:block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Xinverse
            </span>
          </Link>

          {/* Search Bar - Prominent Center Position */}
          <form
            onSubmit={handleSearch}
            className="hidden sm:flex flex-1 max-w-xl"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search movies, series, anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-full bg-secondary/80 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </form>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
                    <link.icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{link.label}</span>
                  </Button>
                </Link>
              ))}
            </nav>

            <Link href="/watchlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="w-5 h-5" />
                {watchlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {watchlist.length}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/downloads">
              <Button variant="ghost" size="icon" className="relative">
                <Download className="w-5 h-5" />
                {downloadQueue.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
                    {downloadQueue.length}
                  </span>
                )}
              </Button>
            </Link>

            {/* Soccer Button */}
            <Link href="/soccer">
              <button className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg hover:shadow-green-500/25">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2l1.5 4.5L17 5l-1 4 4 1-4.5 1.5L17 15l-4-1-1 4.5L10.5 15 7 17l1-4-4.5-1.5L7 10l-1-4 4.5 1.5L12 2z" fill="white" stroke="none" />
                  <circle cx="12" cy="12" r="3" fill="white" />
                </svg>
                <span className="hidden sm:inline">Soccer</span>
              </button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search movies, series, anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-full bg-secondary/80 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </form>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
