export function canSendMessage(text: string, hasAttachments = false): boolean {
  return text.trim().length > 0 || hasAttachments;
}
