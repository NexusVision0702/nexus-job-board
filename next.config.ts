// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // output: 'export', // ← 静的エクスポート設定を解除しました
  images: {
    unoptimized: true, // 画像最適化の無効化はそのままで問題ありません
  },
};

export default function config(): NextConfig {
  return nextConfig;
}