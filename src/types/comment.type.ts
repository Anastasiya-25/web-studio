import {UserInfoType} from "./user-info.type";
import {CommentReactionType} from "./userReaction.type";

export type CommentType = {
  id: string,
  text: string,
  date: string,
  likesCount: number,
  dislikesCount: number,
  user: UserInfoType,
  userReaction?: CommentReactionType
}

export type AddCommentType = {
  article: string,
  text: string,
}
