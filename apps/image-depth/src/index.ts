import express from 'express';
import type { Request, Response } from 'express';

const app = express();
app.use(express.json());

/**
 * POST /depth-map
 * Body: { images: string[] }
 * Returns: { results: { url: string, depthMap: string | null }[] }
 */
app.post('/depth-map', async (req: Request, res: Response): Promise<void> => {
  const { images } = req.body as { images: string[] };
  if (!Array.isArray(images) || images.length === 0) {
    res.status(400).json({ error: 'images must be a non-empty array' });
    return;
  }

  // TODO: 각 이미지 URL에 대해 depth map 생성 (AI 모델 연동 필요)
  // 현재는 placeholder로 빈 결과 반환
  // MiDas, ZoeDepth 등...
  const results = images.map(url => ({ url, depthMap: null }));

  res.json({ results });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`image-depth API server listening on port ${PORT}`);
}); 