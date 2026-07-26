import { ReactNode } from "react";

interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyState?: ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  emptyState,
}: DataTableProps<T>) {
  if (!data.length) {
    return (
      <div className="rounded-none border border-[#D5DBDB] bg-white">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-none border border-[#D5DBDB] bg-white">
      <table className="min-w-full border-collapse">
        <thead className="bg-[#FAFAFA]">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                style={{ width: column.width }}
                className={`
                  border-b border-[#D5DBDB]
                  px-6
                  py-3
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-[#5F6B7A]
                `}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="transition-colors hover:bg-[#FAFAFA]"
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="border-b border-[#EAEEEE] px-6 py-4 text-sm text-[#16191F]"
                >
                  {column.render
                    ? column.render(row)
                    : String(row[column.key as keyof T] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}