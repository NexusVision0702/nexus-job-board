import './globals.css';

export const metadata = {
  title: 'ネクビジョ求人 企業登録',
  description: 'ネクビジョ求人の企業パートナー登録・申請ページです。',
  icons: {
    icon: { url: '/logo.png', type: 'image/png' },
    shortcut: { url: '/logo.png', type: 'image/png' },
    apple: { url: '/logo.png', type: 'image/png' },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}