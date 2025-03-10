
export interface Resource {
  id: number;
  title: string;
  description: string;
  url: string;
  type: string;
  difficulty: string;
  tags: string[];
  author: string;
  date_published?: string;
  rating?: number;
  language?: string;
  likes?: number;
  saved?: boolean;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
