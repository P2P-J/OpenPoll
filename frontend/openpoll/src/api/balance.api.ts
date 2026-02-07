import { apiClient } from "./client";
import type {
  BalanceListItem,
  BalanceDetail,
  BalanceVoteOption,
  BalanceComment,
} from "@/types/balance.types";
import { mapBalanceDetail, mapBalanceListItem } from "@/utils/balanceMapper";

type ApiEnvelope<T> = {
  success?: boolean;
  data: T;
  message?: string;
};

type CreatePayload = {
  title: string;
  subtitle: string;
  description: string;
};

type UpdatePayload = {
  title?: string;
  subtitle?: string;
  description?: string;
};

type VotePayload = {
  isAgree: boolean;
};

type CommentPayload = {
  content: string;
  parentId?: number | null;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function unwrap<T>(res: ApiEnvelope<T> | T): T {
  if (isObject(res) && "data" in res) {
    return (res as ApiEnvelope<T>).data;
  }
  return res as T;
}

export const getIssueList = async (): Promise<BalanceListItem[]> => {
  const { data } = await apiClient.get<ApiEnvelope<unknown[]> | unknown[]>("/balance");
  const raw = unwrap<unknown[]>(data);
  return (raw ?? []).map((item) => mapBalanceListItem(item));
};

export const getIssueDetail = async (issueId: number): Promise<BalanceDetail> => {
  const { data } = await apiClient.get<ApiEnvelope<unknown> | unknown>(`/balance/${issueId}`);
  const raw = unwrap<unknown>(data);
  return mapBalanceDetail(raw);
};

export const createIssue = async (payload: CreatePayload): Promise<BalanceListItem> => {
  const { data } = await apiClient.post<ApiEnvelope<unknown> | unknown>("/balance", payload);
  const raw = unwrap<unknown>(data);
  return mapBalanceListItem(raw);
};

export const updateIssue = async (
  issueId: number,
  payload: UpdatePayload
): Promise<BalanceListItem> => {
  const { data } = await apiClient.patch<ApiEnvelope<unknown> | unknown>(
    `/balance/${issueId}`,
    payload
  );
  const raw = unwrap<unknown>(data);
  return mapBalanceListItem(raw);
};

export const deleteIssue = async (issueId: number): Promise<void> => {
  await apiClient.delete(`/balance/${issueId}`);
};

export const voteIssue = async (
  issueId: number,
  option: BalanceVoteOption
): Promise<BalanceDetail> => {
  const isAgree = option === "agree" || option === "AGREE";
  const payload: VotePayload = { isAgree };

  const { data } = await apiClient.post<ApiEnvelope<unknown> | unknown>(
    `/balance/${issueId}/vote`,
    payload
  );
  const raw = unwrap<unknown>(data);
  return mapBalanceDetail(raw);
};

export const getComments = async (issueId: number): Promise<BalanceComment[]> => {
  const { data } = await apiClient.get<ApiEnvelope<BalanceComment[]> | BalanceComment[]>(
    `/balance/${issueId}/comments`
  );
  return unwrap<BalanceComment[]>(data);
};

export const createComment = async (
  issueId: number,
  payload: CommentPayload
): Promise<BalanceComment> => {
  const { data } = await apiClient.post<ApiEnvelope<BalanceComment> | BalanceComment>(
    `/balance/${issueId}/comments`,
    payload
  );
  return unwrap<BalanceComment>(data);
};

export const updateComment = async (
  issueId: number,
  commentId: number,
  content: string
): Promise<BalanceComment> => {
  const { data } = await apiClient.patch<ApiEnvelope<BalanceComment> | BalanceComment>(
    `/balance/${issueId}/comments/${commentId}`,
    { content }
  );
  return unwrap<BalanceComment>(data);
};

export const deleteComment = async (issueId: number, commentId: number): Promise<void> => {
  await apiClient.delete(`/balance/${issueId}/comments/${commentId}`);
};

export const toggleCommentLike = async (
  issueId: number,
  commentId: number
): Promise<{ commentId: number; likeCount: number; isLiked: boolean }> => {
  const { data } = await apiClient.post<
    | ApiEnvelope<{ commentId: number; likeCount: number; isLiked: boolean }>
    | { commentId: number; likeCount: number; isLiked: boolean }
  >(`/balance/${issueId}/comments/${commentId}/like`);
  return unwrap<{ commentId: number; likeCount: number; isLiked: boolean }>(data);
};

export const balanceApi = {
  getIssueList,
  getIssueDetail,
  createIssue,
  updateIssue,
  deleteIssue,
  voteIssue,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
};

export const issueApi = balanceApi;