export type IssueListItem = {
  id: number;
  emoji: string;
  title: string;
  description: string;
  participants: number;
  comments: number;
  agreePercent: number;
  voted: boolean;
  myVote: "agree" | "disagree" | null;
  createdAt: string;
};

export type IssueDetail = {
  id: number;
  emoji: string;
  title: string;
  description: string;
  totalVotes: number;
  agreePercent: number;
  disagreePercent: number;
  myVote: "agree" | "disagree" | null;
  comments: IssueComment[];
};

export type IssueComment = {
  id: number;
  author: string;
  option: "agree" | "disagree";
  content: string;
  likes: number;
  createdAt: string;
};