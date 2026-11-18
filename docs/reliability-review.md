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

## F1–F5 follow-up (2026-11-16)

Run `npm run test:reliability` and `npx tsc --noEmit`. Regression checks extend the
original 32 checks and execute production modules with mocked I/O. Profile and
reaction regressions use real TanStack mutation observers. Search checks execute
the room's actual `useMemo` selector, the production socket recovery handler, and
the search query function. These checks are client evidence, not live backend or
device evidence.

Local validation: **52/52 checks pass**, TypeScript passes, and a web static
export succeeds with a placeholder API origin. The Android development build
also compiles and installs successfully on the Pixel 9a emulator. Account login
and the two-account recording remain pending.

- **F1:** Account-owned profile/avatar, chat/group, contact and reaction mutations
  use `useSessionMutation`. A generation belongs to each mutation execution,
  including its retries and paused work. Successful responses, optimistic setup,
  success callbacks and error/rollback callbacks cannot apply to a later session.
  Stale successes reject rather than invoking the caller's success/navigation
  callback. Cache removals happen before awaited refetches. Tests release A's
  successful profile save after logout and after establishing B and verify B's
  profile, flags and both credentials; stale avatar responses and reaction
  rollbacks are covered too.
- **F2:** Active send/upload ownership is held outside screen instances under
  account, room and session keys. Returning to a room reuses its in-memory outbox
  objects and active lock instead of restoring them as failed. A process restart
  still restores persisted interrupted work as retryable. Held text and photo
  operations are tested across unmount/reopen/retry, followed by both successful
  and failed responses.
- **F3:** Search and history merge by newest version; authoritative history wins
  ties. Completed recovery reconciles every cached search page and removes server
  removals, deleted items and text that no longer matches. Local edit/delete/
  reaction responses update both caches. Search queries finishing after a change
  reconcile against the latest history before returning. Remote events and
  reconnects invalidate the actual `["messages", "search", conversationId]` keys.
  Tests include search-only results outside initial history and held search
  responses finishing after mutations.
- **F4:** Unfinished transfers renew expired/rejected authorization using the same
  `clientUploadId` and metadata. Renewal must return the same media ID; a different
  identity fails visibly. Ready media and completed transfers remain reusable.
  Tests cover transient failures, expiry after a persisted outbox restart,
  signature-expiry rejection, completion-only retry and identity mismatch.
  **Backend confirmation remains required:** the current client uses repeated
  `POST /v1/media/uploads` as the idempotent renewal flow. The repository contains
  the client request/response types, but no backend implementation or renewal
  contract. Confirm that the same ID returns fresh signed fields for the same
  pending media, or adapt `authorize` in `mediaUpload.ts` to the documented renewal
  endpoint. Mocked renewal tests do not establish that contract.
- **F5:** OTP route length is validated before allocating input state. Hooks remain
  unconditional. The screen and resend handler reject fractional, negative,
  non-finite, missing, array-valued and oversized lengths; valid lengths 1–10 are
  retained. Tests render the production OTP screen for malformed and valid links.

### Recording additions and outstanding evidence

Use account A in the iOS development build and account B in an Android development
build. Sign in on each device without putting OTPs or tokens in test logs. A local
Android emulator has been prepared for this workflow. Push delivery still needs
an actual supported device/environment plus the configured Expo project and native
push credentials described in `push-notifications.md`.

1. Hold A's profile-save response. Log A out; release it and show no restored
   profile/private state. Repeat, signing B in on the same device before releasing
   A's response. Verify B's displayed profile and completion state; inspect token
   ownership privately without recording credentials.
2. Hold a text-send response, leave and reopen the room, and try Retry. Show one
   request still in progress. Release it and show one confirmed message on both
   devices. Repeat during a held photo transfer, then with a rejection followed
   by a successful explicit retry. Restart the app and verify drafts/outbox IDs
   survive without copying another account's content.
3. Keep search open on A. Edit, delete and react from B, including an older result
   outside A's initially loaded history. Repeat after reconnect. Show deleted or
   nonmatching text disappearing from matches and updated reactions remaining.
4. Fail a transfer, let signed authorization expire, terminate/relaunch, and retry.
   Verify a renewed authorization request retains clientUploadId and media ID,
   then verify the sent message retains clientMessageId and ready media IDs.
5. Record create-group success/failure and relaunch/reopen, settings consistency
   across All/Favourites/Archived/Details, denied permissions, received audio
   playback, private routes and malformed OTP links, notification routing through
   login/PIN, and VoiceOver/TalkBack labels/focus as described above.

The final submission still needs the live backend renewal result, two-account
recording link, device/push/accessibility evidence and final committed SHA. No
recording or backend verification is implied by passing the local checks.

