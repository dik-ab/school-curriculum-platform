import { useEffect, useState } from 'react';
import { PostCard } from '../components/PostCard';
import { useHashRoute } from '../hooks/useHashRoute';
import { apiFetch } from '../lib/apiClient';
import type { Post, User, UserProfile } from '../types';

export default function UserPage() {
  const { path } = useHashRoute();
  const username = path.replace('/users/', '');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [me, setMe] = useState<User | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [profileData, postsData] = await Promise.all([
        apiFetch<UserProfile>(`/users/${username}`),
        apiFetch<Post[]>(`/users/${username}/posts`),
      ]);
      setProfile(profileData);
      setPosts(postsData);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    }
  };

  useEffect(() => {
    apiFetch<User>('/auth/me')
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    load();
  }, [username]);

  const toggleFollow = async () => {
    if (profile === null) return;
    try {
      await apiFetch(`/users/${username}/follow`, {
        method: profile.isFollowing ? 'DELETE' : 'POST',
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('この投稿を削除しますか？')) {
      return;
    }
    try {
      await apiFetch(`/posts/${postId}`, { method: 'DELETE' });
      await load();
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
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'いいねの操作に失敗しました');
    }
  };

  if (profile === null) {
    return <p>{error !== '' ? error : '読み込み中...'}</p>;
  }

  return (
    <>
      {error !== '' && <p>{error}</p>}
      <section>
        <h2>{profile.displayName}</h2>
        <p>@{profile.username}</p>
        {profile.bio !== '' && <p>{profile.bio}</p>}
        <p>
          フォロー {profile.followingCount} ／ フォロワー{' '}
          {profile.followersCount}
        </p>
        <button onClick={toggleFollow}>
          {profile.isFollowing ? 'フォロー解除' : 'フォローする'}
        </button>
      </section>
      <section>
        <h3>投稿</h3>
        {posts.length === 0 && <p>まだ投稿がありません。</p>}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={me?.id ?? null}
            onDelete={handleDelete}
            onToggleLike={handleToggleLike}
          />
        ))}
      </section>
    </>
  );
}
