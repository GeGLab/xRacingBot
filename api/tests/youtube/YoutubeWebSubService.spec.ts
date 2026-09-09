import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { YoutubeWebSubService } from '../../src/infra/youtube/YoutubeWebSubService';

vi.mock('axios');

describe('YoutubeWebSubService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registers each configured feed with callback, secret, and lease', async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: '' });
    const service = new YoutubeWebSubService(
      'https://bot.example.com/webhook/youtube',
      'test-secret',
    );

    await service.subscribeAll([{ name: 'xracing', id: 'UC_123' }]);

    expect(axios.post).toHaveBeenCalledWith(
      'https://pubsubhubbub.appspot.com/subscribe',
      expect.stringContaining('hub.callback=https%3A%2F%2Fbot.example.com%2Fwebhook%2Fyoutube'),
      expect.objectContaining({ headers: { 'content-type': 'application/x-www-form-urlencoded' } }),
    );
    expect(vi.mocked(axios.post).mock.calls[0][1]).toContain('hub.secret=test-secret');
    expect(vi.mocked(axios.post).mock.calls[0][1]).toContain('hub.lease_seconds=432000');
  });

  it('does not call the hub without a callback URL', async () => {
    const service = new YoutubeWebSubService('', 'test-secret');
    await service.subscribeAll([{ name: 'xracing', id: 'UC_123' }]);
    expect(axios.post).not.toHaveBeenCalled();
  });
});
