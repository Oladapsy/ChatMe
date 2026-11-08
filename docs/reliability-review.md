# Reliability review and recording guide

Run `node --test scripts/tests/reliability.cjs` and `npx tsc --noEmit`.
The tests exercise the production TypeScript modules with mocked network, storage,
and React adapters. They are not device or backend integration tests.

## Record with two accounts

Use a debug proxy or backend test environment to delay/drop responses. Do not
log access tokens, refresh tokens, signed upload fields, or private message text.

1. Account A sends text plus a photo to B. Let the message POST reach the server,
   then drop its response. Type a new draft during the delay. Show that the new
   draft remains and that the failure banner appears. Tap Retry. Compare both
   requests: identical clientMessageId, text, reply target and attachmentMediaIds.
   Confirm one server message and one recipient bubble on B. This requires the
   backend to enforce idempotency for clientMessageId within the sender's scope.
2. Disconnect A. Send more than 50 messages from B, then reconnect A. Show all
   missed messages, including those beyond the first history page, without
   duplicate bubbles. Repeat with history temporarily unavailable after the
   socket connects; recovery retries after five seconds. Also background and
   resume A.
3. Deny microphone permission; show the visible explanation and continue with
   text. Grant permission, record a voice note, and interrupt the cloud upload.
   Retry after restoring connectivity. Interrupt the completion request separately
   and verify retry skips the completed cloud transfer. Drop the subsequent
   message response and verify retry preserves the media ID. On B, play/pause
   the received remote voice note. Confirm the backend returns its secure remote
   attachment URL and detects the recorded duration.
4. Delay A's refresh response. Log out and log in as B, then release A's response.
   Verify B's tokens and user remain active and A's original request is not
   replayed with B's credentials. Repeat with A's refresh returning 503 or a
   network error, then restore service: A can retry without signing in again.
   A rejected refresh (400/401/403) should instead end the initiating session.
5. Sign out, open the app's `/chat-room?id=<conversation>` deep link, and show
   the sign-in route without mounting the room. Select a matched contact and
   show the returned conversation; select an unmatched contact and show its alert.
6. With VoiceOver/TalkBack enabled, navigate Message draft, Attach photos, Remove
   attached photo, Send message, Record voice message, Discard recording, Send
   voice message and the failed-message Retry action. Type a second text draft
   while text/photo/edit requests are slow; their completion must preserve it.

## Current boundaries

Failed operations and upload progress survive room navigation in memory during
one login. They do not survive terminating/restarting the app. Retry resumes an
interrupted file transfer from the beginning with the original upload operation;
it is not a byte-range resumable upload. Completed transfers and media IDs are
reused. Recovery uses the existing newest-first cursor history API, walking back
to a cached server message (or the end of history).

Exactly-once receipt depends on backend idempotency for both clientMessageId and
clientUploadId; matching client IDs alone cannot enforce it on the client.
Device recording/playback, permission prompts, deep-link dispatch, screen-reader
focus order and actual server deduplication still require the recording above.

Before submission, include `git branch --show-current`, the final committed SHA,
and the recording link. No device recording is produced by the unit tests.
