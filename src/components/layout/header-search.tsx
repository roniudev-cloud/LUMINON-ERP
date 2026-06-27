"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { globalSearch } from "@/actions/search";

type SearchResults = Awaited<ReturnType<typeof globalSearch>>;

const EMPTY_RESULTS: SearchResults = { customers: [], leads: [], projects: [] };

export function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = query.trim();
    const handle = setTimeout(
      async () => {
        if (term.length < 2) {
          setResults(EMPTY_RESULTS);
          setLoading(false);
          return;
        }
        setLoading(true);
        const data = await globalSearch(term);
        setResults(data);
        setLoading(false);
      },
      term.length < 2 ? 0 : 300
    );
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goTo = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery("");
  };

  const hasResults =
    results.customers.length > 0 || results.leads.length > 0 || results.projects.length > 0;
  const term = query.trim();

  return (
    <div ref={containerRef} className="flex-1 max-w-md ml-auto relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm kiếm..."
          className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && term.length >= 2 && (
        <div className="absolute left-0 right-0 mt-1 rounded-lg border bg-popover shadow-lg z-50 max-h-96 overflow-y-auto">
          {!loading && !hasResults && (
            <p className="p-4 text-sm text-muted-foreground text-center">
              Không tìm thấy kết quả cho &quot;{term}&quot;
            </p>
          )}

          {results.customers.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Khách hàng</p>
              {results.customers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => goTo(`/customers/${c.id}`)}
                  className="w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors"
                >
                  <span className="font-medium">{c.name}</span>
                  {c.phone && <span className="text-muted-foreground ml-2">{c.phone}</span>}
                </button>
              ))}
            </div>
          )}

          {results.leads.length > 0 && (
            <div className="p-2 border-t">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Lead</p>
              {results.leads.map((l) => (
                <button
                  key={l.id}
                  onClick={() => goTo(`/leads`)}
                  className="w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors"
                >
                  <span className="font-medium">{l.name}</span>
                  {l.phone && <span className="text-muted-foreground ml-2">{l.phone}</span>}
                </button>
              ))}
            </div>
          )}

          {results.projects.length > 0 && (
            <div className="p-2 border-t">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Công trình</p>
              {results.projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => goTo(`/projects/${p.id}`)}
                  className="w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground ml-2">{p.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
