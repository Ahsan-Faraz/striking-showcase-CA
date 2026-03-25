"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

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

interface MediaLimits {
  isPro: boolean;
  plan: string;
  photoCount: number;
  videoCount: number;
  maxPhotos: number | null;
  maxVideos: number | null;
  remainingPhotos: number | null;
  remainingVideos: number | null;
}

// Extract YouTube/Vimeo video ID and build embed thumbnail
function parseVideoUrl(
  url: string,
): { provider: "youtube" | "vimeo"; id: string; thumbnail: string } | null {
  // YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (ytMatch) {
    return {
      provider: "youtube",
      id: ytMatch[1],
      thumbnail: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
    };
  }
  // Vimeo: vimeo.com/ID
  const vmMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vmMatch) {
    return { provider: "vimeo", id: vmMatch[1], thumbnail: "" };
  }
  return null;
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [limits, setLimits] = useState<MediaLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<"all" | "video" | "image">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [addingVideo, setAddingVideo] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch("/api/media/upload");
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
        setLimits(data.limits || null);
      }
    } catch {
      // empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    if (!limits?.isPro && (limits.remainingPhotos ?? 0) <= 0) {
      setErrorMessage(
        "Free plan includes up to 3 photos. Upgrade to Pro for unlimited media.",
      );
      e.target.value = "";
      return;
    }

    if (
      !limits?.isPro &&
      limits.remainingPhotos !== null &&
      files.length > limits.remainingPhotos
    ) {
      setErrorMessage(
        `You can upload ${limits.remainingPhotos} more photo${limits.remainingPhotos === 1 ? "" : "s"} on the Free plan.`,
      );
      e.target.value = "";
      return;
    }

    setErrorMessage(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "type",
          file.type.startsWith("video/") ? "video" : "image",
        );
        formData.append("title", file.name.replace(/\.[^.]+$/, ""));
        const res = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          setMedia((prev) => [data, ...prev]);
        } else {
          const data = await res.json().catch(() => null);
          setErrorMessage(data?.error || "Upload failed.");
          break;
        }
      }
    } catch {
      setErrorMessage("Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
      await fetchMedia();
    }
  };

  const handleAddVideo = async () => {
    const parsed = parseVideoUrl(videoUrl.trim());
    if (!parsed) return;

    if (!limits?.isPro && (limits.remainingVideos ?? 0) <= 0) {
      setErrorMessage(
        "Free plan includes 1 video. Upgrade to Pro for unlimited media.",
      );
      return;
    }

    setErrorMessage(null);
    setAddingVideo(true);
    try {
      const formData = new FormData();
      formData.append("videoUrl", videoUrl.trim());
      formData.append("type", "video");
      formData.append("title", videoTitle.trim() || `${parsed.provider} video`);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setMedia((prev) => [data, ...prev]);
        setVideoUrl("");
        setVideoTitle("");
        setShowVideoForm(false);
      } else {
        const data = await res.json().catch(() => null);
        setErrorMessage(data?.error || "Unable to add video.");
      }
    } catch {
      setErrorMessage("Unable to add video.");
    } finally {
      setAddingVideo(false);
      await fetchMedia();
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    // Optimistic update
    setMedia((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isFeatured: !current } : m)),
    );
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !current }),
      });
      if (!res.ok) {
        setMedia((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isFeatured: current } : m)),
        );
      }
    } catch {
      setMedia((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isFeatured: current } : m)),
      );
    }
  };

  const handleDelete = async (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
    setDeleteConfirm(null);
    setSelected(null);
    try {
      await fetch(`/api/media/${id}`, { method: "DELETE" });
    } catch {
      fetchMedia(); // refetch on failure
    }
  };

  const filtered =
    filter === "all" ? media : media.filter((m) => m.type === filter);
  const selectedItem = media.find((m) => m.id === selected);
  const photoCount = media.filter((m) => m.type === "image").length;
  const videoCount = media.filter((m) => m.type === "video").length;
  const photoLimitReached =
    !limits?.isPro && (limits?.remainingPhotos ?? 0) <= 0;
  const videoLimitReached =
    !limits?.isPro && (limits?.remainingVideos ?? 0) <= 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <p className="section-label mb-1">Showcase</p>
          <h1 className="font-heading text-4xl font-bold">Media Library</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Upload photos and add video links to showcase your skills
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setErrorMessage(null);
              setShowVideoForm(true);
            }}
            disabled={videoLimitReached}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.757 8.98"
              />
            </svg>
            Add Video URL
          </Button>
          <label
            className={cn(
              "cursor-pointer",
              photoLimitReached && "cursor-not-allowed opacity-60",
            )}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              disabled={photoLimitReached}
              className="hidden"
            />
            <span
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl text-white transition-opacity",
                photoLimitReached
                  ? "bg-[var(--text-tertiary)] cursor-not-allowed"
                  : "bg-[var(--accent-bright)] hover:opacity-90 cursor-pointer",
              )}
            >
              {uploading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              )}
              Upload Photos
            </span>
          </label>
        </div>
      </div>

      <Card className="animate-in-delay-1 border-t-2 border-t-gold/30">
        <CardContent className="py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {limits?.isPro
                ? "Pro plan: unlimited media uploads"
                : "Free plan: 3 photos and 1 video"}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {limits?.isPro
                ? `${photoCount} photo${photoCount === 1 ? "" : "s"} and ${videoCount} video${videoCount === 1 ? "" : "s"} uploaded.`
                : `${limits?.remainingPhotos ?? 0} photo${(limits?.remainingPhotos ?? 0) === 1 ? "" : "s"} left, ${limits?.remainingVideos ?? 0} video${(limits?.remainingVideos ?? 0) === 1 ? "" : "s"} left.`}
            </p>
          </div>
          {!limits?.isPro && (
            <Link
              href="/settings?upgrade=media"
              className="inline-flex items-center justify-center rounded-xl bg-maroon px-4 py-2 text-sm font-semibold text-white hover:bg-maroon-bright transition-colors"
            >
              Upgrade to Pro
            </Link>
          )}
        </CardContent>
      </Card>

      {errorMessage && (
        <Card className="border border-red-500/30 bg-red-500/5">
          <CardContent className="py-4">
            <p className="text-sm text-red-300">{errorMessage}</p>
          </CardContent>
        </Card>
      )}

      {/* Video URL Form */}
      {showVideoForm && (
        <Card className="animate-in border-t-2 border-t-gold/30">
          <CardHeader>
            <CardTitle>Add Video Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">
              Paste a YouTube or Vimeo URL. Video will be embedded on your
              public profile.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
                  Video URL *
                </label>
                <input
                  className="input"
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
                {videoUrl && !parseVideoUrl(videoUrl) && (
                  <p className="text-xs text-red-400 mt-1">
                    Enter a valid YouTube or Vimeo URL
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
                  Title (optional)
                </label>
                <input
                  className="input"
                  placeholder="e.g. State Championship Finals"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                />
              </div>
            </div>
            {videoUrl && parseVideoUrl(videoUrl)?.thumbnail && (
              <div className="flex items-center gap-3">
                <img
                  src={parseVideoUrl(videoUrl)!.thumbnail}
                  alt="Video thumbnail"
                  className="w-32 aspect-video rounded-lg object-cover border border-[var(--border-secondary)]"
                />
                <span className="text-xs text-[var(--text-tertiary)]">
                  Preview thumbnail
                </span>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowVideoForm(false);
                  setVideoUrl("");
                  setVideoTitle("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddVideo}
                loading={addingVideo}
                disabled={
                  !videoUrl.trim() ||
                  !parseVideoUrl(videoUrl.trim()) ||
                  videoLimitReached
                }
              >
                Add Video
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats + Filters */}
      <div className="flex items-center justify-between animate-in-delay-1">
        <div className="flex gap-2">
          {(["all", "video", "image"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border",
                filter === f
                  ? "bg-gradient-to-r from-maroon to-maroon-bright text-white border-maroon shadow-lg shadow-maroon/20"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:text-[var(--text-primary)] hover:border-gold/30",
              )}
            >
              {f === "all"
                ? `All (${media.length})`
                : f === "video"
                  ? `Videos (${videoCount})`
                  : `Photos (${photoCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-6 h-6 border-2 border-gold border-t-transparent rounded-full" />
        </div>
      )}

      {/* Empty State */}
      {!loading && media.length === 0 && (
        <div className="grid grid-cols-2 gap-4 animate-in-delay-2">
          <label
            className={cn(
              "block",
              photoLimitReached
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer",
            )}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              disabled={photoLimitReached}
              className="hidden"
            />
            <Card className="border-2 border-dashed border-[var(--border-primary)] hover:border-gold/40 transition-all duration-300">
              <div className="flex flex-col items-center justify-center py-14">
                <div className="w-14 h-14 rounded-2xl bg-maroon/10 border border-maroon/20 flex items-center justify-center mb-4">
                  <svg
                    className="w-7 h-7 text-gold/60"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                    />
                  </svg>
                </div>
                <p className="font-heading font-bold text-[var(--text-primary)] mb-1">
                  Upload Photos
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  JPG, PNG up to 10MB
                </p>
              </div>
            </Card>
          </label>
          <Card
            className={cn(
              "border-2 border-dashed border-[var(--border-primary)] transition-all duration-300",
              videoLimitReached
                ? "opacity-60 cursor-not-allowed"
                : "hover:border-gold/40 cursor-pointer",
            )}
            onClick={() => {
              if (videoLimitReached) return;
              setErrorMessage(null);
              setShowVideoForm(true);
            }}
          >
            <div className="flex flex-col items-center justify-center py-14">
              <div className="w-14 h-14 rounded-2xl bg-maroon/10 border border-maroon/20 flex items-center justify-center mb-4">
                <svg
                  className="w-7 h-7 text-gold/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
                  />
                </svg>
              </div>
              <p className="font-heading font-bold text-[var(--text-primary)] mb-1">
                Add Video Link
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">
                YouTube or Vimeo URL
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in-delay-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelected(item.id)}
              className={cn(
                "group relative aspect-video rounded-xl overflow-hidden bg-[var(--bg-tertiary)] cursor-pointer border transition-all duration-300 hover:-translate-y-[2px]",
                selected === item.id
                  ? "border-gold ring-2 ring-gold/20 shadow-glow-gold"
                  : "border-[var(--border-secondary)] hover:border-maroon/30 hover:shadow-glow-maroon",
              )}
            >
              {item.type === "video" ? (
                <>
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title || ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-maroon/5">
                      <svg
                        className="w-8 h-8 text-[var(--text-tertiary)]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40">
                    <div className="w-12 h-12 rounded-full bg-maroon/80 backdrop-blur-sm flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white ml-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                </>
              ) : (
                <img
                  src={item.url}
                  alt={item.title || ""}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}

              {/* Overlay info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-xs text-white font-medium truncate">
                  {item.title || "Untitled"}
                </p>
                <p className="text-[10px] text-white/60 font-mono">
                  {item.viewCount} views
                </p>
              </div>

              {item.isFeatured && (
                <div className="absolute top-2 left-2 bg-gold text-maroon-dark text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ★ Featured
                </div>
              )}
              {item.type === "video" && (
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
                  Video
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {selectedItem && (
        <Card className="animate-in border-t-2 border-t-gold/30">
          <CardContent className="py-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-24 aspect-video rounded-lg overflow-hidden bg-[var(--bg-tertiary)] border border-[var(--border-secondary)]">
                  {selectedItem.type === "video" &&
                  selectedItem.thumbnailUrl ? (
                    <img
                      src={selectedItem.thumbnailUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : selectedItem.type === "image" ? (
                    <img
                      src={selectedItem.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-[var(--text-tertiary)]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {selectedItem.title || "Untitled"}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] font-mono mt-0.5">
                    {selectedItem.type === "video" ? "Video" : "Photo"} ·{" "}
                    {selectedItem.viewCount} views · Added{" "}
                    {new Date(selectedItem.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleToggleFeatured(
                      selectedItem.id,
                      selectedItem.isFeatured,
                    )
                  }
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all",
                    selectedItem.isFeatured
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-gold/30",
                  )}
                >
                  {selectedItem.isFeatured ? "★ Featured" : "☆ Set Featured"}
                </button>
                {deleteConfirm === selectedItem.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(selectedItem.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(selectedItem.id)}
                    className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
