export type ApiResponse<T = null> = {
  success: boolean;
  message: string;
  data: T;
};

export type FilterQuery = { search: string };

export type PaginationQuery = {
  pageSize: number;
  pageNumber: number;
};

type ShapeOf<T> = Record<keyof T, unknown>;

export type AssertKeysEqual<X extends ShapeOf<Y>, Y extends ShapeOf<X>> = never;
