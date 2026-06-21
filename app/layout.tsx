import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'EcoTrack AI – Personal Carbon Footprint Awareness Platform',
  description: 'Track your daily carbon emissions, earn rewards, and receive personalized sustainability suggestions with AI.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
