import axios from "axios";
import { api } from "@/services/api";

export interface DiscoveredUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface ContactMatch {
  matchedPhoneNumber: string;
  user: DiscoveredUser;
}

export interface MatchContactsResponse {
  matches: ContactMatch[];
}

export interface UserSearchResponse {
  items: DiscoveredUser[];
  nextCursor: string | null;
}

export async function matchContacts(
  phoneNumbers: string[],
): Promise<MatchContactsResponse> {
  try {
    const response = await api.post<MatchContactsResponse>(
      "/contacts/match",
      { phoneNumbers },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("CONTACT MATCH STATUS:", error.response?.status);
      console.log("CONTACT MATCH DETAILS:", error.response?.data);
      console.log("CONTACT NUMBER COUNT:", phoneNumbers.length);
    }

    throw error;
  }
}

export async function searchUsers(
  q: string,
  limit = 20,
  cursor?: string,
): Promise<UserSearchResponse> {
  const response = await api.get<UserSearchResponse>("/users/search", {
    params: { q, limit, ...(cursor ? { cursor } : {}) },
  });

  return response.data;
}
