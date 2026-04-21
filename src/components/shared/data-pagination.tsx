import {
  Pagination,
  PaginationList,
  PaginationItem,
  PaginationButton,
} from '@/components/selia/pagination';

export function DataPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <Pagination>
      <PaginationList>
        <PaginationItem>
          <PaginationButton
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </PaginationButton>
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (p) =>
              p === 1 ||
              p === totalPages ||
              Math.abs(p - page) <= 1,
          )
          .map((p, idx, arr) => {
            const prev = arr[idx - 1];
            const showEllipsis = prev !== undefined && p - prev > 1;
            return (
              <PaginationItem key={p}>
                {showEllipsis && (
                  <span className="px-2 text-muted">...</span>
                )}
                <PaginationButton
                  active={p === page}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </PaginationButton>
              </PaginationItem>
            );
          })}
        <PaginationItem>
          <PaginationButton
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </PaginationButton>
        </PaginationItem>
      </PaginationList>
    </Pagination>
  );
}
