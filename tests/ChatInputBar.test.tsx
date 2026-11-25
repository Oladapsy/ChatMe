import { render, screen, userEvent } from "@testing-library/react-native";
import { useState, type ComponentProps, type PropsWithChildren } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ChatInputBar } from "@/features/chats/components/ChatInputBar";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("expo-audio", () => ({
  RecordingPresets: { HIGH_QUALITY: {} },
  useAudioRecorder: jest.fn(),
}));

function ComposerProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, right: 0, bottom: 0, left: 0 },
      }}
    >
      {children}
    </SafeAreaProvider>
  );
}

function Composer({
  onSend,
  ...props
}: Pick<ComponentProps<typeof ChatInputBar>, "hasAttachments" | "isSending" | "isEditing"> & {
  onSend: (draft: string) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <ChatInputBar
      {...props}
      text={draft}
      onChangeText={setDraft}
      onSendText={() => onSend(draft)}
      onSendAudio={jest.fn()}
      onOpenAttachment={jest.fn()}
    />
  );
}

function sendButton() {
  return screen.getByRole("button", { name: "Send message" });
}

it("enables Send after typing text and passes the current draft to the parent", async () => {
  const onSend = jest.fn();
  const user = userEvent.setup();
  await render(<Composer onSend={onSend} />, { wrapper: ComposerProviders });

  expect(sendButton()).toBeDisabled();
  await user.type(screen.getByLabelText("Message draft"), "  ");
  expect(sendButton()).toBeDisabled();
  await user.press(sendButton());
  expect(onSend).not.toHaveBeenCalled();

  await user.type(screen.getByLabelText("Message draft"), "Hello");
  expect(sendButton()).toBeEnabled();
  await user.press(sendButton());
  expect(onSend).toHaveBeenCalledTimes(1);
  expect(onSend).toHaveBeenCalledWith("  Hello");
});

it("allows an attachment-only message and disables Send while it is pending", async () => {
  const onSend = jest.fn();
  const user = userEvent.setup();
  const { rerender } = await render(<Composer hasAttachments onSend={onSend} />, {
    wrapper: ComposerProviders,
  });

  expect(sendButton()).toBeEnabled();
  await user.press(sendButton());

  await rerender(<Composer hasAttachments isSending onSend={onSend} />);
  expect(sendButton()).toBeBusy();
  expect(sendButton()).toBeDisabled();
  await user.press(sendButton());
  expect(onSend).toHaveBeenCalledTimes(1);
});

it("requires text to save an edit even if an attachment is selected", async () => {
  const onSend = jest.fn();
  const user = userEvent.setup();
  await render(<Composer hasAttachments isEditing onSend={onSend} />, {
    wrapper: ComposerProviders,
  });

  const save = () => screen.getByRole("button", { name: "Save edited message" });
  expect(save()).toBeDisabled();
  await user.type(screen.getByLabelText("Message draft"), "Updated");
  expect(save()).toBeEnabled();
  await user.press(save());
  expect(onSend).toHaveBeenCalledWith("Updated");
});
