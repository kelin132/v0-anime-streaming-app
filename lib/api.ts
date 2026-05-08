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
}

export interface SearchResult {
  items: MediaItem[];
  totalPages: number;
  currentPage: number;
}

// Transform API response to our MediaItem format
function transformMediaItem(item: any): MediaItem {
  return {
    id: item.id?.toString() || item.subjectId?.toString() || "",
    title: item.title || item.name || item.subjectTitle || "",
    poster: item.poster || item.coverVerticalUrl || item.image || "",
    backdrop: item.backdrop || item.coverHorizontalUrl || "",
    year: item.year || item.releaseYear?.toString() || "",
    rating: item.rating || item.score || 0,
    type: item.type || item.subjectType || 1,
    genre: item.genres || item.tagList || [],
    synopsis: item.synopsis || item.overview || item.description || "",
    trailer: item.trailer || item.trailerUrl || "",
  };
}

export async function getHomepage(): Promise<HomepageData> {
  try {
    const res = await fetch(`${BASE_URL}/homepage?apikey=${API_KEY}`);
    const data = await res.json();
    
    const sections = data.data || data.sections || data || [];
    
    // Parse different sections from the homepage response
    const featured: MediaItem[] = [];
    const trending: MediaItem[] = [];
    const newReleases: MediaItem[] = [];
    const topRated: MediaItem[] = [];

    if (Array.isArray(sections)) {
      sections.forEach((section: any) => {
        const items = (section.items || section.data || []).map(transformMediaItem);
        const sectionName = (section.title || section.name || "").toLowerCase();
        
        if (sectionName.includes("featured") || sectionName.includes("banner")) {
          featured.push(...items);
        } else if (sectionName.includes("trending") || sectionName.includes("popular")) {
          trending.push(...items);
        } else if (sectionName.includes("new") || sectionName.includes("latest")) {
          newReleases.push(...items);
        } else if (sectionName.includes("top") || sectionName.includes("rated")) {
          topRated.push(...items);
        } else {
          // Distribute remaining items
          if (featured.length < 5) featured.push(...items.slice(0, 5 - featured.length));
          else if (trending.length < 20) trending.push(...items.slice(0, 20 - trending.length));
          else newReleases.push(...items);
        }
      });
    }

    return { featured, trending, newReleases, topRated };
  } catch (error) {
    console.error("Failed to fetch homepage:", error);
    return { featured: [], trending: [], newReleases: [], topRated: [] };
  }
}

export async function getTrending(type: string = "all", page: number = 1): Promise<MediaItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/trending?apikey=${API_KEY}&type=${type}&page=${page}`);
    const data = await res.json();
    const items = data.data || data.items || data.results || [];
    return items.map(transformMediaItem);
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
    const items = (data.data || data.items || data.results || []).map(transformMediaItem);
    return {
      items,
      totalPages: data.totalPages || data.total_pages || Math.ceil((data.total || items.length) / perPage),
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
    
    // Parse seasons and episodes for series
    if (type === 2 && (item.seasons || item.episodeVo)) {
      const seasons: Season[] = [];
      const episodeData = item.seasons || item.episodeVo || [];
      
      if (Array.isArray(episodeData)) {
        episodeData.forEach((season: any, idx: number) => {
          const episodes = (season.episodes || season.episodeList || [season]).map((ep: any, epIdx: number) => ({
            id: ep.id?.toString() || `${id}-s${idx + 1}-e${epIdx + 1}`,
            episodeNumber: ep.episodeNumber || ep.seriesNo || epIdx + 1,
            seasonNumber: season.seasonNumber || idx + 1,
            title: ep.title || ep.name || `Episode ${epIdx + 1}`,
            synopsis: ep.synopsis || ep.introduction || "",
            thumbnail: ep.thumbnail || ep.coverHorizontalUrl || "",
            downloadLinks: parseDownloadLinks(ep.definitions || ep.downloads || []),
          }));
          
          seasons.push({
            seasonNumber: season.seasonNumber || idx + 1,
            episodes,
          });
        });
      }
      
      mediaItem.seasons = seasons;
    }
    
    // Parse download links for movies
    if (type === 1) {
      mediaItem.downloadLinks = parseDownloadLinks(item.definitions || item.downloads || item.downloadLinks || []);
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
    const items = data.data || data.items || data.results || [];
    return items.map(transformMediaItem);
  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
    return [];
  }
}

export async function getHotMoviesSeries(): Promise<MediaItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/hot-movies-series?apikey=${API_KEY}`);
    const data = await res.json();
    const items = data.data || data.items || data.results || [];
    return items.map(transformMediaItem);
  } catch (error) {
    console.error("Failed to fetch hot movies/series:", error);
    return [];
  }
}

export async function getPopularSearches(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}/popular-searches?apikey=${API_KEY}`);
    const data = await res.json();
    const searches = data.data || data.searches || data || [];
    return searches.map((item: any) => item.keyword || item.query || item.name || item);
  } catch (error) {
    console.error("Failed to fetch popular searches:", error);
    return [];
  }
}

function parseDownloadLinks(definitions: any[]): DownloadLink[] {
  if (!Array.isArray(definitions)) return [];
  
  return definitions.map((def: any) => ({
    quality: def.quality || def.code || def.definition || "720p",
    size: def.size || def.fileSize || "Unknown",
    url: def.url || def.downloadUrl || def.link || "",
  })).filter(link => link.url);
}

function getStreamingServices(title: string): StreamingService[] {
  // Generate potential streaming links based on title
  const encodedTitle = encodeURIComponent(title);
  
  return [
    {
      name: "Crunchyroll",
      url: `https://www.crunchyroll.com/search?q=${encodedTitle}`,
      logo: "https://www.crunchyroll.com/favicons/favicon-32x32.png",
    },
    {
      name: "Netflix",
      url: `https://www.netflix.com/search?q=${encodedTitle}`,
      logo: "https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico",
    },
    {
      name: "HiDive",
      url: `https://www.hidive.com/search?q=${encodedTitle}`,
      logo: "https://www.hidive.com/favicon.ico",
    },
    {
      name: "Amazon Prime",
      url: `https://www.amazon.com/s?k=${encodedTitle}&i=instant-video`,
      logo: "https://www.amazon.com/favicon.ico",
    },
    {
      name: "Hulu",
      url: `https://www.hulu.com/search?q=${encodedTitle}`,
      logo: "https://www.hulu.com/favicon.ico",
    },
  ];
}
