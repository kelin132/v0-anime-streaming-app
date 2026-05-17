"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { RefreshCw, Clock, Trophy, Wifi } from "lucide-react";

interface SoccerMatch {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strLeague: string;
  strLeagueBadge: string;
  strHomeTeamBadge: string;
  strAwayTeamBadge: string;
  strTime: string;
  strTimeLocal: string;
  strStatus: string;
  strVenue: string;
  dateEvent: string;
  strTimestamp: string;
}

export function SoccerLiveScores() {
  const [matches, setMatches] = useState<SoccerMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMatches = async () => {
    try {
      setIsRefreshing(true);
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${today}&s=Soccer`
      );
      const data = await res.json();
      if (data.events && Array.isArray(data.events)) {
        // Sort by time and status (live matches first)
        const sortedMatches = data.events.sort((a: SoccerMatch, b: SoccerMatch) => {
          const statusOrder = (status: string) => {
            if (status === "1H" || status === "2H" || status === "HT") return 0;
            if (status === "Not Started") return 1;
            if (status === "FT" || status === "Match Finished") return 2;
            return 3;
          };
          const orderA = statusOrder(a.strStatus);
          const orderB = statusOrder(b.strStatus);
          if (orderA !== orderB) return orderA - orderB;
          return a.strTimestamp.localeCompare(b.strTimestamp);
        });
        setMatches(sortedMatches.slice(0, 12)); // Show top 12 matches
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch soccer matches:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, []);

  const getMatchStatus = (status: string) => {
    switch (status) {
      case "1H":
        return { text: "1st Half", isLive: true };
      case "2H":
        return { text: "2nd Half", isLive: true };
      case "HT":
        return { text: "Half Time", isLive: true };
      case "FT":
      case "Match Finished":
        return { text: "Full Time", isLive: false };
      case "Not Started":
        return { text: "Upcoming", isLive: false };
      case "Postponed":
        return { text: "Postponed", isLive: false };
      default:
        return { text: status || "Scheduled", isLive: false };
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-cyan-900/40 border border-emerald-500/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 animate-pulse" />
              <div className="h-6 w-48 bg-emerald-500/20 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-xl bg-background/30 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (matches.length === 0) {
    return null;
  }

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-cyan-900/40 border border-emerald-500/20 p-6 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  Live Soccer Scores
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  {lastUpdated && `Updated ${lastUpdated.toLocaleTimeString()}`}
                </p>
              </div>
            </div>
            <button
              onClick={fetchMatches}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Matches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => {
              const status = getMatchStatus(match.strStatus);
              return (
                <div
                  key={match.idEvent}
                  className={`relative rounded-xl p-4 transition-all hover:scale-[1.02] ${
                    status.isLive
                      ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30"
                      : "bg-background/40 border border-border/50"
                  }`}
                >
                  {/* League Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    {match.strLeagueBadge && (
                      <div className="w-5 h-5 relative shrink-0">
                        <Image
                          src={match.strLeagueBadge}
                          alt={match.strLeague}
                          fill
                          className="object-contain"
                          sizes="20px"
                        />
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground truncate">
                      {match.strLeague}
                    </span>
                    {status.isLive && (
                      <span className="ml-auto flex items-center gap-1 text-xs font-medium text-emerald-400">
                        <Wifi className="w-3 h-3" />
                        LIVE
                      </span>
                    )}
                  </div>

                  {/* Teams */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Home Team */}
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      {match.strHomeTeamBadge && (
                        <div className="w-8 h-8 relative shrink-0">
                          <Image
                            src={match.strHomeTeamBadge}
                            alt={match.strHomeTeam}
                            fill
                            className="object-contain"
                            sizes="32px"
                          />
                        </div>
                      )}
                      <span className="text-sm font-medium truncate">
                        {match.strHomeTeam}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-1 shrink-0">
                      {match.intHomeScore !== null && match.intAwayScore !== null ? (
                        <>
                          <span
                            className={`text-lg font-bold ${
                              status.isLive ? "text-emerald-400" : ""
                            }`}
                          >
                            {match.intHomeScore}
                          </span>
                          <span className="text-muted-foreground">-</span>
                          <span
                            className={`text-lg font-bold ${
                              status.isLive ? "text-emerald-400" : ""
                            }`}
                          >
                            {match.intAwayScore}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {formatTime(match.strTimeLocal || match.strTime)}
                        </span>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                      <span className="text-sm font-medium truncate text-right">
                        {match.strAwayTeam}
                      </span>
                      {match.strAwayTeamBadge && (
                        <div className="w-8 h-8 relative shrink-0">
                          <Image
                            src={match.strAwayTeamBadge}
                            alt={match.strAwayTeam}
                            fill
                            className="object-contain"
                            sizes="32px"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        status.isLive
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {status.text}
                    </span>
                    {match.strVenue && (
                      <span className="text-muted-foreground truncate max-w-[120px]">
                        {match.strVenue}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
