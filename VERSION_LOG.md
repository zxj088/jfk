# Vegas Golf Scorecard Version Log

This file records the good baseline versions of the app and how to switch back to them in Codex or GitHub.

## Good Baselines

### v6.5.4 - Larger home action labels

Date: 2026-08-10

Tag: `v6.5.4`

Live URL:

`https://zxj088.github.io/jfk/?v=211`

What is new in this version:

- New game, Watch live and Past scorecards now use the same 17-pixel title size as the History heading.
- English mobile labels no longer shrink to 12 pixels.
- The two-column mobile layout keeps wrapping available and remains free of horizontal overflow at 390 pixels.
- PWA asset query version is `v211`.

Verified with JavaScript syntax checking, 91 automated tests, the production build, and a 390-pixel mobile browser check.

### v6.5.3 - Clearer home-page priorities

Date: 2026-08-09

Tag: `v6.5.3`

Live URL:

`https://zxj088.github.io/jfk/?v=210`

What is new in this version:

- New game, live viewing and past scorecards now remain above the active-game list on the mobile home page.
- The redundant Home heading is removed to save vertical space.
- The history-filter entry now reads More past games / 更多历史比赛.
- Early-ended games show their real completed-hole count together with Completed / 已结束 instead of Playing / 进行中.
- PWA asset query version is `v210`.

Verified with JavaScript syntax checking, 91 automated tests, the production build, and a 390-pixel mobile browser check.

### v6.5.2 - Reliable game finishing

Date: 2026-08-09

Tag: `v6.5.2`

Live URL:

`https://zxj088.github.io/jfk/?v=209`

What is new in this version:

- Finishing a completed game now sends the two-digit edit code returned by the confirmation dialog instead of reading a nonexistent object property.
- Completed games can be locked, shared as final results, analyzed, replayed and deleted normally after all 18 holes are recorded.
- A dedicated regression test protects the finish-code request shape.
- PWA asset query version is `v209`.

Verified with JavaScript syntax checking, 91 automated tests, the production build, and complete two-device browser testing.

### v6.5.1 - Clearer and shorter English interface

Date: 2026-08-09

Tag: `v6.5.1`

Live URL:

`https://zxj088.github.io/jfk/?v=208`

What is new in this version:

- Bottom navigation now uses the clearer mobile labels Score and Results.
- User-facing English consistently uses Wolf & Pack, Wolf and Pack while Chinese remains 斗地主、地主和农民.
- High-frequency mobile labels are shorter across the home page, scoring setup, results, sharing and analysis.
- Chinese and English remain fully separated, and the Chinese results tabs remain 成绩 and 分析.
- PWA asset query version is `v208`.

Verified with JavaScript syntax checking, 90 automated tests, the production build, and 390px mobile-width checks.

### v6.5.0 - Unified results and interactive match analysis

Date: 2026-08-09

Tag: `v6.5.0`

Live URL:

`https://zxj088.github.io/jfk/?v=207`

What is new in this version:

- Results use clear Scores and Analysis tabs with a compact Gross/Net reference selector that does not change the saved game.
- Match analysis shows total results, special scores, tied biggest-swing holes, multiplier or flip details, and expandable calculations.
- Highlight cards open detailed lists; selecting an item scrolls to, expands and temporarily highlights the matching hole.
- Wolf & Pack player cards show role counts, role-specific points and every tied biggest-swing hole.
- Positive points use a plus sign and green text, negative points use a minus sign and red text, and zero remains neutral.
- Completed games open the locked results page without prompting for the retired summary PNG.
- PWA asset query version is `v207`.

Verified with JavaScript syntax checking, 90 automated tests, the production build, and mobile-width layout checks.

### v6.4.0 - Group-game positioning, rematch, sharing and calculation explanations

Date: 2026-08-09

Tag: `v6.4.0`

Live URL:

`https://zxj088.github.io/jfk/?v=206`

What is new in this version:

