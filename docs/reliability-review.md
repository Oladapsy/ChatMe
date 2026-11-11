# Reliability review and recording guide

Run `node --test scripts/tests/reliability.cjs` and `npx tsc --noEmit`.
The tests exercise the production TypeScript modules with mocked network, storage,
and React adapters. They are not device or backend integration tests.

## Record with two accounts

Use a debug proxy or backend test environment to delay/drop responses. Do not
log access tokens, refresh tokens, signed upload fields, or private message text.

1. Account A sends text plus a photo to B. Let the message POST reach the server,
   then drop its response. Type a new draft during the delay. Show that the new
   draft remains and that the outgoing bubble shows a spinner, then an inline failure action. Tap Retry on that bubble. Compare both
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
   voice message and the failed-message Retry action inside its bubble. Type a second text draft
   while text/photo/edit requests are slow; their completion must preserve it.

## Current boundaries

Composer text/images and queued operations now persist in AsyncStorage under account
and conversation IDs. Attachment files are copied into the app document directory
so cache eviction does not invalidate retries. Queue entries are saved before
sending; clientMessageId, clientUploadId, original payload, completed media IDs,
and upload progress are reused after restart. A restored operation is bound to
the current session only after loading the same authenticated account. Nothing
from another account is loaded into that account's composer or outbox.

Interrupted file transfers restart from the beginning; they are not byte-range
resumable. Ready media and known completed transfers are reused. Retained files
currently remain in app documents until app storage is cleared; automatic orphan
file collection is a follow-up storage improvement.

Reconnect recovery walks the entire available history, rather than stopping at
the first known ID. It reconciles older versions, deletion tombstones, reactions,
and server-removed messages while preserving live arrivals after recovery began.
This is deliberately a correctness-first fallback and costs more requests for
long histories; a backend change-feed cursor would allow bounded recovery.
Message/reaction socket events trigger authoritative REST recovery. Actual event
payloads and backend history visibility still need two-account integration checks.
A root-level authenticated socket refreshes conversation list/detail caches even
before opening a chat room.

Exactly-once receipt depends on backend idempotency for both clientMessageId and
clientUploadId; matching client IDs alone cannot enforce it on the client.
Device recording/playback, permission prompts, deep-link dispatch, screen-reader
focus order and actual server deduplication still require the recording above.

Before submission, include `git branch --show-current`, the final committed SHA,
and the recording link. No device recording is produced by the unit tests.

## Review follow-up verification (2026-11-11)

Local checks: 19 mocked reliability tests pass; TypeScript passes. A web static
export also passes. These checks do not prove native behavior or backend
idempotency. The existing route filename is already lowercase `onboarding.tsx`.
All remaining private root routes now sit inside the authenticated/profile guard.
Bulk selection actions and document attachments are visibly disabled. The photo
picker accepts images only. Starred/shared-link screens explicitly report that
those collections are unavailable instead of displaying mock records.

Session cleanup cancels queries, clears the query cache and profile flags, and
invalidates the credential generation immediately. Logout does not await push
registration or server revocation. Rejected refresh uses the same cleanup path,
including refresh initiated by sockets. Temporary outages keep saved credentials;
startup shows a retry screen until the profile can be restored. OTP establishes
the session once, applies the returned profile, and uses challenge codeLength.

Recording is pending: two test account identifiers/devices have not been supplied.
One booted iOS simulator is available; no second receiving device was established.
The app has the notification plugin but lacks a real Expo project ID and native
FCM/APNs credentials, so push delivery has not been demonstrated.

Extend the recording above with these review-specific steps:

1. Create a group, terminate/relaunch, and reopen it from server-loaded chats.
   Reject creation separately and show that the modal preserves its inputs and
   displays a retry explanation. Verify the owner's role in members.
2. Change pin/mute/favourite/archive and revisit All, Favourites, Archived and
   Details. Toggle user-details notifications and verify the server state.
3. Reject refresh with 401 and verify cached chats/profile disappear. Separately
   simulate 503/offline startup, retry, and verify the correct profile returns.
   Hold push registration indefinitely and log out; private screens must disappear
   immediately. Sign in as the other account and show no prior-account content.
4. Edit/delete/react to an older message on B while A is disconnected; reconnect
   A and verify history and the list update. Repeat while both are online.
5. Start an upload on A, switch to B before completion, and show that no completion
   or message request is authenticated as B. Restore A and retry the saved queue.
6. Leave a room with unsent text/images, reopen, terminate/relaunch, and reopen.
   Repeat with an accepted send whose response was dropped. Verify the same client
   message ID is retried and that B receives only one server message.
7. Deny contact permission: show no fabricated contacts and a retry explanation.
   Select an unsupported/empty image and show the error. Repeatedly select photos
   and verify the total stays at ten. Play the received voice note on B.
8. Open every private route signed out; open chat/group/user-details without IDs.
   Tap a notification signed out, sign in, unlock PIN, and verify its destination.
   Use VoiceOver/TalkBack for composing, attachments, busy controls, and failure
   recovery. Confirm focus order and spoken labels on actual devices.
