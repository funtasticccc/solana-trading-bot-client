"use client";

import { useState, useEffect } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({ currentPage, totalPages, onPageChange, className }: PaginationProps) => {
  const [inputVal, setInputVal] = useState(String(currentPage));

  useEffect(() => {
    setInputVal(String(currentPage));
  }, [currentPage]);

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    if (valStr === "") {
      setInputVal("");
      return;
    }
    const val = parseInt(valStr);
    if (!isNaN(val)) {
      const clamped = Math.min(Math.max(1, val), totalPages);
      setInputVal(String(clamped));
      onPageChange(clamped);
    }
  };

  if (totalPages <= 1) return null;

  const btnStyle = (disabled: boolean) => ({
    width: "28px", height: "28px", borderRadius: "6px", border: "1px solid #161b22",
    backgroundColor: "transparent", color: disabled ? "#30363d" : "#8b949e",
    cursor: disabled ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
    transition: "all 0.15s",
  } as const);

  return (
    <div className={className} style={{
      display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px",
      padding: "16px 20px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#161b22",
      backgroundColor: "#0d1117",
    }}>
      <div style={{ display: "flex", gap: "4px" }}>
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          style={btnStyle(currentPage === 1)}
        >
          «
        </button>
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          style={btnStyle(currentPage === 1)}
        >
          ‹
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          type="number"
          value={inputVal}
          onChange={handlePageInput}
          style={{
            width: "44px", height: "28px", backgroundColor: "#0d1117", border: "1px solid #30363d",
            borderRadius: "6px", color: "#e6edf3", textAlign: "center", fontSize: "12px",
            fontFamily: "JetBrains Mono, monospace"
          }}
        />
        <span style={{ color: "#484f58", fontSize: "11px", letterSpacing: "0.05em" }}>of {totalPages}</span>
      </div>

      <div style={{ display: "flex", gap: "4px" }}>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          style={btnStyle(currentPage === totalPages)}
        >
          ›
        </button>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          style={btnStyle(currentPage === totalPages)}
        >
          »
        </button>
      </div>
    </div>
  );
};
