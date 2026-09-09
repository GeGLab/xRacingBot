import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { YoutubeRssService } from '../../src/infra/youtube/YoutubeRssService';

vi.mock('axios');

// ── Sample XML fixtures ───────────────────────────────────────────────────

const FEED_WITH_ONE_ENTRY = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015"
      xmlns:media="http://search.yahoo.com/mrss/"
      xmlns="http://www.w3.org/2005/Atom">
  <id>yt:channel:UCuAXFkgsw1L7xaCfnd5JJOw</id>
  <yt:channelId>UCuAXFkgsw1L7xaCfnd5JJOw</yt:channelId>
  <title>Test Channel</title>
  <entry>
    <id>yt:video:dQw4w9WgXcQ</id>
    <yt:videoId>dQw4w9WgXcQ</yt:videoId>
    <title>Never Gonna Give You Up</title>
    <link rel="alternate" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"/>
    <published>2024-01-15T12:00:00+00:00</published>
    <author><name>Rick Astley</name></author>
  </entry>
</feed>`;

const FEED_WITH_MULTIPLE_ENTRIES = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015"
      xmlns="http://www.w3.org/2005/Atom">
  <yt:channelId>UCuAXFkgsw1L7xaCfnd5JJOw</yt:channelId>
  <entry>
    <id>yt:video:NEWEST_ID</id>
    <yt:videoId>NEWEST_ID</yt:videoId>
    <title>Newest Video</title>
    <link rel="alternate" href="https://www.youtube.com/watch?v=NEWEST_ID"/>
    <published>2024-06-01T00:00:00+00:00</published>
  </entry>
  <entry>
    <id>yt:video:OLDER_ID</id>
    <yt:videoId>OLDER_ID</yt:videoId>
    <title>Older Video</title>
    <link rel="alternate" href="https://www.youtube.com/watch?v=OLDER_ID"/>
    <published>2024-05-01T00:00:00+00:00</published>
  </entry>
</feed>`;

const FEED_EMPTY = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015"
      xmlns="http://www.w3.org/2005/Atom">
  <id>yt:channel:UCuAXFkgsw1L7xaCfnd5JJOw</id>
  <yt:channelId>UCuAXFkgsw1L7xaCfnd5JJOw</yt:channelId>
  <title>Empty Channel</title>
</feed>`;

// ── Tests ─────────────────────────────────────────────────────────────────

describe('YoutubeRssService', () => {
  let service: YoutubeRssService;

  beforeEach(() => {
    service = new YoutubeRssService();
    vi.clearAllMocks();
  });

  it('returns the latest video with correct fields from a single-entry feed', async () => {
    // Arrange
    vi.mocked(axios.get).mockResolvedValue({ data: FEED_WITH_ONE_ENTRY });

    // Act
    const video = await service.getLatestVideo('UCuAXFkgsw1L7xaCfnd5JJOw');

    // Assert
    expect(video).not.toBeNull();
    expect(video?.id).toBe('dQw4w9WgXcQ');
    expect(video?.title).toBe('Never Gonna Give You Up');
    expect(video?.url).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(video?.publishedAt).toBeInstanceOf(Date);
    expect(video?.publishedAt.getFullYear()).toBe(2024);
  });

  it('calls axios with the correct URL containing the channel ID', async () => {
    // Arrange
    vi.mocked(axios.get).mockResolvedValue({ data: FEED_WITH_ONE_ENTRY });

    // Act
    await service.getLatestVideo('UCuAXFkgsw1L7xaCfnd5JJOw');

    // Assert
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('channel_id=UCuAXFkgsw1L7xaCfnd5JJOw'),
      expect.objectContaining({ timeout: 10_000 }),
    );
  });

  it('returns the FIRST entry (most recent) when feed has multiple entries', async () => {
    // Arrange
    vi.mocked(axios.get).mockResolvedValue({ data: FEED_WITH_MULTIPLE_ENTRIES });

    // Act
    const video = await service.getLatestVideo('UCuAXFkgsw1L7xaCfnd5JJOw');

    // Assert — first entry in the XML, which YouTube orders newest-first
    expect(video?.id).toBe('NEWEST_ID');
    expect(video?.title).toBe('Newest Video');
  });

  it('returns null when the feed has no entries', async () => {
    // Arrange
    vi.mocked(axios.get).mockResolvedValue({ data: FEED_EMPTY });

    // Act
    const video = await service.getLatestVideo('UCuAXFkgsw1L7xaCfnd5JJOw');

    // Assert
    expect(video).toBeNull();
  });

  it('propagates network errors so the caller can handle them', async () => {
    // Arrange
    vi.mocked(axios.get).mockRejectedValue(new Error('Network Error'));

    // Act & Assert
    await expect(service.getLatestVideo('UCuAXFkgsw1L7xaCfnd5JJOw')).rejects.toThrow(
      'Network Error',
    );
  });

  it('propagates XML parse errors', async () => {
    // Arrange — malformed XML
    vi.mocked(axios.get).mockResolvedValue({ data: '<this is not valid XML' });

    // Act & Assert
    await expect(service.getLatestVideo('UCuAXFkgsw1L7xaCfnd5JJOw')).rejects.toThrow();
  });
});