- The first-use experience explains that JFK GOLF focuses on automatically settling Las Vegas and Wolf & Pack group-game points.
- The latest completed game can prefill a clean rematch with the same course, players, handicaps and rules while generating a new game and edit credential.
- Live and completed games can be shared with a read-only deep link containing only the round ID; app recommendations now describe the group-game value clearly.
- Wolf & Pack hole results can expand to show Wolf and selected Pack totals, tie handling, multipliers and the zero-sum points check.
- Las Vegas hole results can expand to show gross/net inputs, team pairs, flips and the final difference; page totals and shared scorecards use the same scoring helper.
- PWA asset query version is `v206`.

Verified with JavaScript syntax checking, 81 automated tests, the production build, and 366px/390px mobile checks without horizontal scrolling.

### v6.3.2 - Clearer game-rule setup

Date: 2026-08-09

Tag: `v6.3.2`

Live URL:

`https://zxj088.github.io/jfk/?v=205`

What is new in this version:

- Game type, player count, scoring mode, and Wolf selection use clear segmented choices with immediate selected-state feedback.
- Las Vegas clearly remains a four-player game, while Wolf & Pack supports three or four players.
- Wolf & Pack comparison asks how many Pack scores to use and explains the Wolf total, Pack total, and winning condition in three concise lines.
- Game-rule sections use a calmer compact visual hierarchy and sticky wizard actions on phones.
- Added simulated scoring coverage for Wolf & Pack and Las Vegas, including gross/net scoring, flips, ties, multipliers, cumulative results, and zero-sum checks.
- PWA asset query version is `v205`.

Verified with JavaScript syntax checking, 77 automated tests, the production build, and 366px/390px interaction checks without horizontal scrolling or console errors.

### v6.3.1 - Clearer home page

Date: 2026-08-08

Tag: `v6.3.1`

Live URL:

`https://zxj088.github.io/jfk/?v=204`

What is new in this version:

- Active games appear before the main home actions and the section stays hidden when there are none.
- Start scoring remains a clear full-width primary phone action; Watch live and Past scorecards remain secondary actions.
- A single matching round opens directly, while multiple rounds scroll to the relevant list for user selection.
- Round cards show an explicit Continue scoring, Watch live, or View scorecard destination.
- History filters start collapsed, the first three matching rounds are shown by default, and Show more reveals the full filtered list.
- Empty results provide a direct Start a new game or Clear filters action.
- PWA asset query version is `v204`.

Verified with JavaScript syntax checking, 63 automated tests, the production build, and Chinese/English 390px browser checks with no horizontal scrolling or console errors.

### v6.3.0 - Configurable Wolf and Pack comparison

Date: 2026-08-08

Tag: `v6.3.0`

Live URL:

`https://zxj088.github.io/jfk/?v=203`

What is new in this version:

- Wolf & Pack setup replaces the per-hole cap with a choice of how many lowest Pack scores are summed and compared with The Wolf score multiplied by the same number.
- Tied holes can be configured as no win or loss, an eligible higher-handicap Wolf win, a Pack win, or a Wolf win; forced results retain manual and special-score multipliers and zero-sum points.
- Legacy games without the new settings continue to compare all Pack players and preserve the former tied-hole behavior.
- Player setup keeps browser history suggestions and adds an explicit labeled history list that restores the selected player's latest handicap without ambiguous arrow icons.
- Shared Wolf & Pack scorecards show the complete game setup in the header, including players and handicaps, player count, score mode, compared Pack-score count, tied-hole rule, Wolf selection mode, and fixed Wolf when applicable.
- PWA asset query version is `v203`.

### v6.2.2 - Correct installation icons

Date: 2026-08-07

Tag: `v6.2.2`

Live URL:

`https://zxj088.github.io/jfk/?v=202`

What is new in this version:

- Rebuilt the corrupted 192×192 PWA icon from the verified 512×512 source.
- Added a dedicated 180×180 Apple touch icon with a new filename to avoid stale iOS icon caches.
- Installation icons are declared as regular `any` icons instead of incorrectly claiming that the artwork is maskable.
- PWA asset query version is `v202`.

### v6.2.1 - One clear scoring-system action

Date: 2026-08-07

Tag: `v6.2.1`

Live URL:

`https://zxj088.github.io/jfk/?v=201`

What is new in this version:

