"use client";

import { useState, useEffect, useCallback } from "react";
import { LinkItem } from "@/types/link";

export function useLinks() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/links");
      if (!res.ok) throw new Error("Failed to fetch links");
      const data = await res.json();
      setLinks(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const addLink = useCallback(
    async (title: string, url: string, description?: string) => {
      try {
        const res = await fetch("/api/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, url, description }),
        });
        if (!res.ok) throw new Error("Failed to add link");
        const newLink = await res.json();
        setLinks((prev) => [...prev, newLink]);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "追加に失敗しました");
      }
    },
    []
  );

  const updateLink = useCallback(
    async (
      id: string,
      updates: Partial<Omit<LinkItem, "id" | "created_at">>
    ) => {
      // Find current link to merge with updates
      const current = links.find((l) => l.id === id);
      if (!current) return;

      const payload = {
        title: updates.title ?? current.title,
        url: updates.url ?? current.url,
        description: updates.description ?? current.description,
      };

      try {
        const res = await fetch(`/api/links/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update link");
        const updated = await res.json();
        setLinks((prev) => prev.map((l) => (l.id === id ? updated : l)));
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "更新に失敗しました");
      }
    },
    [links]
  );

  const deleteLink = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete link");
      setLinks((prev) => prev.filter((l) => l.id !== id));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "削除に失敗しました");
    }
  }, []);

  return { links, isLoaded, error, addLink, updateLink, deleteLink };
}
