import { FormEvent, useEffect, useState } from 'react';
import { apiFetch } from '../lib/apiClient';
import { Post, User } from '../types';
import { PostCard } from '../components/PostCard';

type Tab = 'all' | 'following';

export default function TimelinePage() {
  const [tab, setTab] = useState<Tab>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [me, setMe] = useState<User | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPosts = async () => {
    try {
      const url = tab === 'all' ? '/posts' : '/posts/timeline';
      const data = await apiFetch<Post[]>(url);
      setPosts(data);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : '読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    apiFetch<User>('/auth/me')
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    loadPosts();
  }, [tab]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (content.trim() === '') {
      return;
    }
    try {
      await apiFetch('/posts', {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      setContent('');
      await loadPosts();
    } catch (e) {
      setError(e instanceof Error ? e.message : '投稿に失敗しました');
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('この投稿を削除しますか？')) {
      return;
    }
    try {
      await apiFetch(`/posts/${postId}`, { method: 'DELETE' });
      await loadPosts();
    } catch (e) {
      setError(e instanceof Error ? e.message : '削除に失敗しました');
    }
  };

  const handleToggleLike = async (post: Post) => {
    try {
      if (post.likedByMe) {
        await apiFetch(`/posts/${post.id}/likes`, { method: 'DELETE' });
      } else {
        await apiFetch(`/posts/${post.id}/likes`, { method: 'POST' });
      }
      await loadPosts();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'いいねの操作に失敗しました');
    }
  };

  if (loading) {
    return <p>読み込み中...</p>;
  }

  return (
    <div className="timeline">
      <form className="post-form" onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={280}
          rows={3}
          placeholder="いまどうしてる？"
        />
        <div className="post-form-footer">
          <span className="char-count">{content.length}/280</span>
          <button type="submit" disabled={content.trim() === ''}>
            投稿する
          </button>
        </div>
      </form>

      <div>
        <button onClick={() => setTab('all')} disabled={tab === 'all'}>
          全体
        </button>
        <button
          onClick={() => setTab('following')}
          disabled={tab === 'following'}
        >
          フォロー中
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {posts.length === 0 ? (
        <p>
          {tab === 'following'
            ? 'フォロー中のユーザーの投稿がまだありません。'
            : 'まだ投稿がありません。最初の投稿をしてみましょう。'}
        </p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={me?.id ?? null}
            onDelete={handleDelete}
            onToggleLike={handleToggleLike}
          />
        ))
      )}
    </div>
  );
}
