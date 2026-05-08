const API_KEY = "Godszeal";
const BASE_URL = "https://api.cinemind.name.ng/api";

export interface MediaItem {
  id: string;
  title: string;
  poster: string;
  backdrop?: string;
  year?: string;
  rating?: number;
  type: number; // 1 = movie, 2 = series
  genre?: string[];
  synopsis?: string;
  trailer?: string;
  seasons?: Season[];
  episodes?: Episode[];
  downloadLinks?: DownloadLink[];
  streamingServices?: StreamingService[];
  country?: string;
  subtitles?: string;
  detailPath?: string;
}

export interface Season {
  seasonNumber: number;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  episodeNumber: number;
  seasonNumber?: number;
  title: string;
  synopsis?: string;
  thumbnail?: string;
  downloadLinks?: DownloadLink[];
}

export interface DownloadLink {
  quality: string;
  size: string;
  url: string;
}

export interface StreamingService {
  name: string;
  url: string;
  logo: string;
}

export interface HomepageData {
  featured: MediaItem[];
  trending: MediaItem[];
  newReleases: MediaItem[];
  topRated: MediaItem[];
  banners: BannerItem[];
}

export interface BannerItem {
  id: string;
  title: string;
  image: string;
  subjectId: string;
  subjectType: number;
  subject?: MediaItem;
}

export interface SearchResult {
  items: MediaItem[];
  totalPages: number;
  currentPage: number;
}

// Transform API response to our MediaItem format
function transformMediaItem(item: any): MediaItem {
  if (!item) return null as any;
  
  const cover = item.cover || {};
  
  return {
    id: item.subjectId?.toString() || item.id?.toString() || "",
    title: item.title || item.name || item.subjectTitle || "",
    poster: cover.url || item.coverVerticalUrl || item.poster || item.image || "",
    backdrop: item.backdrop || item.coverHorizontalUrl || cover.url || "",
    year: item.releaseDate?.split("-")[0] || item.year || "",
    rating: parseFloat(item.imdbRatingValue) || item.rating || item.score || 0,
    type: item.subjectType || item.type || 1,
    genre: item.genre?.split(",").map((g: string) => g.trim()) || item.genres || [],
    synopsis: item.description || item.synopsis || item.overview || "",
    trailer: item.trailer?.url || item.trailerUrl || "",
    country: item.countryName || "",
    subtitles: item.subtitles || "",
    detailPath: item.detailPath || "",
  };
}

export async function getHomepage(): Promise<HomepageData> {
  try {
    const res = await fetch(`${BASE_URL}/homepage?apikey=${API_KEY}`);
    const data = await res.json();
    
    const apiData = data.data || {};
    const operatingList = apiData.operatingList || [];
    
    const featured: MediaItem[] = [];
    const trending: MediaItem[] = [];
    const newReleases: MediaItem[] = [];
    const topRated: MediaItem[] = [];
    const banners: BannerItem[] = [];

    // Parse operating list (contains different sections)
    operatingList.forEach((section: any) => {
      const sectionType = section.type?.toLowerCase() || "";
      const sectionTitle = (section.title || "").toLowerCase();
      
      // Parse banner items
      if (sectionType === "banner" && section.banner?.items) {
        section.banner.items.forEach((bannerItem: any) => {
          banners.push({
            id: bannerItem.id || "",
            title: bannerItem.title || "",
            image: bannerItem.image?.url || "",
            subjectId: bannerItem.subjectId || "",
            subjectType: bannerItem.subjectType || 2,
            subject: bannerItem.subject ? transformMediaItem(bannerItem.subject) : undefined,
          });
          
          // Also add banner subjects to featured
          if (bannerItem.subject) {
            featured.push(transformMediaItem(bannerItem.subject));
          }
        });
      }
      
      // Parse subject lists
      if (section.subjects && Array.isArray(section.subjects)) {
        const items = section.subjects.map(transformMediaItem).filter(Boolean);
        
        if (sectionTitle.includes("trending") || sectionTitle.includes("popular")) {
          trending.push(...items);
        } else if (sectionTitle.includes("new") || sectionTitle.includes("latest")) {
          newReleases.push(...items);
        } else if (sectionTitle.includes("top") || sectionTitle.includes("rated")) {
          topRated.push(...items);
        } else {
          // Add to appropriate category based on current count
          if (featured.length < 10) featured.push(...items);
          else if (trending.length < 20) trending.push(...items);
          else newReleases.push(...items);
        }
      }
    });

    // Parse top picks
    if (apiData.topPickList && Array.isArray(apiData.topPickList)) {
      const topPicks = apiData.topPickList.map(transformMediaItem).filter(Boolean);
      topRated.push(...topPicks);
    }

    return { featured, trending, newReleases, topRated, banners };
  } catch (error) {
    console.error("Failed to fetch homepage:", error);
    return { featured: [], trending: [], newReleases: [], topRated: [], banners: [] };
  }
}

