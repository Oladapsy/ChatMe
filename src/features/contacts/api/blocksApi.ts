import { api } from "@/services/api";

export interface BlockedUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface BlockedUserItem {
  user: BlockedUser;
  blockedAt: string;
}

export interface BlockedUsersResponse {
  items: BlockedUserItem[];
}

// GET /v1/me/blocks
export async function getBlockedUsers(): Promise<BlockedUsersResponse> {
  const response = await api.get<BlockedUsersResponse>("/me/blocks");
  return response.data;
}

// PUT /v1/me/blocks/:userId
export async function blockUser(userId: string) {
  const response = await api.put<BlockedUserItem>(`/me/blocks/${userId}`);

  return response.data;
}

// DELETE /v1/me/blocks/:userId
// The backend responds with HTTP 204 and no response body.
export async function unblockUser(userId: string): Promise<void> {
  await api.delete(`/me/blocks/${userId}`);
}
