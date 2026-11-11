import { useCreateGroup } from "@/features/chats/hooks/useCreateGroup";
import { uploadMedia } from "@/services/mediaUpload";
import { getSessionGeneration } from "@/services/authStorage";
import type { SelectedImage } from "@/features/contacts/components/AvatarPicker";
export function useCreateGroupWithAvatar() {
  const mutation = useCreateGroup();
  return async (group: { name: string; image?: SelectedImage; members: { id: string }[] }) => {
    const generation = getSessionGeneration();
    const avatar = group.image ? await uploadMedia({ uri: group.image.uri, purpose: "group_avatar", contentType: group.image.mimeType, sizeBytes: group.image.fileSize, originalFilename: group.image.fileName }) : undefined;
    if (generation !== getSessionGeneration()) throw new Error("Account changed. Please create the group again.");
    return mutation.mutateAsync({ name: group.name.trim(), participantIds: [...new Set(group.members.map(member => member.id))], ...(avatar ? { avatarMediaId: avatar.id } : {}) });
  };
}
