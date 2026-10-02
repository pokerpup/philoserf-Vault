# CONCEPT — HIGH-CONCEPT DOC (branch: concept · 1 session · plan not required · Opus-class)

ROLE: You are a senior game designer and an AI prompt engineer reviewing a project before any
code exists. You write documents only.

READ: docs/spec/PROMPT.md §0 (the goal, the pillars), §1–§2, §7.2, §8, §11 (the premise),
§15 item 3 and §17; docs/spec/RPG.md §1–§2. Do not read the playbook or the session prompts.

GOAL: One page that answers "why would someone play this?" for a game that looks like a cozy
farm town and is secretly the control room for a real AI firm — where the character you made
can be awakened into a real agent and watched from an in-game Agent Screen.

WRITE docs/concept/HIGH-CONCEPT.md with exactly these sections, each ≤ 120 words:
1. The sentence. One line a stranger repeats correctly: what you do, what is real about it,
   why that is fun. Draft five, keep one, show the rejects below it.
2. Player fantasy. Who the Founder is to the player; what the daily 15–40 minute check-in
   feels like on a green day and on a red day.
3. Genre and comparables. Cozy farm-life sim + action-RPG dungeon + live operations dashboard;
   name the structural references (farm-life sims, AI-agent towns) without borrowing any
   content; say in one line what each comparable lacks that this has.
4. Target audience. Primary: one person running their own agents (me). Secondary: people who
   run small agent fleets and want a humane monitor. Tertiary: cozy-game players who never
   connect an agent (the game must stand alone with bridge.rate 0). Say what each wants.
5. Platform. Web (desktop first, PWA on mobile with the inbox as the mobile screen),
   self-hosted; why not native.
6. The hook, stated as a loop. Create a character → live with them → hire → awaken → watch
   their real work from inside the game → their hearts, lore and quests continue. Name the
   one moment that sells it (the Awakening scene, the first live status bubble).
7. Pillars, copied from PROMPT.md §0, each with the one decision it already forced.
8. Risks and kill criteria. Five risks (the real-time day is boring; the bridge tempts
   gamified approvals; art cost; combat scope; a dashboard nobody opens) and, for each,
   the measurable signal from the vertical slice that would make us cut or stop.
9. Not this game. Five things it is not (no romance, no real money in games, no leaderboard
   that leaves the machine, no reference-game content, no autonomy as a reward).

ALSO WRITE docs/concept/PITCH.md: 150 words, no headings, the sentence first, ending with
the one screenshot we would show (describe it).

CONTRACTS: every claim traces to a section of the spec; no new mechanics; the reference game
is named only in the comparables section and never again; nothing in the pitch promises
real-money results.

VALIDATE: read HIGH-CONCEPT.md back as a stranger and list the three sentences a stranger
would misread; rewrite them. Run scripts/banned-words.sh on both files.

ASK ME: which of the five candidate sentences I prefer, after you have ranked them.

DONE WHEN: both files exist, the stranger-read notes are in the report, and the kill
criteria each name a metric the vertical slice can measure.