## R1–R3 follow-up (2026-11-18)

### Reproduce verification

Use Node **22.23.3**, the version selected by `.github/workflows/verify.yml`:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run verify
```

`verify` runs the locked ESLint configuration, TypeScript, all reliability tests,
and Android/iOS/web exports in sequence. A failure stops the workflow. Exports
always use `https://api.example.invalid`, require no backend credentials, and go
to ignored `artifacts/verification/<platform>` directories. These are bundle/
static-render checks, not native builds, backend checks or device recordings.
The GitHub workflow runs the same commands on pull requests and pushes to `dev`.
A local verification does not claim that GitHub Actions has run.

Validated in an isolated copy after a fresh locked installation with Node
22.23.3: the full verification command exits successfully, **73/73 tests pass**,
TypeScript passes, and all three exports pass. Lint reports **0 errors and 98
warnings**. Local output is saved under ignored `artifacts/verification/`;
the committed command reproduces it without requiring those generated files.

The ESLint configuration extends Expo's SDK-57 configuration and enforces core
correctness and hook-ordering rules as errors. Existing compiler migration
issues (`set-state-in-effect`, `refs`, `preserve-manual-memoization`) are explicitly
reported as warnings, alongside the preset's existing unused-variable/style
warnings. Warnings remain visible; lint success does not mean zero warnings or
completion of a compiler migration. Missing lint dependencies no longer trigger
an automatic bootstrap because `npm run lint` invokes the locked ESLint directly.

### Changes and regression scope

- **R1:** Reaction rollback records only the affected user's optimistic layer.
  Removing a failed layer patches current reactions without restoring a history
  snapshot. Newer confirmed message versions/tombstones remain authoritative;
  unrelated reactions, arrivals, page metadata and cursors remain intact. Layers
  for overlapping operations are independent, including out-of-order failures
  and an older successful response arriving while another reaction is pending.
  Tests use real TanStack mutation observers with no active repairing refetch.
- **R2:** Socket events, REST recovery and local authoritative responses use the
  shared `newestMessage`/`reconcileMessageHistory` rule. Older events cannot
  downgrade an edit or clear a deletion tombstone. Matching server IDs and
  nonempty sender/client IDs are deduplicated across all cached pages. Search
  reconciliation receives the version actually retained in history. Adapter
  tests replay version-1 created events against version-3 edits/deletions, repeat
  duplicates after recovery, and accept genuinely newer events with search open.
- **R3:** The operation supplies an awaited progress checkpoint to both image and
  voice upload helpers. Authorization is saved before transfer; successful
  transfer is saved before completion; ready media is saved before returning;
  attachment media IDs and the final payload are saved before message submission.
  Session ownership is checked before and after each checkpoint. A failed write
  prevents the next network stage. A restart during held completion can retry
  completion without another byte transfer.

The suite contains **73 checks**, including 21 R1–R3 scenarios. As a negative
control, the new scenarios were also run against the previous reviewed production
modules: 19 fail there, while the two held-authorization restart controls already
pass. All must pass with the fixes. The restart tests capture serialized outbox
storage, discard the old held execution, and restore fresh production modules.
They do not simulate a physical device force-stop.

A request whose response was never received remains uncertain after termination.
Retrying an unacknowledged authorization, byte transfer or message request can
repeat that request. The client preserves the original upload/message identity;
backend idempotency is still required to establish one remote asset/message.
A known, durably checkpointed successful transfer is reused even if the backend
still reports pending media when the client restarts.

### Remaining acceptance gates

1. Ask the instructor to confirm repeated `POST /v1/media/uploads` with the same
   `clientUploadId` returns fresh signed fields/`expiresAt` for the same pending
   media ID, or provide the separate renewal endpoint contract. Also confirm
   repeated `POST /v1/media/uploads/{mediaId}/complete` is idempotent and repeated
   message submission with the same `clientMessageId` returns one message.
   No live renewal verification is claimed by the mocked suite.
2. Add the three scenarios to the existing two-account recording: reject set and
   remove reaction requests after remote edit/deletion/new arrival; replay or
   reconnect after an old created event; force-stop/relaunch during authorization,
   transfer, completion and message response for both a photo and a voice note.
   Show the recipient opening/playing the resulting media and inspect request
   counts/IDs without exposing credentials or signed fields.
3. Retain the earlier profile/account-switch, group creation/failure/relaunch,
   list/detail settings consistency, restarted drafts/outbox, app-icon changes,
   private/invalid routes, permissions, notification-through-login/PIN, actual
   push delivery, received audio and VoiceOver/TalkBack evidence. Push project/
   native credential configuration remains an external prerequisite.
4. Submit the final full commit SHA, verification output, backend confirmation
   and recording link. No device or backend acceptance is implied by local checks.
