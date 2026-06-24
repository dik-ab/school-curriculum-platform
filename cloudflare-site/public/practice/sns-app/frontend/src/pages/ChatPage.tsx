import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { apiFetch } from '../lib/apiClient';
import type { Conversation, Message, User } from '../types';

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [meId, setMeId] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const socketRef = useRef<Socket | null>(null);

  // 1. WebSocket接続（マウント時に1回だけ。アンマウントで切断）
  useEffect(() => {
    const socket = io(`${import.meta.env.VITE_API_URL}/chat`, {
      auth: { token: localStorage.getItem('token') },
    });
    socketRef.current = socket;
    return () => {
      socket.disconnect();
    };
  }, []);

  // 2. 会話一覧と自分のIDを取得（REST）
  useEffect(() => {
    apiFetch<Conversation[]>('/conversations')
      .then(setConversations)
      .catch((e) =>
        setError(e instanceof Error ? e.message : 'エラーが発生しました'),
      );
    apiFetch<User>('/auth/me').then((me) => setMeId(me.id));
  }, []);

  // 3. 会話を選んだら: 履歴を取得し、roomに入り、newMessageを購読
  useEffect(() => {
    if (selected === null) return;
    const socket = socketRef.current;
    if (socket === null) return;

    apiFetch<Message[]>(`/conversations/${selected.id}/messages`)
      .then(setMessages)
      .catch((e) =>
        setError(e instanceof Error ? e.message : 'エラーが発生しました'),
      );
    socket.emit('joinConversation', { conversationId: selected.id });

    const handleNewMessage = (message: Message) => {
      if (message.conversationId !== selected.id) return;
      setMessages((prev) => [...prev, message]);
    };
    socket.on('newMessage', handleNewMessage);
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [selected]);

  const startConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === '') return;
    try {
      const conversation = await apiFetch<Conversation>('/conversations', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });
      setConversations((prev) =>
        prev.some((c) => c.id === conversation.id)
          ? prev
          : [conversation, ...prev],
      );
      setSelected(conversation);
      setUsername('');
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected === null || text.trim() === '') return;
    socketRef.current?.emit('sendMessage', {
      conversationId: selected.id,
      content: text,
    });
    setText('');
  };

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        <form onSubmit={startConversation}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ユーザー名"
          />
          <button type="submit">会話を開始</button>
        </form>
        {error !== '' && <p>{error}</p>}
        <ul>
          {conversations.map((c) => (
            <li key={c.id}>
              <button onClick={() => setSelected(c)}>
                <strong>{c.partner.displayName}</strong>
                <br />
                <small>
                  {c.lastMessage?.content ?? '（メッセージはまだありません）'}
                </small>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <main className="chat-main">
        {selected === null ? (
          <p>左の一覧から会話を選ぶか、新しい会話を開始してください。</p>
        ) : (
          <>
            <h2>{selected.partner.displayName} さんとの会話</h2>
            <div className="chat-messages">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.senderId === meId ? 'message message-mine' : 'message'
                  }
                >
                  <p>{m.content}</p>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="メッセージを入力"
                maxLength={1000}
              />
              <button type="submit">送信</button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
