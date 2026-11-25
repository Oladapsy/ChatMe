import { canSendMessage } from "@/features/chats/utils/canSendMessage";

describe("canSendMessage", () => {
  it.each(["", "  ", "\t\n", "\u00a0"])("rejects a blank draft (%j)", (draft) => {
    expect(canSendMessage(draft)).toBe(false);
  });

  it.each(["Hello", "  Hello\n", "👋"])("accepts a text draft (%j)", (draft) => {
    expect(canSendMessage(draft)).toBe(true);
  });

  it("accepts an attachment without a caption", () => {
    expect(canSendMessage("  ", true)).toBe(true);
  });
});
