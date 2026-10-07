// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // 静的HTMLとして出力する設定
  images: {
    unoptimized: true, // 画像最適化を無効化（静的ホスティング用）
  },
};

export default function config(): NextConfig {
  return nextConfig;
}