- The scoring system bar now has one action: `Take over scoring` before ownership and `Finish game` after ownership.
- The duplicate Play-page takeover/edit button has been removed.
- Taking over scoring opens the first incomplete hole instead of leaving the scorer on a previously viewed hole.
- The full takeover warning remains when another phone currently owns the scoring lock.
- PWA asset query version is `v201`.

### v6.2.0 - Server-authorized scorecard writes

Date: 2026-08-07

Tag: `v6.2.0`

Live URL:

`https://zxj088.github.io/jfk/?v=200`

What is new in this version:

- Anonymous clients retain public scorecard viewing but can no longer insert, update, or delete database rows directly.
- The `scorecard-write` Edge Function validates the game or course edit code, including universal code `59`, before every cloud mutation.
- Edit codes are migrated out of publicly readable JSON into an RLS-protected credential table.
- A phone verifies once when taking over scoring, remembers the code locally, and keeps immediate local-first score entry with background uploads.
- Round updates retain optimistic version checks; failed deletes do not remove local data, and repeated wrong-code attempts are rate limited.
- Pending course uploads no longer discard a newer edit when an older slow request finishes.
- PWA asset query version is `v200`.

### v6.1.17 - Database-authoritative deletion

Date: 2026-08-07

Tag: `v6.1.17`

Live URL:

`https://zxj088.github.io/jfk/?v=199`

What is new in this version:

- Confirmed game and custom-course deletion physically removes the Supabase row instead of creating a permanent tombstone.
- Queried cloud ranges are authoritative, so another phone removes cached games and courses that no longer exist in the database.
- Active edits, pending score uploads, and explicitly queued course changes remain protected during weak-network recovery.
- Startup no longer uploads every locally cached custom course, preventing an old phone from recreating deleted data.
- Legacy local deletion lists are cleared during v199 startup and are never uploaded again.
- PWA asset query version is `v199`.

### v6.1.16 - Lower-power golf-paced live sync

Date: 2026-08-07

Tag: `v6.1.16`

Live URL:

`https://zxj088.github.io/jfk/?v=198`

What is new in this version:

- The scoring-device edit lease lasts 120 seconds and renews every 30 seconds, reducing repeated database reads and writes while retaining foreground recovery.
- Live viewers refresh the active game every 30 seconds, which fits normal golf pace and substantially reduces mobile data and battery use.
- Score changes still upload after the existing 650-millisecond debounce; home summaries remain on a five-minute cadence.
- Returning to the foreground or recovering connectivity still triggers an immediate contextual refresh.
- PWA asset query version is `v198`.

### v6.1.15 - Recent summaries and on-demand scorecards

Date: 2026-08-07

Tag: `v6.1.15`

Live URL:

`https://zxj088.github.io/jfk/?v=197`

What is new in this version:

- Startup sync downloads summaries for the most recent seven days, all playing games, and deletion markers instead of the full archive.
- A complete round is downloaded only when the user opens its scorecard, resumes scoring, or watches the game.
- Wider history date filters load matching summaries on demand without eagerly downloading every hole score.
- Existing full local rounds remain available when their cloud version is unchanged.
- Legacy landlord summaries without stored per-player points show a scorecard prompt and completed-hole count instead of incorrect zero scores.
- PWA asset query version is `v197`.

### v6.1.14 - Guided iPhone installation

Date: 2026-08-06

Tag: `v6.1.14`

Live URL:

`https://zxj088.github.io/jfk/?v=196`

What is new in this version:

- Android keeps its native one-tap PWA installation prompt.
- iPhone and iPad Safari users receive clear Share, Add to Home Screen, and Open as Web App instructions.
- Apple users in another browser are asked to open the page in Safari first, while already-installed standalone apps are recognized.
- Apple touch icon and standalone web-app metadata improve the installed home-screen experience.
- PWA asset query version is `v196`.

### v6.1.13 - Golf-paced cloud refresh

Date: 2026-08-06

Tag: `v6.1.13`

Live URL:

`https://zxj088.github.io/jfk/?v=195`

What is new in this version:

- Score changes still upload promptly, while edit-lock renewal moves to 10 seconds with a 30-second lease for better weak-signal tolerance.
- Live viewers refresh every 15 seconds, the home round index refreshes every five minutes, and background pages remain paused.
- Returning to the foreground or recovering network connectivity still triggers an immediate contextual refresh.
- History defaults to the most recent seven days, and universal edit code `59` remains supported and protected by a regression test.
- PWA asset query version is `v195`.

