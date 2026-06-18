/**
 * Video — Domain Entity
 *
 * Represents a YouTube video discovered by the system.
 * This is a pure value-carrier: immutable after construction.
 */
export class Video {
  constructor(
    /** YouTube video ID (e.g. "dQw4w9WgXcQ") */
    public readonly id: string,
    /** Human-readable title of the video */
    public readonly title: string,
    /** Full watch URL (https://www.youtube.com/watch?v=...) */
    public readonly url: string,
    /** UTC timestamp when the video was published on YouTube */
    public readonly publishedAt: Date,
  ) {}
}
