# Vegas Golf Scorecard Version Log

This file records the good baseline versions of the app and how to switch back to them in Codex or GitHub.

## Good Baselines

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