export async function getTrending(type: string = "all", page: number = 1): Promise<MediaItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/trending?apikey=${API_KEY}&type=${type}&page=${page}`);
    const data = await res.json();
    
    // API returns data.subjectList
    const subjectList = data.data?.subjectList || [];
    
    if (!Array.isArray(subjectList)) {
      console.error("Trending subjectList is not an array:", typeof subjectList);
      return [];
    }
    
    return subjectList.map(transformMediaItem).filter(Boolean);
  } catch (error) {
    console.error("Failed to fetch trending:", error);
    return [];
  }
}

export async function searchMedia(
  query: string,
  subjectType: string = "ALL",
  page: number = 1,
  perPage: number = 24
): Promise<SearchResult> {
  try {
    const res = await fetch(
      `${BASE_URL}/search?apikey=${API_KEY}&query=${encodeURIComponent(query)}&subjectType=${subjectType}&page=${page}&perPage=${perPage}`
    );
    const data = await res.json();
    
    // API returns data.subjectList for search results
    const subjectList = data.data?.subjectList || data.data || [];
    const items = Array.isArray(subjectList) 
      ? subjectList.map(transformMediaItem).filter(Boolean)
      : [];
    
    return {
      items,
      totalPages: data.totalPages || data.data?.totalPages || Math.ceil((data.total || items.length) / perPage),
      currentPage: page,
    };
  } catch (error) {
    console.error("Failed to search:", error);
    return { items: [], totalPages: 0, currentPage: page };
  }
}

export async function getItemDetails(id: string, type: number): Promise<MediaItem | null> {
  try {
    const res = await fetch(`${BASE_URL}/item-details?apikey=${API_KEY}&id=${id}&type=${type}`);
    const data = await res.json();
    const item = data.data || data;
    
    const mediaItem = transformMediaItem(item);
    if (!mediaItem) return null;
    
    // Parse seasons and episodes for series
    if (type === 2 && (item.seasons || item.episodeVo || item.episodeList)) {
      const seasons: Season[] = [];
      const episodeData = item.seasons || item.episodeVo || item.episodeList || [];
      
      if (Array.isArray(episodeData)) {
        // Group episodes by season if not already grouped
        const episodesBySeason: Map<number, Episode[]> = new Map();
        
        episodeData.forEach((ep: any, idx: number) => {
          const seasonNum = ep.seasonNumber || ep.season || 1;
          const episode: Episode = {
            id: ep.id?.toString() || ep.episodeId?.toString() || `${id}-s${seasonNum}-e${idx + 1}`,
            episodeNumber: ep.episodeNumber || ep.seriesNo || ep.episode || idx + 1,
            seasonNumber: seasonNum,
            title: ep.title || ep.name || `Episode ${idx + 1}`,
            synopsis: ep.synopsis || ep.introduction || ep.description || "",
            thumbnail: ep.thumbnail || ep.coverHorizontalUrl || ep.cover?.url || "",
            downloadLinks: parseDownloadLinks(ep.definitions || ep.downloads || ep.qualities || []),
          };
          
          if (!episodesBySeason.has(seasonNum)) {
            episodesBySeason.set(seasonNum, []);
          }
          episodesBySeason.get(seasonNum)!.push(episode);
        });
        
        // Convert map to seasons array
        episodesBySeason.forEach((episodes, seasonNum) => {
          seasons.push({
            seasonNumber: seasonNum,
            episodes: episodes.sort((a, b) => a.episodeNumber - b.episodeNumber),
          });
        });
        
        seasons.sort((a, b) => a.seasonNumber - b.seasonNumber);
      }
      
      mediaItem.seasons = seasons;
    }
    
    // Parse download links for movies
    if (type === 1) {
      mediaItem.downloadLinks = parseDownloadLinks(item.definitions || item.downloads || item.downloadLinks || item.qualities || []);
    }
    
    // Add streaming services
    mediaItem.streamingServices = getStreamingServices(mediaItem.title);
    
    return mediaItem;
  } catch (error) {
    console.error("Failed to fetch item details:", error);
    return null;
  }
}

export async function getMediaDownloads(id?: string): Promise<DownloadLink[]> {
  try {
    const url = id 
      ? `${BASE_URL}/media?apikey=${API_KEY}&id=${id}`
      : `${BASE_URL}/media?apikey=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return parseDownloadLinks(data.data || data.definitions || data || []);
  } catch (error) {
    console.error("Failed to fetch downloads:", error);
    return [];
  }
}

