"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
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
  const [showSoccerTooltip, setShowSoccerTooltip] = useState(false);
  const router = useRouter();
  const { watchlist, downloadQueue } = useUserStore();

  // Show soccer tooltip for first-time visitors
  useEffect(() => {
    const hasSeenSoccerTooltip = localStorage.getItem("xinverse_soccer_tooltip_seen");
    if (!hasSeenSoccerTooltip) {
      setShowSoccerTooltip(true);
    }
  }, []);

  const dismissSoccerTooltip = () => {
    setShowSoccerTooltip(false);
    localStorage.setItem("xinverse_soccer_tooltip_seen", "true");
  };

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
            <div className="relative">
              <Link href="/soccer" onClick={dismissSoccerTooltip}>
                <button className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg hover:shadow-green-500/25 overflow-hidden">
                  <div className="w-6 h-6 relative rounded-full overflow-hidden">
                    <Image
                      src="/soccer-ball.jpg"
                      alt="Soccer"
                      fill
                      className="object-cover"
                      sizes="24px"
                    />
                  </div>
                  <span className="hidden sm:inline pr-1">Soccer</span>
                </button>
              </Link>
              
              {/* Tooltip for first-time visitors */}
              {showSoccerTooltip && (
                <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-card border border-border rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <button 
                    onClick={dismissSoccerTooltip}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <div className="w-5 h-5 relative">
                        <Image src="/soccer-ball.jpg" alt="" fill className="object-cover rounded-full" sizes="20px" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Live Soccer Scores</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Check out live scores and upcoming matches from all major leagues!</p>
                    </div>
                  </div>
                  <div className="absolute -top-2 right-6 w-4 h-4 bg-card border-l border-t border-border rotate-45" />
                </div>
              )}
            </div>

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
