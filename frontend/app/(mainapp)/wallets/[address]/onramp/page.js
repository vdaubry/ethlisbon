"use client";
import OnRamp from "@/components/OnRamp";

export default function Page({ params }) {
  return (
    <div>
      <OnRamp walletAddress={params.address} />
    </div>
  );
}
