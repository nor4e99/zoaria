'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Play, Search, Globe, Tag, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { hubApi } from '@/lib/api';
import { useLangStore } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

/* ─── Article Card ────────────────────────────────────────────────────────── */
function ArticleCard({ article, index }: { article: any; index: number }) {
  const [expanded, setExpanded] = useState(false);

  // Derive a tag color based on article id
  const tagColors = [
    'bg-brand-100 text-brand-700',
    'bg-sage-100 text-sage-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-700',
    'bg-blue-100 text-blue-700',
  ];
  const tagColor = tagColors[article.id % tagColors.length];

  const tags = article.tags ? article.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
  const preview = article.content?.slice(0, 180);
  const hasMore = article.content?.length > 180;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="zoaria-card hover:shadow-card-hover transition-all group"
    >
      {/* Top bar accent */}
      <div className="h-1 w-12 bg-brand-400 rounded-full mb-4 group-hover:w-20 transition-all duration-300" />

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((tag: string) => (
            <span key={tag} className={cn('badge text-xs', tagColor)}>
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}

      <h3 className="font-display font-bold text-obsidian-900 text-lg leading-snug mb-2 group-hover:text-brand-700 transition-colors">
        {article.title}
      </h3>

      {/* Content preview */}
      <div className={cn('text-sm text-obsidian-600 leading-relaxed', !expanded && 'line-clamp-3')}>
        {article.content}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-brand-600 hover:text-brand-700 font-semibold mt-2 flex items-center gap-1"
        >
          {expanded ? 'Show less' : 'Read more'}
          <ChevronRight className={cn('w-3 h-3 transition-transform', expanded && 'rotate-90')} />
        </button>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-sage-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center">
            <span className="text-xs font-bold text-brand-700">
              {(article.author_name || 'Z')[0].toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-obsidian-500">{article.author_name || 'ZOARIA'}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-obsidian-400">
          <Clock className="w-3 h-3" />
          {article.created_at && format(parseISO(article.created_at), 'MMM d, yyyy')}
        </div>
      </div>
    </motion.article>
  );
}

/* ─── Video Card ─────────────────────────────────────────────────────────── */
function VideoCard({ video, index }: { video: any; index: number }) {
  // Extract YouTube/Vimeo thumbnail if possible
  const getYtId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&\n?]+)/);
    return match?.[1];
  };
  const ytId = getYtId(video.video_url || '');
  const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="zoaria-card hover:shadow-card-hover transition-all group overflow-hidden p-0"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-obsidian-800 overflow-hidden">
        {thumb
          ? <img src={thumb} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center">
              <Play className="w-12 h-12 text-obsidian-400" />
            </div>
        }
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-obsidian-950/30 opacity-0 group-hover:opacity-100 transition-opacity">
          <a href={video.video_url} target="_blank" rel="noopener noreferrer"
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-brand-600 ml-0.5" fill="currentColor" />
          </a>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-obsidian-900 leading-snug group-hover:text-brand-700 transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-obsidian-400">
            {video.created_at && format(parseISO(video.created_at), 'MMM d, yyyy')}
          </span>
          <a href={video.video_url} target="_blank" rel="noopener noreferrer"
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1">
            Watch <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Hub Page ──────────────────────────────────────────────────────── */
export default function HubPage() {
  const { lang } = useLangStore();
  const [activeTab, setActiveTab] = useState<'articles' | 'videos'>('articles');
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState(lang);

  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ['hub-articles', langFilter],
    queryFn: () => hubApi.articles(langFilter).then(r => r.data.results || r.data),
  });

  const { data: videos = [], isLoading: videosLoading } = useQuery({
    queryKey: ['hub-videos', langFilter],
    queryFn: () => hubApi.videos(langFilter).then(r => r.data.results || r.data),
    enabled: activeTab === 'videos',
  });

  const filteredArticles = (articles as any[]).filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.tags?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredVideos = (videos as any[]).filter(v =>
    !search || v.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl bg-obsidian-900 p-8 sm:p-12">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-sage-500/15 rounded-full blur-2xl translate-y-1/2 pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-400" />
            </div>
            <span className="text-brand-400 text-sm font-semibold tracking-wide uppercase">
              Veterinary Knowledge Hub
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">
            Expert Pet Health<br />
            <em className="text-brand-400 not-italic">Knowledge & Guides</em>
          </h1>
          <p className="text-obsidian-300 text-lg max-w-xl leading-relaxed">
            Curated articles and videos from certified veterinarians on nutrition, health, and care for all species.
          </p>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-sage-100 rounded-2xl">
          {[
            { key: 'articles', label: 'Articles', icon: BookOpen },
            { key: 'videos',   label: 'Videos',   icon: Play },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                activeTab === key
                  ? 'bg-white text-brand-700 shadow-card'
                  : 'text-obsidian-500 hover:text-obsidian-700'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-400" />
            <input
              type="text"
              placeholder={activeTab === 'articles' ? 'Search articles...' : 'Search videos...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-base pl-10 py-2.5 text-sm"
            />
          </div>

          {/* Language filter */}
          <div className="flex items-center gap-1.5 px-3 py-2.5 bg-white rounded-2xl border border-sage-200 text-sm">
            <Globe className="w-4 h-4 text-obsidian-400" />
            <select value={langFilter} onChange={e => setLangFilter(e.target.value as 'en' | 'bg')}
              className="bg-transparent text-obsidian-700 font-medium outline-none cursor-pointer">
              <option value="en">EN</option>
              <option value="bg">BG</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'articles' && (
          <motion.div key="articles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {articlesLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-56 skeleton rounded-3xl" />)}
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="w-12 h-12 text-obsidian-300 mx-auto mb-4" />
                <h3 className="font-semibold text-obsidian-900 mb-1">No articles found</h3>
                <p className="text-sm text-obsidian-500">
                  {search ? `No results for "${search}"` : 'No articles available yet'}
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredArticles.map((article, i) => (
                  <ArticleCard key={article.id} article={article} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'videos' && (
          <motion.div key="videos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {videosLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3].map(i => <div key={i} className="h-48 skeleton rounded-3xl" />)}
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-20">
                <Play className="w-12 h-12 text-obsidian-300 mx-auto mb-4" />
                <h3 className="font-semibold text-obsidian-900 mb-1">No videos found</h3>
                <p className="text-sm text-obsidian-500">
                  {search ? `No results for "${search}"` : 'No videos available yet'}
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredVideos.map((video, i) => (
                  <VideoCard key={video.id} video={video} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
