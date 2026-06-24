import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiClient";
import { User } from "../types";

type Me = User & { email: string };

export function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Me>("/auth/me")
      .then((me) => {
        setDisplayName(me.displayName);
        setBio(me.bio);
        setAvatarUrl(me.avatarUrl);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ displayName, bio }),
      });
      setMessage("プロフィールを保存しました");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    setError("");
    try {
      // 1. APIからアップロード用のpresigned URLをもらう
      const { uploadUrl, publicUrl } = await apiFetch<{
        uploadUrl: string;
        publicUrl: string;
      }>("/users/me/avatar-upload-url", {
        method: "POST",
        body: JSON.stringify({ contentType: file.type }),
      });

      // 2. S3へ直接PUTする（送り先はAPIサーバーではないのでapiFetchは使わない）
      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) {
        throw new Error("画像のアップロードに失敗しました");
      }

      // 3. 公開URLをプロフィールに保存する
      await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ avatarUrl: publicUrl }),
      });
      setAvatarUrl(publicUrl);
      setMessage("アイコンを更新しました");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (loading) return <p>読み込み中...</p>;

  return (
    <div>
      <h2>設定</h2>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <section>
        <h3>アイコン画像</h3>
        {avatarUrl ? (
          <img src={avatarUrl} alt="アイコン" className="avatar avatar-large" />
        ) : (
          <p>アイコンは未設定です</p>
        )}
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading && <p>アップロード中...</p>}
      </section>

      <section>
        <h3>プロフィール</h3>
        <form onSubmit={handleSubmit}>
          <label>
            表示名
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              required
            />
          </label>
          <label>
            自己紹介（160文字まで）
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
            />
          </label>
          <button type="submit" disabled={saving}>
            {saving ? "保存中..." : "保存する"}
          </button>
        </form>
      </section>
    </div>
  );
}
