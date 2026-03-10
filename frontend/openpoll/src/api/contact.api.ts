import { apiClient } from "./client";

interface ContactRequest {
  subject: string;
  message: string;
}

/**
 * 건의사항 이메일 전송
 * POST /contact
 */
export const sendContact = async (data: ContactRequest): Promise<void> => {
  await apiClient.post("/contact", data);
};
