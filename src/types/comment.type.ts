import {UserInfoType} from "./user-info.type";

export type CommentType = {
  id: string,
  text: string,
  date: string,
  likesCount: number,
  dislikesCount: number,
  user: UserInfoType,
}

export type AddCommentType = {
  id: string,
  text: string,
}
