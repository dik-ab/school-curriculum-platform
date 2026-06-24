export type User = {
  id: number;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
};

export type Post = {
  id: number;
  content: string;
  createdAt: string;
  author: User;
  likeCount: number;
  likedByMe: boolean;
};

export type UserProfile = User & {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
};

export type Message = {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
};

export type Conversation = {
  id: number;
  partner: User;
  lastMessage: Message | null;
};
