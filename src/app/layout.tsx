import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The actual <html> and <body> are emitted by app/[locale]/layout.tsx.
  // Keep this as a thin pass-through so that the locale layout owns the
  // language attribute, intl provider and global chrome.
  return children;
}
