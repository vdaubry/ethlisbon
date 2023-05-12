"use client";

import { useEffect, useState } from "react";
import ClientOnly from "@/components/clientOnly";

import CreateSafe from "@/components/CreateSafe";

export default function SafePage() {
  const [hasMounted, setHasMounted] = useState(false);

  /**************************************
   *
   * Render UI
   *
   **************************************/

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <ClientOnly>
      <CreateSafe/>
    </ClientOnly>
  );
}