### v6.1.12 - Compact landlord scoring controls

Date: 2026-08-06

Tag: `v6.1.12`

Live URL:

`https://zxj088.github.io/jfk/?v=194`

What is new in this version:

- Three- and four-player landlord choices stay on one equal-width row.
- Multiplier guidance sits below the controls in the wide column, uses smaller text, and explains the pre-hole manual agreement and automatic below-par bomb.
- Per-player hole results use the existing role icons without repeating visible landlord or peasant labels; accessible labels retain the role.
- PWA asset query version is `v194`.

### v6.1.11 - Low-egress cloud synchronization

Date: 2026-08-06

Tag: `v6.1.11`

Live URL:

`https://zxj088.github.io/jfk/?v=193`

What is new in this version:

- Startup keeps one complete cloud sync, while later home refreshes use a lightweight 30-second round index and fetch only changed games.
- Live viewers and scoring ownership checks request only the current game every five seconds.
- Completed history pages do not poll continuously; background pages pause cloud polling and refresh immediately after returning to the foreground.
- Opening new-game setup refreshes courses on demand without replacing a form the user has started editing.
- PWA asset query version is `v193`.

### v6.1.10 - Unified home game cards

Date: 2026-08-06

Tag: `v6.1.10`

Live URL:

`https://zxj088.github.io/jfk/?v=192`

What is new in this version:

- Active and completed home game cards share the same padding, border width, title size, metadata size, team-result layout, status-icon slot, and action-button dimensions.
- Completed cards retain a calm green completed marker and Delete action; active cards retain their live marker and Modify action.
- PWA asset query version is `v192`.

### v6.1.9 - Score pad anchored below first player

Date: 2026-08-05

Tag: `v6.1.9`

Live URL:

`https://zxj088.github.io/jfk/?v=191`

What is new in this version:

- The score pad opens directly below the first visible player row instead of at the bottom of a tall phone screen.
- The pad stays fixed while subsequent player rows move upward into the same scoring position.
- The top position is measured from the rendered first player card and capped for shorter screens.
- Completed-game cards show a direct top-right Delete button matching the active-game Modify action.
- PWA asset query version is `v191`.

### v6.1.8 - Signed wins, bomb flip marker, reliable score scroll

Date: 2026-08-05

Tag: `v6.1.8`

Live URL:

`https://zxj088.github.io/jfk/?v=190`

What is new in this version:

- Positive Las Vegas hole, subtotal, and total points use an explicit plus prefix.
- Flipped Las Vegas pair numbers use a bomb icon instead of an asterisk on both the page and shared PNG.
- Opening the score pad reserves enough document scroll space; advancing writes directly to the real document scroller by one measured player-row step.
- PWA asset query version is `v190`.

### v6.1.7 - Visible one-row score advance

Date: 2026-08-05

Tag: `v6.1.7`

Live URL:

`https://zxj088.github.io/jfk/?v=189`

What is new in this version:

- After a score is entered and the pad advances, the page scrolls upward by the measured distance between the current and next player rows.
- The active player therefore moves up exactly one visible score row instead of scrolling an already visible completed row.
- PWA asset query version is `v189`.

### v6.1.6 - Score entry focus and marker polish

Date: 2026-08-05

Tag: `v6.1.6`

Live URL:

`https://zxj088.github.io/jfk/?v=188`

What is new in this version:

- Entering a score scrolls the background play view to the player row that was just scored before the pad advances.
- Under-par play buttons use a solid red background with white text.
- The Net label and its value stay on one line inside the score button.
- PWA asset query version is `v188`.

### v6.1.5 - Stable live team layout

Date: 2026-08-05

Tag: `v6.1.5`

Live URL:

`https://zxj088.github.io/jfk/?v=187`

What is new in this version:

- The active Las Vegas game card uses two equal team columns instead of the legacy three-column score grid.
- Team labels, player names, and points remain readable without vertical character wrapping on narrow phones.
- PWA asset query version is `v187`.

### v6.1.4 - Mobile scoring interaction polish

Date: 2026-08-05

