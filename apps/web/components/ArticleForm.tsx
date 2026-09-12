"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MIN_ARTICLE_CHARS } from "@/lib/articles";
import { FIXED_TAGS } from "@/lib/tags";
import { useArticles } from "./ArticlesProvider";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import Icon from "./ui/Icon";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function ArticleForm() {
  const router = useRouter();
  const { reload } = useArticles();
  const [creator, setCreator] = useState("pippo.nectar.eth");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      setImagePreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [image]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (content.length < MIN_ARTICLE_CHARS) {
      const message = `Your article needs at least ${MIN_ARTICLE_CHARS.toLocaleString()} characters.`;
      setError(message);
      toast.error("Article is too short", { description: message });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("creator", creator);
      formData.append("title", title);
      formData.append("subtitle", subtitle);
      formData.append("content", content);
      formData.append("tags", JSON.stringify(tags));
      formData.append("premium", String(premium));
      if (image) formData.append("image", image);

      const res = await fetch("/api/articles", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Publish failed");
      toast.success("Published", { description: "Article is live." });
      try {
        await reload();
      } catch {
        // The publication succeeded; a later context refresh can recover the list.
      }
      router.push(`/article/${data.swarmRef}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Publish failed";
      setError(message);
      toast.error("Publish failed", { description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative mx-auto flex h-full min-h-0 w-full max-w-[1280px] flex-col px-8 py-6 pb-10 md:pl-16 md:pr-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-8 top-10 hidden w-4 md:block"
      >
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-honey shadow-[0_0_0_4px_rgba(232,163,61,0.14)]" />
        <span className="absolute bottom-3 left-1/2 top-5 w-px -translate-x-1/2 bg-gradient-to-b from-honey/70 via-line to-honey/20" />
        <span className="absolute bottom-0 left-0 h-px w-4 bg-honey/50" />
        <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border border-honey bg-paper" />
      </div>
      <form
        id="write-form"
        onSubmit={handleSubmit}
        className="mt-6 flex min-h-0 flex-1 flex-col gap-2"
      >
        {/* Title */}
        <input
          className="font-display text-headline-lg h-[1.1em] w-full bg-transparent leading-[1.1] text-ink outline-none placeholder:text-[#b7a98f] max-md:text-[32px] max-md:leading-[1.2]"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title of your article..."
          disabled={loading}
          required
        />
        {/* Subtitle */}
        <textarea
          className="font-display text-headline-sm mt-3 min-h-[2.4em] w-full resize-none bg-transparent italic leading-[1.2] text-muted outline-none placeholder:text-[#c9bb9f]"
          rows={2}
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="A subtitle to frame the article..."
          disabled={loading}
        />

        <div className="grid h-full min-h-0 flex-1 gap-8 pt-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="flex h-full min-h-0 min-w-0 flex-col gap-5">
            {/* Tags */}
            <div>
              <span className="text-label-md text-muted">Tags</span>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {FIXED_TAGS.map((t) => {
                  const active = tags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setTags((prev) =>
                          active ? prev.filter((x) => x !== t) : [...prev, t],
                        )
                      }
                      disabled={loading}
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 text-[14px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${active ? "bg-wood text-cream" : "bg-paper-raised text-muted hover:bg-[#ece3d0] hover:text-ink"}`}
                    >
                      #{t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <textarea
              className="text-body-lg min-h-[360px] w-full min-w-0 flex-1 resize-none bg-transparent leading-relaxed text-ink outline-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="The full article body, stored on Swarm..."
              minLength={MIN_ARTICLE_CHARS}
              disabled={loading}
              required
            />
            <div className="flex items-center justify-between gap-4 font-mono text-[12px] text-muted">
              <span>
                Minimum {MIN_ARTICLE_CHARS.toLocaleString()} characters required
              </span>
              <span className={content.length < MIN_ARTICLE_CHARS ? "text-rust" : "text-sage"}>
                {content.length.toLocaleString()} / {MIN_ARTICLE_CHARS.toLocaleString()}
              </span>
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            {/* Cover image */}
            <div className="rounded-lg border border-line bg-paper-raised p-5">
              <div className="flex flex-col items-start gap-4">
                <div>
                  <div className="text-label-md text-ink">Cover image</div>
                  <p className="text-body-sm mt-1 text-muted">Optional public image, stored on Swarm.</p>
                </div>
                <label
                  htmlFor="cover-image"
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-paper-card px-4 py-2 text-[14px] font-medium text-ink transition hover:bg-paper-card/70 ${loading ? "pointer-events-none opacity-50" : ""}`}
                >
                  <Icon name="image" size={18} />
                  {image ? "Change image" : "Choose image"}
                </label>
                <input
                  id="cover-image"
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const selected = e.target.files?.[0] ?? null;
                    if (selected && selected.size > MAX_IMAGE_BYTES) {
                      toast.error("Image is too large", { description: "Choose an image smaller than 5 MB." });
                      e.target.value = "";
                      setImage(null);
                      return;
                    }
                    setImage(selected);
                  }}
                  disabled={loading}
                />
              </div>
              {image && (
                <div className="mt-4 flex flex-col gap-3">
                  {imagePreview && (
                    <div className="h-40 w-full overflow-hidden rounded-md border border-line bg-paper-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Cover image preview" className="h-full w-full object-cover object-top" />
                    </div>
                  )}
                  <div className="flex min-w-0 items-center gap-2 font-mono text-[12px] text-muted">
                    <Icon name="check_circle" size={16} />
                    <span className="truncate">{image.name}</span>
                    <span>({(image.size / 1024 / 1024).toFixed(1)} MB)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Access control */}
            <section className="rounded-lg border border-line bg-paper-raised p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber/20 text-amber">
                    <Icon name="lock" size={20} fill />
                  </span>
                  <span className="font-display text-title-lg">Premium content</span>
                </div>
                <label className={`relative inline-flex items-center ${loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
                  <input
                    className="peer sr-only"
                    type="checkbox"
                    checked={premium}
                    onChange={(e) => setPremium(e.target.checked)}
                    disabled={loading}
                  />
                  <span className="relative h-8 w-14 rounded-full bg-line-strong transition-colors after:absolute after:left-1 after:top-1 after:h-6 after:w-6 after:rounded-full after:bg-paper-card after:transition-transform peer-checked:bg-honey peer-checked:after:translate-x-6" />
                </label>
              </div>
            </section>
          </aside>
        </div>
      </form>

      <div className="mt-8 grid gap-4 border-t border-line pt-5 sm:grid-cols-2 sm:items-start">
        <div className="inline-flex items-center gap-3 justify-self-start rounded-full bg-paper-raised px-4 py-2.5">
          <Avatar size={28} name={creator} />
          <span className="text-body-sm text-muted">Writing as</span>
          <span className="font-mono text-[13px] font-semibold">@{creator}</span>
        </div>
        <Button
          type="submit"
          form="write-form"
          icon="cloud_upload"
          disabled={loading || content.length < MIN_ARTICLE_CHARS}
          className="h-[48px] justify-self-start sm:justify-self-end"
        >
          {loading ? "Broadcasting…" : "Publish Article"}
        </Button>
      </div>

      {error && <div className="mt-4 rounded-md border border-rust bg-paper-raised p-4 text-[14px] text-rust [overflow-wrap:anywhere]">{error}</div>}

    </div>
  );
}
