"use client";

import { useTranslations } from "next-intl";
import type { ProductDataTable as DataTable } from "@/types/product";

interface ProductDataTableProps {
  table: DataTable;
}

export function ProductDataTable({ table }: ProductDataTableProps) {
  const t = useTranslations("productPage.dataTable");
  if (!table.rows.length) return null;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-paper-200">
        <h3 className="text-[16px] font-bold text-ink-900 font-display">
          {table.title ?? t("defaultTitle")}
        </h3>
        <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-500 tabular-nums">
          {t("itemCount", { count: table.rows.length })}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-paper-100">
              {table.header.map((h, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.12em] text-ink-500 font-bold align-top"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr
                key={ri}
                className="border-t border-paper-200 hover:bg-green-50/50 transition-colors"
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-4 py-3 text-ink-800 align-top text-[13px] ${
                      ci === 0 ? "font-mono font-semibold text-ink-900 whitespace-nowrap" : ""
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
