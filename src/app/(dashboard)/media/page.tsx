'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface MediaItem {
  id: string;
  type: string;
  url: string;
  thumbnailUrl: string | null;
  title: string | null;
  viewCount: number;
  isFeatured: boolean;
  createdAt: string;
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'video' | 'image'>('all');

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/media/upload');
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
      }
    } catch {
      // Use empty array on error
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', file.type.startsWith('video/') ? 'video' : 'image');
        formData.append('title', file.name.replace(/\.[^.]+$/, ''));

        const res = await fetch('/api/media/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          setMedia((prev) => [data, ...prev]);
        }
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const filtered = filter === 'all' ? media : media.filter((m) => m.type === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <p className="section-label mb-1">Showcase</p>
          <h1 className="font-heading text-4xl font-bold">Media Library</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Upload videos and photos to showcase your skills
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleUpload}
              className="hidden"
            />
            <Button variant="primary" loading={uploading} onClick={() => {}}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Upload Media
            </Button>
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 animate-in-delay-1">
        {(['all', 'video', 'image'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border',
              filter === f
                ? 'bg-gradient-to-r from-maroon to-maroon-bright text-white border-maroon shadow-lg shadow-maroon/20'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:text-[var(--text-primary)] hover:border-gold/30'
            )}
          >
            {f === 'all' ? 'All' : f === 'video' ? 'Videos' : 'Photos'}
          </button>
        ))}
        <span className="text-sm text-[var(--text-tertiary)] self-center ml-3 font-mono">
          <span className="text-gold font-bold">{filtered.length}</span> items
        </span>
      </div>

      {/* Upload Zone */}
      {media.length === 0 && (
        <label className="cursor-pointer block animate-in-delay-2">
          <input type="file" accept="image/*,video/*" multiple onChange={handleUpload} className="hidden" />
          <Card className="border-2 border-dashed border-[var(--border-primary)] hover:border-gold/40 transition-all duration-300 hover:shadow-glow-gold/10">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-maroon/10 border border-maroon/20 flex items-center justify-center mb-5">
                <svg className="w-10 h-10 text-gold/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="text-lg font-heading font-bold text-[var(--text-primary)] mb-1">Upload Your Best Moments</p>
              <p className="text-sm text-[var(--text-secondary)]">Drag and drop files or click to browse</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-2">Supports images and videos up to 100MB</p>
            </div>
          </Card>
        </label>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in-delay-2">
          {filtered.map((item) => (
            <div key={item.id} className="group relative aspect-video rounded-xl overflow-hidden bg-[var(--bg-tertiary)] cursor-pointer border border-[var(--border-secondary)] hover:border-maroon/30 transition-all duration-300 hover:shadow-glow-maroon hover:-translate-y-[2px]">
              {item.type === 'video' ? (
                <>
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.title || ''} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-maroon/5">
                      <svg className="w-8 h-8 text-[var(--text-tertiary)]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40">
                    <div className="w-12 h-12 rounded-full bg-maroon/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                </>
              ) : (
                <img src={item.url} alt={item.title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              )}

              {/* Overlay info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-xs text-white font-medium truncate">{item.title || 'Untitled'}</p>
                <p className="text-[10px] text-white/60 font-mono">{item.viewCount} views</p>
              </div>

              {item.isFeatured && (
                <div className="absolute top-2 right-2 bg-gold text-maroon-dark text-[10px] font-bold px-2.5 py-1 rounded-full shadow-glow-gold/30">
                  Featured
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
