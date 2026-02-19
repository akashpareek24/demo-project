import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export default function TokenPager({ total = 20 }) {
  const { pathname } = useLocation();
  const nums = useMemo(() => Array.from({ length: total }, (_, i) => i + 1), [total]);

  const currentHash = typeof window !== "undefined" ? window.location.hash : "";
  const current =
    currentHash?.startsWith("#section-") ? Number(currentHash.replace("#section-", "")) : 1;

  const prev = current > 1 ? current - 1 : 1;
  const next = current < total ? current + 1 : total;

  return (
    <nav className="d-flex justify-content-center">
      <ul className="pagination mb-0">
        <li className={`page-item ${current === 1 ? "disabled" : ""}`}>
          <a className="page-link" href={`${pathname}#section-${prev}`}>Previous</a>
        </li>

        {nums.map((n) => (
          <li key={n} className={`page-item ${current === n ? "active" : ""}`}>
            <a className="page-link" href={`${pathname}#section-${n}`}>{n}</a>
          </li>
        ))}

        <li className={`page-item ${current === total ? "disabled" : ""}`}>
          <a className="page-link" href={`${pathname}#section-${next}`}>Next</a>
        </li>
      </ul>
    </nav>
  );
}