export async function getRecommendations(id: string, type: number): Promise<MediaItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/recommendations?apikey=${API_KEY}&id=${id}&type=${type}`);
    const data = await res.json();
    
    const subjectList = data.data?.subjectList || data.data || [];
    
    if (!Array.isArray(subjectList)) {
      return [];
    }
    
    return subjectList.map(transformMediaItem).filter(Boolean);
  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
    return [];
  }
}

export async function getHotMoviesSeries(): Promise<{ movies: MediaItem[]; series: MediaItem[] }> {
  try {
    const res = await fetch(`${BASE_URL}/hot-movies-series?apikey=${API_KEY}`);
    const data = await res.json();
    
    // API returns data.movie and data.series as arrays
    const moviesData = data.data?.movie || [];
    const seriesData = data.data?.series || [];
    
    const movies = Array.isArray(moviesData) 
      ? moviesData.map(transformMediaItem).filter(Boolean) 
      : [];
    const series = Array.isArray(seriesData) 
      ? seriesData.map(transformMediaItem).filter(Boolean) 
      : [];
    
    return { movies, series };
  } catch (error) {
    console.error("Failed to fetch hot movies/series:", error);
    return { movies: [], series: [] };
  }
}

export async function getPopularSearches(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}/popular-searches?apikey=${API_KEY}`);
    const data = await res.json();
    
    // API returns data.everyoneSearch as array of objects with title
    const everyoneSearch = data.data?.everyoneSearch || [];
    
    if (!Array.isArray(everyoneSearch)) {
      return [];
    }
    
    return everyoneSearch.map((item: any) => item.title || item.keyword || item.query || item.name || "").filter(Boolean);
  } catch (error) {
    console.error("Failed to fetch popular searches:", error);
    return [];
  }
}

function parseDownloadLinks(definitions: any[]): DownloadLink[] {
  if (!Array.isArray(definitions)) return [];
  
  return definitions.map((def: any) => ({
    quality: def.quality || def.code || def.definition || def.name || "720p",
    size: def.size || def.fileSize || "Unknown",
    url: def.url || def.downloadUrl || def.link || "",
  })).filter(link => link.url);
}

function getStreamingServices(title: string): StreamingService[] {
  const encodedTitle = encodeURIComponent(title);
  
  return [
    {
      name: "Crunchyroll",
      url: `https://www.crunchyroll.com/search?q=${encodedTitle}`,
      logo: "/streaming/crunchyroll.svg",
    },
    {
      name: "Netflix",
      url: `https://www.netflix.com/search?q=${encodedTitle}`,
      logo: "/streaming/netflix.svg",
    },
    {
      name: "HiDive",
      url: `https://www.hidive.com/search?q=${encodedTitle}`,
      logo: "/streaming/hidive.svg",
    },
    {
      name: "Amazon Prime",
      url: `https://www.amazon.com/s?k=${encodedTitle}&i=instant-video`,
      logo: "/streaming/prime.svg",
    },
    {
      name: "Hulu",
      url: `https://www.hulu.com/search?q=${encodedTitle}`,
      logo: "/streaming/hulu.svg",
    },
  ];
}