Tag: `v6.1.4`

Live URL:

`https://zxj088.github.io/jfk/?v=186`

What is new in this version:

- The three recent courses share one compact mobile row, while setup explanations use on-demand help popovers.
- History card actions float beside the menu trigger and Las Vegas team results align in stable Team A / Team B rows.
- Scorecard dividers are lighter; under-par and Clear score-pad states have clearer red semantics.
- Advancing the score pad automatically scrolls the newly selected player into view.
- PWA asset query version is `v186`.

### v6.1.3 - Shared games with isolated preferences

Date: 2026-08-05

Tag: `v6.1.3`

Live URL:

`https://zxj088.github.io/jfk/?v=185`

What is new in this version:

- Old and new interfaces share the `default` Supabase room, so cloud games, scores, history, and courses appear in both.
- Local preferences, language, page state, cached state, PWA identity, and device/edit identity remain namespaced under `jfk.`.
- Switching the scoring interface may require the edit code because each site keeps an independent device identity.
- PWA asset query version is `v185`.

### v6.1.2 - Dedicated JFK app identity

Date: 2026-08-05

Tag: `v6.1.2`

Live URL:

`https://zxj088.github.io/jfk/?v=184`

What is new in this version:

- The new site uses a dedicated midnight-blue `JFK GOLF` icon with a green fairway and gold flag.
- Page branding and 192px, 512px, and scalable PWA icons no longer reuse the old site’s shield artwork.
- Local and cloud isolation from v6.1.1 remains in force.
- PWA asset query version is `v184`.

### v6.1.1 - Complete old/new site isolation

Date: 2026-08-05

Tag: `v6.1.1`

Live URL:

`https://zxj088.github.io/jfk/?v=183`

What is new in this version:

- Every browser storage key is namespaced under `jfk.` so the old path cannot read changes made by the new site.
- Device identity, scoring identity, edit ownership, language, welcome state, and PWA reload state are independent.
- Cloud rounds and courses use the separate Supabase room `jfk-v1` instead of the old site’s `default` room.
- PWA asset query version is `v183`.

### v6.1.0 - Complete mobile senior UX pass

Date: 2026-08-05

Tag: `v6.1.0`

Live URL:

`https://zxj088.github.io/jfk/?v=182`

What is new in this version:

- Simple score display is the default; full score details remain available with one 44px control.
- Net captions, table headers, supporting text, navigation, and key controls are larger on phones.
- Recent courses reduce setup work and the last course area is remembered.
- History cards use a three-line hierarchy, one final scoring mode, fewer pills, consistent vector icons, and a secondary actions menu.
- Setup terms have plain-language inline explanations and dirty forms are protected from accidental Escape dismissal.
- PWA asset query version is `v182`.

### v6.0.0 - Senior-friendly interface refresh

Date: 2026-08-05

Tag: `v6.0.0`

Live URL:

`https://zxj088.github.io/jfk/?v=181`

What is new in this version:

- Published as an independent site so the v5.1.3 `golf-score-vegas` site remains unchanged.
- Returning users skip the welcome screen, while the home header always shows the ready state.
- Setup explanations, minimum touch sizes, scorecard captions, navigation labels, and history cards are easier to read.
- Modal background isolation, focus trapping, and focus restoration improve keyboard and screen-reader use.
- Live-game accent colors remain stable when list order changes.
- PWA identity is scoped to `/jfk/` and asset query version is `v181`.

### v5.1.3 - Compact player setup and live-game colors

Date: 2026-08-05

Tag: `v5.1.3`

Live URL:

`https://zxj088.github.io/golf-score-vegas/?v=180`

What is new in this version:

- Player number labels are removed from the new-game player step while accessible labels remain available.
- Las Vegas keeps player selection and handicap controls on two rows; Wolf & Pack keeps them on one row.
- Ongoing games on the home page use restrained alternating color accents for easier visual distinction.
- PWA asset query version is `v180`.

### v5.1.2 - Scoring ownership reliability

Date: 2026-08-05

Tag: `v5.1.2`

Live URL:

`https://zxj088.github.io/golf-score-vegas/?v=179`

What is new in this version:

