"use client";

import AppHeader from "@/components/layouts/AppHeader";
import LinkList from "@/components/LinkList";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

function parseTagsInput(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(/[\s,]+/)
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  );
}

export default function LinksPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const active = useMemo(() => {
    const from = searchParams.get("from") ?? "";
    const to = searchParams.get("to") ?? "";
    const domain = searchParams.get("domain") ?? "";
    const tags = searchParams
      .getAll("tag")
      .map((t) => t.trim())
      .filter(Boolean);

    const limitRaw = searchParams.get("limit") ?? "50";
    const limitNum = Number(limitRaw);
    const limit = Number.isFinite(limitNum)
      ? Math.min(100, Math.max(1, limitNum))
      : 50;

    return {
      from,
      to,
      domain,
      tags,
      limit,
    };
  }, [searchParams]);

  // Track previous active values to only update when they actually change
  const prevActiveRef = useRef(active);
  const [fromInput, setFromInput] = useState(active.from);
  const [toInput, setToInput] = useState(active.to);
  const [domainInput, setDomainInput] = useState(active.domain);
  const [tagsInput, setTagsInput] = useState(active.tags.join(", "));

  // Update inputs only when active values actually change (synchronize with URL search params)
  // Note: This effect synchronizes form inputs with URL search params (external system).
  // The setState calls are conditional and necessary for this synchronization.
  useLayoutEffect(() => {
    const prev = prevActiveRef.current;
    // Only update if values actually changed to avoid unnecessary re-renders
    if (prev.from !== active.from) {
      // Synchronizing with external system (URL search params), setState is necessary
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFromInput(active.from);
    }
    if (prev.to !== active.to) {
      setToInput(active.to);
    }
    if (prev.domain !== active.domain) {
      setDomainInput(active.domain);
    }
    const activeTagsStr = active.tags.join(", ");
    const prevTagsStr = prev.tags.join(", ");
    if (prevTagsStr !== activeTagsStr) {
      setTagsInput(activeTagsStr);
    }
    prevActiveRef.current = active;
  }, [active]);

  const applyFilters = () => {
    const next = new URLSearchParams();

    // Preserve limit if present.
    if (active.limit !== 50) next.set("limit", String(active.limit));

    if (fromInput) next.set("from", fromInput);
    if (toInput) next.set("to", toInput);
    if (domainInput) next.set("domain", domainInput);

    const tags = parseTagsInput(tagsInput);
    for (const t of tags) next.append("tag", t);

    const qs = next.toString();
    router.replace(qs ? `/links?${qs}` : "/links");
  };

  const clearFilters = () => {
    setFromInput("");
    setToInput("");
    setDomainInput("");
    setTagsInput("");
    router.replace("/links");
  };

  return (
    <main className="min-h-screen max-w-4xl mx-auto">
      <AppHeader />

      <section className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                期間（from）
              </label>
              <input
                type="date"
                value={fromInput}
                onChange={(e) => setFromInput(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                期間（to）
              </label>
              <input
                type="date"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                ドメイン
              </label>
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="example.com"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                タグ（カンマ/スペース区切り）
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="dev, ai"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={applyFilters}>
              適用
            </Button>
            <Button type="button" variant="outline" onClick={clearFilters}>
              クリア
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            URL にフィルタ条件を保持します（共有・再現できます）。
          </p>
        </div>
      </section>

      <LinkList
        limit={active.limit}
        from={active.from || undefined}
        to={active.to || undefined}
        domain={active.domain || undefined}
        tags={active.tags.length > 0 ? active.tags : undefined}
      />
    </main>
  );
}
