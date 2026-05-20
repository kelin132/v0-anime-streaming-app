"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  ArrowLeft,
  Trophy,
  Play,
  Calendar,
  Clock,
  Globe,
  Video,
} from "lucide-react";

interface League {
  id: string;
  name: string;
  country: string;
  gradient: string;
}

interface Match {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strStatus: string;
  strProgress: string;
  dateEvent: string;
  strTime: string;
  strThumb: string;
  strHomeTeamBadge: string;
  strAwayTeamBadge: string;
  strLeague: string;
  strVenue: string;
}

interface Standing {
  intRank: string;
  strTeam: string;
  strTeamBadge: string;
  intPlayed: string;
  intWin: string;
  intDraw: string;
  intLoss: string;
  intGoalsFor: string;
  intGoalsAgainst: string;
  intGoalDifference: string;
  intPoints: string;
}

interface Highlight {
  title: string;
  embed: string;
  url: string;
  thumbnail: string;
  date: string;
  competition: { name: string };
}

const POPULAR_LEAGUES: League[] = [
  { id: "4328", name: "Premier League", country: "England", gradient: "from-purple-600 to-blue-600" },
  { id: "4335", name: "La Liga", country: "Spain", gradient: "from-orange-500 to-red-600" },
  { id: "4331", name: "Bundesliga", country: "Germany", gradient: "from-red-600 to-red-800" },
  { id: "4332", name: "Serie A", country: "Italy", gradient: "from-blue-600 to-green-600" },
  { id: "4334", name: "Ligue 1", country: "France", gradient: "from-blue-700 to-red-500" },
  { id: "4346", name: "MLS", country: "USA", gradient: "from-blue-500 to-red-500" },
  { id: "4480", name: "Champions League", country: "Europe", gradient: "from-blue-900 to-blue-500" },
  { id: "4481", name: "Europa League", country: "Europe", gradient: "from-orange-500 to-yellow-500" },
];

