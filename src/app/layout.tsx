import '@/ui/styles/globals.css';
import React from "react";

export const metadata = {
  title: 'AI Call Feedback System',
  description: 'AI-Powered Debt Collection Analysis Tool',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}