- The scoring phone keeps edit rights after a background or weak-network lease expiry when the cloud owner is still the same phone.
- Returning to the foreground immediately validates and renews the scoring lock.
- Lock refreshes run one at a time and do not race pending score saves.
- Cloud requests time out instead of blocking lock renewal indefinitely.
- PWA asset query version is `v179`.

### v5.0 - Guided setup and fixed Wolf baseline

Date: 2026-08-01

Tag: `v5.0`

Live URL:

`https://zxj088.github.io/golf-score-vegas/?v=150`

What is new in this version:

- New games use a four-step mobile wizard: course, game type, players, then review and edit-code confirmation.
- Wolf & Pack supports Rotating Wolf and Fixed Wolf modes; the fixed player is selected during setup and cannot change during the round.
- Recorded strokes are no longer capped, while the selected per-hole points cap still applies to winnings and losses.
- The scoring page shows each player's cumulative points through the current hole and asks before advancing after a completed hole; hole 18 asks whether to finish the game.
- Shared Wolf & Pack cards show detailed, color-coded hole results for every player's Wolf and Pack roles.
- PWA asset query version is `v150`.

v5.0.1 follow-up uses PWA asset query `v151` and combines player entry/history selection, shows Fixed Wolf from hole 1, hides disabled tie advantage text, cancels only equal-level special scores, and compacts shared player statistics.

v5.0.2 uses PWA asset query `v152` and adds a consistent click-to-open historical-player menu inside the combined player-name control.

v5.0.3 uses PWA asset query `v153` and renames the Chinese Rotating Wolf option to “输赢轮换”.

v5.0.4 uses PWA asset query `v154`, displays “Result Rotation” in the compact English UI, uses “Result-Based Rotation” in the rules, and restores Chinese translations for the updated setup hints.

v5.0.5 uses PWA asset query `v155`, makes Net the default scoring mode, improves the history-picker control, restores explicit handicap steppers, and prevents duplicate player selection.

v5.0.6 uses PWA asset query `v156` and adds visible scoring-device ownership, take-over/transfer controls, last-sync time, completed-game locking, and optional cloud version conflict protection.

v5.0.7 uses PWA asset query `v157`, shortens both history filters to “All/全部”, and separates player-name keyboard input from the historical-player menu button on mobile.

v5.0.8 uses PWA asset query `v158` and gives Wolf & Pack game cards a balanced three-line layout: course/time, game mode, then all player results.

v5.0.9 uses PWA asset query `v159` and makes scoring transfer resilient to background lock-refresh races, so releasing edit control no longer reports a false phone-version conflict.

v5.0.10 uses PWA asset query `v160`, gives the scoring-device system bar a smaller, compact type scale with a distinct cool blue-gray status palette, and simplifies the language button to show only the target language.

### v4.4 - Stable Wolf & Pack mobile baseline

Date: 2026-07-31

Tag: `v4.4`

Live URL:

`https://zxj088.github.io/golf-score-vegas/?v=149`

What is good in this version:

- Las Vegas and Wolf & Pack Scoring are fully integrated with bilingual rules, setup, scoring, leaderboard, history, and sharing.
- Wolf & Pack supports automatic hole settlement, winner-only gross-score bombs, fair next-Wolf rotation, manual overrides, and 3- or 4-player games.
- Historical players can be selected reliably on mobile and automatically restore their most recent handicap.
- Mobile setup hints stay within the visible screen and player fields remain readable on narrow devices.
- High-resolution share scorecards fit the phone width and use enlarged player statistics, hole details, and total-row text.
- PWA asset query version is `v149`.

### v4.3 - Las Vegas and Fight the Landlord

Date: 2026-07-30

Live URL:

`https://zxj088.github.io/golf-score-vegas/?v=120`

What is new in this version:

- New games can use either Las Vegas or Fight the Landlord scoring.
- Fight the Landlord supports 3 or 4 players, per-hole landlord selection, x1/x2/x4 multipliers, point caps, double-par protection, and optional landlord tie privilege.
- Gross or net mode controls Fight the Landlord settlement; net mode uses the same full-handicap hole allocation as Las Vegas.
- Dedicated mobile score entry, hole settlement results, leaderboard, history summaries, and shareable PNG scorecard.
- Rules dialog explains both games, and History can be filtered by game type.
- PWA asset query version is `v149`.

