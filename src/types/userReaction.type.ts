export type UserReactionAction = 'like' | 'dislike' | 'violate';

export type UserReaction = {
  comment: string;
  action: UserReactionAction;
};

export type CommentReactionType = UserReactionAction | null;
