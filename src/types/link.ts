export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string | null;
  sort_order: number;
  created_at: string;
}
