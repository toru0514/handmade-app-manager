"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { LinkItem } from "@/types/link";

const STORAGE_KEY = "handmade-app-manager-links";

const DEFAULT_LINKS: LinkItem[] = [
  {
    id: uuidv4(),
    title: "原価計算アプリ (cost-app)",
    url: "https://cost-app.vercel.app",
    description: "原価計算・在庫管理・コストシミュレーション",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: "発送管理 (shipping-manager)",
    url: "https://handmade-shipping-manager.vercel.app",
    description: "注文取得・伝票作成",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: "PF自動出品 (pfauto-app)",
    url: "https://pfauto-app.vercel.app",
    description: "プラットフォーム自動出品",
    createdAt: new Date().toISOString(),
  },
];

export function useLinks() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setLinks(JSON.parse(stored));
    } else {
      setLinks(DEFAULT_LINKS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LINKS));
    }
    setIsLoaded(true);
  }, []);

  const saveLinks = useCallback((newLinks: LinkItem[]) => {
    setLinks(newLinks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLinks));
  }, []);

  const addLink = useCallback(
    (title: string, url: string, description?: string) => {
      const newLink: LinkItem = {
        id: uuidv4(),
        title,
        url,
        description,
        createdAt: new Date().toISOString(),
      };
      saveLinks([...links, newLink]);
    },
    [links, saveLinks]
  );

  const updateLink = useCallback(
    (id: string, updates: Partial<Omit<LinkItem, "id" | "createdAt">>) => {
      const newLinks = links.map((link) =>
        link.id === id ? { ...link, ...updates } : link
      );
      saveLinks(newLinks);
    },
    [links, saveLinks]
  );

  const deleteLink = useCallback(
    (id: string) => {
      saveLinks(links.filter((link) => link.id !== id));
    },
    [links, saveLinks]
  );

  const reorderLinks = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newLinks = [...links];
      const [moved] = newLinks.splice(fromIndex, 1);
      newLinks.splice(toIndex, 0, moved);
      saveLinks(newLinks);
    },
    [links, saveLinks]
  );

  return { links, isLoaded, addLink, updateLink, deleteLink, reorderLinks };
}
