'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export interface Article {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
}

interface ArticleManagerProps {
  articles: Article[];
  onChange: (articles: Article[]) => void;
}

export function ArticleManager({ articles, onChange }: ArticleManagerProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addArticle = async () => {
    if (!url.trim()) return;

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    if (articles.some((a) => a.url === normalizedUrl)) {
      setError('This article has already been added');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/og?url=${encodeURIComponent(normalizedUrl)}`);
      const data = await res.json();
      onChange([...articles, {
        url: normalizedUrl,
        title: data.title || normalizedUrl,
        description: data.description,
        image: data.image,
        siteName: data.siteName,
      }]);
      setUrl('');
    } catch {
      setError('Failed to fetch article preview');
    } finally {
      setLoading(false);
    }
  };

  const removeArticle = (index: number) => {
    onChange(articles.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>In the News</CardTitle>
        <span className="text-xs text-[var(--text-tertiary)] font-mono">{articles.length} ARTICLES</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-[var(--text-secondary)]">
          Add links to online articles that feature you. These will appear on your portfolio.
        </p>

        {/* Add URL input */}
        <div className="flex gap-2">
          <input
            className="input flex-1"
            type="url"
            placeholder="Paste article URL..."
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && addArticle()}
          />
          <Button variant="primary" size="sm" onClick={addArticle} loading={loading}>
            Add
          </Button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}

        {/* Article list */}
        <div className="space-y-3">
          {articles.map((article, i) => (
            <div
              key={article.url}
              className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)] hover:border-gold/20 transition-all group"
            >
              {article.image && (
                <img
                  src={article.image}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                  {article.title || article.url}
                </p>
                {article.description && (
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                    {article.description}
                  </p>
                )}
                <p className="text-[10px] text-[var(--text-tertiary)] font-mono mt-1">
                  {article.siteName || new URL(article.url).hostname}
                </p>
              </div>
              <button
                onClick={() => removeArticle(i)}
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-tertiary)] hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                title="Remove"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-6 text-[var(--text-tertiary)]">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
            </svg>
            <p className="text-xs">No articles yet. Add a link above.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
