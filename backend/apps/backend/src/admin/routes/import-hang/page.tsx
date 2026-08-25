import { defineRouteConfig } from "@medusajs/admin-sdk";
import { useState } from "react";

type ImportResult = {
  total: number;
  created: number;
  skipped: number;
  failed: number;
  results: { title: string; status: "created" | "skipped" | "failed"; error?: string }[];
};

const ImportHangPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [rate, setRate] = useState(168);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImport() {
    if (!file) {
      setError("Chọn file Excel trước.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("jpyToVnd", String(rate));
      const res = await fetch("/admin/import-supplier", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Import thất bại.");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Import sản phẩm từ file nhà cung cấp</h1>
      <p style={{ color: "#6b7280", marginBottom: 20, fontSize: 14 }}>
        Upload file Excel export gốc từ nhà cung cấp (không cần đúng định dạng của Medusa) — hệ thống tự nhận diện
        và tạo sản phẩm. Sản phẩm đã import trước đó (trùng mã SPU) sẽ tự động bỏ qua, chạy lại an toàn.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 500 }}>
          File Excel (.xlsx)
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={{ display: "block", marginTop: 6 }}
          />
        </label>

        <label style={{ fontSize: 13, fontWeight: 500 }}>
          Tỷ giá JPY → VND
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            style={{ display: "block", marginTop: 6, padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: 4, width: 120 }}
          />
        </label>

        <button
          onClick={handleImport}
          disabled={loading}
          style={{
            padding: "8px 16px",
            background: "#111827",
            color: "#fff",
            borderRadius: 4,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            width: "fit-content",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Đang import..." : "Bắt đầu import"}
        </button>
      </div>

      {error && <p style={{ color: "#dc2626", fontSize: 14 }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 14, marginBottom: 10 }}>
            Tổng {result.total} · Đã tạo <strong>{result.created}</strong> · Bỏ qua (đã có) {result.skipped} ·
            Lỗi {result.failed}
          </p>
          <div style={{ maxHeight: 360, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 4 }}>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              <tbody>
                {result.results.map((r, i) => (
                  <tr key={i} style={{ borderTop: i > 0 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "6px 10px" }}>{r.title}</td>
                    <td
                      style={{
                        padding: "6px 10px",
                        color: r.status === "created" ? "#059669" : r.status === "skipped" ? "#6b7280" : "#dc2626",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.status === "created" ? "Đã tạo" : r.status === "skipped" ? "Đã có" : "Lỗi"}
                      {r.error ? `: ${r.error}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export const config = defineRouteConfig({
  label: "Import nhà cung cấp",
});

export default ImportHangPage;
