/**
 * YoutubeTypes
 *
 * TypeScript interfaces mirroring the shape produced by xml2js when parsing
 * YouTube's Atom RSS feed with options:
 *   { explicitArray: false, mergeAttrs: true }
 *
 * - explicitArray: false  → single child elements become objects, not arrays
 * - mergeAttrs: true      → XML attributes are merged into the parent object
 *                           so <link href="..."/> becomes { href: "..." }
 */

export interface YoutubeEntryLink {
  rel?: string;
  href: string;
}

export interface YoutubeEntry {
  /** Full ID string: "yt:video:VIDEO_ID" */
  id: string;
  title: string;
  /** Merged from attributes: { rel: "alternate", href: "https://..." } */
  link: YoutubeEntryLink | YoutubeEntryLink[];
  published: string;
  /** YouTube video ID extracted by xml2js namespace handling */
  "yt:videoId"?: string;
  "media:group"?: {
    "media:thumbnail"?: {
      url?: string;
      width?: string;
      height?: string;
    };
  };
  author?: {
    name?: string;
    uri?: string;
  };
}

export interface YoutubeFeed {
  feed: {
    entry?: YoutubeEntry | YoutubeEntry[];
    /** YouTube channel ID from <yt:channelId> */
    "yt:channelId"?: string;
    id?: string;
    title?: string;
  };
}
