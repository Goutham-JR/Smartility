"use client";

import { useEffect } from "react";
import { hydrateAuth } from "@/lib/store";

export function AuthHydrator() {
  useEffect(() => {
    hydrateAuth();
  }, []);
  return null;
}
