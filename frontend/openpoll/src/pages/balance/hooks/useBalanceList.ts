import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getBalanceList,
  getBalanceDetail,
  createBalance,
  updateBalance,
  deleteBalance,
  getErrorMessage,
} from "@/api";
import type {
  BalanceListItem,
  BalanceListItemExtended,
  BalanceFormPayload,
} from "@/types/balance.types";

export type FilterType = "hot" | "recent" | "completed";

export function useBalanceList(isLoggedIn: boolean) {
  const location = useLocation();

  const [filter, setFilter] = useState<FilterType>("hot");
  const [issues, setIssues] = useState<BalanceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<BalanceListItem | null>(null);
  const [editingDetailDescription, setEditingDetailDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buildTitleWithEmoji = (emoji: string | undefined, title: string) => {
    const trimmed = String(title ?? "").trim();
    if (!emoji) return trimmed;
    if (!trimmed) return emoji;
    if (trimmed.startsWith(emoji)) return trimmed;
    return `${emoji} ${trimmed}`;
  };

  const refresh = useCallback(async () => {
    const data = await getBalanceList();
    setIssues(data);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadIssues = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await getBalanceList();
        if (mounted) {
          setIssues(data);
        }
      } catch (e) {
        if (mounted) {
          setErrorMessage(getErrorMessage(e));
        }
      }

      if (mounted) {
        setIsLoading(false);
      }
    };

    void loadIssues();

    return () => {
      mounted = false;
    };
  }, [location.key]);

  const filteredIssues = useMemo(() => {
    if (filter === "completed") {
      if (!isLoggedIn) return [];
      return issues.filter((x) => x.myVote !== null);
    }

    if (filter === "recent") {
      return [...issues].sort((a, b) => {
        const at = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
        const bt = b.createdAt ? new Date(b.createdAt).getTime() : b.id;
        return bt - at;
      });
    }

    return [...issues].sort((a, b) => {
      const ap = Number(a.participants ?? a.totalVotes ?? 0);
      const bp = Number(b.participants ?? b.totalVotes ?? 0);
      return bp - ap;
    });
  }, [issues, filter, isLoggedIn]);

  const openCreate = () => {
    setErrorMessage(null);
    setModalMode("create");
    setEditing(null);
    setEditingDetailDescription("");
    setIsModalOpen(true);
  };

  const openEdit = async (issue: BalanceListItem) => {
    try {
      setErrorMessage(null);
      setModalMode("edit");
      const detail = await getBalanceDetail(issue.id);
      setEditing(issue);
      setEditingDetailDescription(detail.description ?? "");
      setIsModalOpen(true);
    } catch (e) {
      setErrorMessage(getErrorMessage(e));
    }
  };

  const handleDelete = async (issue: BalanceListItem) => {
    const ok = window.confirm(`"${issue.title}" 이슈를 삭제할까요?`);
    if (!ok) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await deleteBalance(issue.id);
      await refresh();
    } catch (e) {
      setErrorMessage(getErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (payload: BalanceFormPayload) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      if (modalMode === "create") {
        await createBalance(payload);
      } else {
        if (!editing) throw new Error("수정 대상을 찾을 수 없습니다.");
        const title = buildTitleWithEmoji(editing.emoji, payload.title);
        await updateBalance(editing.id, { ...payload, title });
      }

      setIsModalOpen(false);
      setEditing(null);
      setEditingDetailDescription("");
      await refresh();
    } catch (e) {
      setErrorMessage(getErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const initialForModal:
    | { title: string; subtitle: string; description: string }
    | undefined =
    modalMode === "create"
      ? undefined
      : editing
        ? {
            title: buildTitleWithEmoji(editing.emoji, editing.title ?? ""),
            subtitle: String(
              (editing as BalanceListItemExtended).subtitle ??
                editing.description ??
                ""
            ),
            description: String(editingDetailDescription ?? ""),
          }
        : undefined;

  return {
    filter,
    setFilter,
    isLoading,
    errorMessage,
    filteredIssues,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    isSubmitting,
    openCreate,
    openEdit,
    handleDelete,
    handleSubmit,
    initialForModal,
    hideAdminActions: isModalOpen,
    editingId: editing?.id ?? null,
  };
}