### v4.2 - Shareable scorecard baseline

Date: 2026-07-20

Tag: `v4.2`

Live URL:

`https://zxj088.github.io/golf-score-vegas/?v=110`

What is good in this version:

- Stable bilingual mobile scoring UI with edit-lock-aware game navigation.
- Startup welcome photo displays for at least one second while the initial cloud connection settles.
- Finish flow can generate, preview, share, or download a high-resolution game scorecard PNG.
- Shared scorecard uses a Leaderboard-style table with gross scores, small net scores, team numbers, and signed results.
- Under-par details highlight praised players and flipped losing players, with gross/net win-loss analysis.
- Flip analysis uses dedicated `🔄`, `💣`, and italic `EXTRA` indicators.
- PWA asset query version is `v111`.

### v4.1 - Welcome screen and shareable game scorecard

Date: 2026-07-20

Tag: `v4.1`

Live URL:

`https://zxj088.github.io/golf-score-vegas/?v=110`

What is good in this version:

- Bilingual golf-photo welcome screen during initial cloud connection.
- Ongoing games open Play only on the phone holding the current edit lock; other phones open Leaderboard.
- Finish flow can generate and share a full portrait game scorecard PNG.
- Shared scorecards use the supplied golf photo background with opaque readable data panels.
- Under-par holes show player details, flip-before/after results, and additional flip points for gross and net scoring.
- Chinese ongoing-game Modify action is labeled 设置.
- PWA asset query version is `v110`.

### v4.0 - Official v4 mobile scoring UI

Date: 2026-07-18

Tag: `v4.0`

Live URL:

`https://zxj088.github.io/golf-score-vegas/?v=100`

What is good in this version:

- Mobile-first bottom navigation with Home, Play, Leaderboard, and Courses.
- New Play page for fast hole-by-hole score entry, inspired by Golf GameBook style.
- Leaderboard page keeps the full Las Vegas rule scorecard table.
- Home page has cleaner game cards with compact total/net result rows.
- History filters support recent time ranges, custom date range, and played course filtering.
- Current tab and current Play hole are remembered after page refresh.
- Edit authorization is kept after refresh on the same phone, and another phone can take over edit authorization.
- Under Par Flip wording is simplified to Flip in the compact leaderboard controls.
- Supabase cloud sync remains the shared database for games and courses.
- PWA cache version is `v100`.

### v3.0-final - Stable classic scorecard

Tag: `v3.0-final`

What is good in this version:

- Stable bilingual English/Chinese UI in one site.
- Classic full scorecard layout as the main play experience.
- Gross/net scoring support with player handicaps and hole difficulty/index.
- Preset course library plus editable custom courses.
- Rule help popup and Las Vegas rule wording.
- Supabase shared cloud data for games and courses.

### v1.0 - First stable prototype

Tag: `v1.0`

What is good in this version:

- Original mobile web scorecard baseline.
- Las Vegas team scoring.
- Birdie flip option.
- Local score saving and course setup.

## How To Switch Version In Codex

Use these commands in the repo folder:

```powershell
git fetch --all --tags
git switch v4-dev
git reset --hard v4.2
```

To switch back to the current development branch later:

```powershell
git fetch origin
git switch v4-dev
git reset --hard origin/v4-dev
```

If there are local changes you want to keep, commit or stash them before using `git reset --hard`.

## How To Switch Version In GitHub

1. Open the repository in GitHub.
2. Click the branch/tag selector near the top-left of the file list.
3. Choose the `Tags` tab.
4. Select `v4.2`, `v4.1`, `v4.0`, `v3.0-final`, or another baseline tag.
5. To restore a baseline as the live website, create a branch from that tag or use GitHub Desktop/command line to push that tag commit to `main`.

Command line example to publish `v4.2` to the live GitHub Pages site:

```powershell
git fetch --all --tags
git switch v4-dev
git reset --hard v4.2
git push origin v4-dev:main
```

## Notes

- The live website is served from `main`.
- Development continues on `v4-dev`.
- Baselines are Git tags, so they are easy to find and do not move.
- Query versions like `?v=100` help phones and browsers load the newest cached files.
