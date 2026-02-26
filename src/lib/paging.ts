export type Paging = {
  limit: number;
  offset: number;
  total: number;
};

export type PagedResponse<T> = {
  data: T[];
  paging: Paging;
};

export function paged<T>(data: T[], paging: Paging): PagedResponse<T> {
  return { data, paging };
}