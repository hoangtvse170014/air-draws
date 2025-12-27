import { Router } from 'express';
import { StabilityClient } from '../integrations/stability';

const router = Router();
const stability = new StabilityClient();

router.get('/api-key', (req, res) => {
  const apiKey = process.env.STABILITY_KEY;
  res.json({
    hasKey: !!apiKey && apiKey !== 'demo',
    keyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET',
    keyLength: apiKey?.length || 0,
  });
});

router.get('/test', async (req, res) => {
  console.log('[test] Endpoint called');
  try {
    const apiKey = process.env.STABILITY_KEY;
    console.log('[test] API key check:', {
      hasKey: !!apiKey,
      isDemo: apiKey === 'demo',
      prefix: apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET',
    });
    
    if (!apiKey || apiKey === 'demo') {
      console.warn('[test] API key not configured');
      return res.json({
        success: false,
        error: 'API key not configured',
        apiKey: apiKey || 'NOT SET',
      });
    }

    // Test với một sketch nhỏ
    const testSketch = {
      data: Buffer.from('test'),
      size: 2,
    };

    console.log('[test] Calling stability.generate...');
    const result = await stability.generate({
      prompt: 'test',
      sketch: testSketch,
    });

    console.log('[test] Result received:', {
      isPlaceholder: result.imageUrl.includes('placehold.co'),
      urlPrefix: result.imageUrl.substring(0, 100),
    });

    res.json({
      success: true,
      isPlaceholder: result.imageUrl.includes('placehold.co'),
      imageUrlPrefix: result.imageUrl.substring(0, 100),
    });
  } catch (error) {
    console.error('[test] Error:', error);
    res.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
