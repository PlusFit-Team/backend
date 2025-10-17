export function formatResponse<T>(
  data: T[],
  pagination?: {
    pageNumber: number;
    pageSize: number;
    count: number;
  },
  additionalMeta?: object,
): {
  data: T[];
  meta: {
    pagination: {
      pageNumber: number;
      pageSize: number;
      count: number;
      pageCount: number;
    };
    data?: object;
  };
} {
  const pageCount = Math.ceil(pagination.count / pagination.pageSize);

  return {
    data,
    meta: {
      pagination: {
        ...pagination,
        pageCount,
      },
      data: additionalMeta,
    },
  };
}
