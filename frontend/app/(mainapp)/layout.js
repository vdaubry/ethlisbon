"use client";

import { ConnectKitProvider } from "connectkit";
import { WagmiConfig } from "wagmi";
import { client } from "@/utils/wagmi";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import AppHeader from "@/components/AppHeader";
import { CheckedContactsProvider } from "@/contexts/CheckedContactsContext";

const inter = Inter({ subsets: ["latin"] });

export default function AppLayout({ children }) {
  return (
    <html>
      <head />
      <body className={inter.className}>
        <WagmiConfig client={client}>
          <ConnectKitProvider>
            <CheckedContactsProvider>{children}</CheckedContactsProvider>
          </ConnectKitProvider>
        </WagmiConfig>
      </body>
    </html>
  );
}