export default function SoccerPage() {
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [leagueMatches, setLeagueMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<"yesterday" | "today" | "tomorrow">("today");
  const [activeTab, setActiveTab] = useState("matches");

  const getDateString = (day: "yesterday" | "today" | "tomorrow") => {
    const date = new Date();
    if (day === "yesterday") date.setDate(date.getDate() - 1);
    if (day === "tomorrow") date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  // Fetch all worldwide matches on page load
  useEffect(() => {
    fetchAllMatches(selectedDay);
    fetchHighlights();
  }, []);

  const fetchAllMatches = async (day: "yesterday" | "today" | "tomorrow") => {
    setIsLoading(true);
    try {
      const dateStr = getDateString(day);
      const allMatchesData: Match[] = [];

      // Fetch from all leagues in parallel
      const promises = POPULAR_LEAGUES.map(async (league) => {
        try {
          const res = await fetch(
            `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${dateStr}&l=${league.id}`
          );
          const data = await res.json();
          if (data.events && Array.isArray(data.events)) {
            return data.events;
          }
        } catch {
          return [];
        }
        return [];
      });

      const results = await Promise.all(promises);
      results.forEach((matches) => allMatchesData.push(...matches));

      // Sort: live first, then upcoming by time, then finished
      const sorted = allMatchesData.sort((a, b) => {
        const statusA = getMatchStatus(a);
        const statusB = getMatchStatus(b);
        if (statusA !== statusB) {
          const order = { live: 0, upcoming: 1, finished: 2 };
          return order[statusA] - order[statusB];
        }
        return (a.strTime || "").localeCompare(b.strTime || "");
      });

      setAllMatches(sorted);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch matches:", error);
      setAllMatches([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHighlights = async () => {
    try {
      const res = await fetch("https://www.scorebat.com/video-api/v3/feed/?token=MTk1NjBfMTczNDUyMTYwMF81ZjEzMTkwYTQ5ODYzYWMwNTMyMmJjZmFmMDZhZDQzYjg3ZWQwYTJh");
      const data = await res.json();
      if (data.response && Array.isArray(data.response)) {
        setHighlights(data.response.slice(0, 12));
      }
    } catch (error) {
      console.error("Failed to fetch highlights:", error);
    }
  };

  const fetchLeagueData = async (leagueId: string, day: "yesterday" | "today" | "tomorrow") => {
    setIsLoading(true);
    try {
      const dateStr = getDateString(day);

      // Fetch matches
      const matchesRes = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${dateStr}&l=${leagueId}`
      );
      const matchesData = await matchesRes.json();

      if (matchesData.events && Array.isArray(matchesData.events)) {
        const sorted = matchesData.events.sort((a: Match, b: Match) => {
          const statusA = getMatchStatus(a);
          const statusB = getMatchStatus(b);
          const order = { live: 0, upcoming: 1, finished: 2 };
          return order[statusA] - order[statusB];
        });
        setLeagueMatches(sorted);
      } else {
        setLeagueMatches([]);
      }

      // Fetch standings for current season
      const currentYear = new Date().getFullYear();
      const season = `${currentYear - 1}-${currentYear}`;
      const standingsRes = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=${leagueId}&s=${season}`
      );
      const standingsData = await standingsRes.json();
      if (standingsData.table && Array.isArray(standingsData.table)) {
        setStandings(standingsData.table);
      } else {
        setStandings([]);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch league data:", error);
      setLeagueMatches([]);
      setStandings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeagueSelect = (league: League) => {
    setSelectedLeague(league);
    setActiveTab("matches");
    fetchLeagueData(league.id, selectedDay);
  };

  const handleDayChange = (day: "yesterday" | "today" | "tomorrow") => {
    setSelectedDay(day);
    if (selectedLeague) {
      fetchLeagueData(selectedLeague.id, day);
    } else {
      fetchAllMatches(day);
    }
  };

  const handleRefresh = () => {
    if (selectedLeague) {
      fetchLeagueData(selectedLeague.id, selectedDay);
    } else {
      fetchAllMatches(selectedDay);
    }
  };

  const getMatchStatus = (match: Match): "live" | "upcoming" | "finished" => {
    const status = match.strStatus?.toLowerCase() || "";
    const progress = match.strProgress?.toLowerCase() || "";

    if (status.includes("live") || progress.includes("live") || status.includes("in progress") || /^\d+['′]?$/.test(status)) {
      return "live";
    }
    if (status.includes("ft") || status.includes("finished") || status.includes("aet") || status.includes("pen")) {
      return "finished";
    }
    if (match.intHomeScore !== null && match.intAwayScore !== null && status !== "ns" && status !== "") {
      return "finished";
    }
    return "upcoming";
  };

  const matchesToDisplay = selectedLeague ? leagueMatches : allMatches;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-950/30 via-background to-background">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(34, 197, 94) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="container mx-auto px-4 py-8 relative">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 relative">
                <Image
                  src="/soccer-ball.jpg"
                  alt="Soccer"
                  fill
                  className="object-cover rounded-full"
                  sizes="48px"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Live Soccer
                </h1>
                <p className="text-muted-foreground text-sm">
                  Worldwide Matches, Standings & Highlights
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <TabsList className="bg-secondary">
              <TabsTrigger value="matches" className="gap-2">
                <Globe className="w-4 h-4" />
                {selectedLeague ? selectedLeague.name : "All Matches"}
              </TabsTrigger>
              {selectedLeague && (
                <TabsTrigger value="standings" className="gap-2">
                  <Trophy className="w-4 h-4" />
                  Standings
                </TabsTrigger>
              )}
              <TabsTrigger value="highlights" className="gap-2">
                <Video className="w-4 h-4" />
                Highlights
              </TabsTrigger>
              <TabsTrigger value="leagues" className="gap-2">
                <Trophy className="w-4 h-4" />
                Leagues
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Day Selector */}
          <div className="flex items-center gap-2 p-1 bg-secondary/50 rounded-lg w-fit">
            {(["yesterday", "today", "tomorrow"] as const).map((day) => (
              <button
                key={day}
                onClick={() => handleDayChange(day)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                  selectedDay === day
                    ? "bg-green-600 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-4">
            {selectedLeague && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLeague(null)}
                className="gap-2 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to All Matches
              </Button>
            )}

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-card rounded-lg p-4 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="w-24 h-4 bg-secondary rounded" />
                      <div className="w-16 h-6 bg-secondary rounded" />
                      <div className="w-24 h-4 bg-secondary rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : matchesToDisplay.length > 0 ? (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left p-3 font-medium">League</th>
                      <th className="text-left p-3 font-medium">Home</th>
                      <th className="text-center p-3 font-medium w-24">Score</th>
                      <th className="text-right p-3 font-medium">Away</th>
                      <th className="text-center p-3 font-medium w-20">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchesToDisplay.map((match) => {
                      const status = getMatchStatus(match);
                      return (
                        <tr
                          key={match.idEvent}
                          className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${
                            status === "live" ? "bg-green-500/10" : ""
                          }`}
                        >
                          <td className="p-3 text-xs text-muted-foreground max-w-[120px] truncate">
                            {match.strLeague}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {match.strHomeTeamBadge && (
                                <div className="w-6 h-6 relative shrink-0">
                                  <Image
                                    src={match.strHomeTeamBadge}
                                    alt=""
                                    fill
                                    className="object-contain"
                                    sizes="24px"
                                  />
                                </div>
                              )}
                              <span className="font-medium truncate max-w-[150px]">
                                {match.strHomeTeam}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {status === "finished" || status === "live" ? (
                              <span className="font-bold text-lg">
                                {match.intHomeScore ?? 0} - {match.intAwayScore ?? 0}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                {match.strTime?.slice(0, 5) || "TBD"}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <span className="font-medium truncate max-w-[150px]">
                                {match.strAwayTeam}
                              </span>
                              {match.strAwayTeamBadge && (
                                <div className="w-6 h-6 relative shrink-0">
                                  <Image
                                    src={match.strAwayTeamBadge}
                                    alt=""
                                    fill
                                    className="object-contain"
                                    sizes="24px"
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {status === "live" ? (
                              <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse">
                                LIVE
                              </span>
                            ) : status === "finished" ? (
                              <span className="text-xs text-muted-foreground">FT</span>
                            ) : (
                              <span className="text-xs text-blue-400">Upcoming</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No matches scheduled for this day</p>
              </div>
            )}
          </TabsContent>

          {/* Standings Tab */}
          {selectedLeague && (
            <TabsContent value="standings">
              {standings.length > 0 ? (
                <div className="bg-card rounded-xl overflow-hidden border border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-secondary/50">
                          <th className="text-left p-3 font-medium w-12">#</th>
                          <th className="text-left p-3 font-medium">Team</th>
                          <th className="text-center p-3 font-medium">P</th>
                          <th className="text-center p-3 font-medium">W</th>
                          <th className="text-center p-3 font-medium">D</th>
                          <th className="text-center p-3 font-medium">L</th>
                          <th className="text-center p-3 font-medium">GF</th>
                          <th className="text-center p-3 font-medium">GA</th>
                          <th className="text-center p-3 font-medium">GD</th>
                          <th className="text-center p-3 font-medium">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((team, idx) => (
                          <tr
                            key={team.strTeam}
                            className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${
                              idx < 4 ? "bg-green-500/5" : idx >= standings.length - 3 ? "bg-red-500/5" : ""
                            }`}
                          >
                            <td className="p-3 font-bold">{team.intRank}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {team.strTeamBadge && (
                                  <div className="w-6 h-6 relative shrink-0">
                                    <Image
                                      src={team.strTeamBadge}
                                      alt=""
                                      fill
                                      className="object-contain"
                                      sizes="24px"
                                    />
                                  </div>
                                )}
                                <span className="font-medium">{team.strTeam}</span>
                              </div>
                            </td>
                            <td className="p-3 text-center">{team.intPlayed}</td>
                            <td className="p-3 text-center text-green-400">{team.intWin}</td>
                            <td className="p-3 text-center text-yellow-400">{team.intDraw}</td>
                            <td className="p-3 text-center text-red-400">{team.intLoss}</td>
                            <td className="p-3 text-center">{team.intGoalsFor}</td>
                            <td className="p-3 text-center">{team.intGoalsAgainst}</td>
                            <td className="p-3 text-center">
                              {parseInt(team.intGoalDifference) > 0 ? "+" : ""}
                              {team.intGoalDifference}
                            </td>
                            <td className="p-3 text-center font-bold text-primary">{team.intPoints}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No standings available for this league</p>
                </div>
              )}
            </TabsContent>
          )}

          {/* Highlights Tab */}
          <TabsContent value="highlights">
            {highlights.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {highlights.map((highlight, idx) => (
                  <a
                    key={idx}
                    href={highlight.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-card rounded-xl overflow-hidden border border-border hover:border-green-500/50 transition-all"
                  >
                    <div className="relative aspect-video bg-secondary">
                      {highlight.thumbnail ? (
                        <Image
                          src={highlight.thumbnail}
                          alt={highlight.title}
                          fill
                          className="object-cover"
                          sizes="400px"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Video className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-2 group-hover:text-green-400 transition-colors">
                        {highlight.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {highlight.competition?.name || "Football"}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Loading highlights...</p>
              </div>
            )}
          </TabsContent>

          {/* Leagues Tab */}
          <TabsContent value="leagues">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {POPULAR_LEAGUES.map((league) => (
                <button
                  key={league.id}
                  onClick={() => handleLeagueSelect(league)}
                  className="group relative overflow-hidden rounded-xl aspect-square transition-all hover:scale-105 hover:shadow-xl"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${league.gradient}`} />
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="relative w-20 h-20">
                      <Image
                        src="/soccer-ball.jpg"
                        alt={league.name}
                        fill
                        className="object-cover rounded-full drop-shadow-lg"
                        sizes="80px"
                      />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <h3 className="font-semibold text-sm text-white line-clamp-1">
                      {league.name}
                    </h3>
                    <p className="text-xs text-white/70">{league.country}</p>
                  </div>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
