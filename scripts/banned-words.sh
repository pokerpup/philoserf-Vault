#!/usr/bin/env bash
# scripts/banned-words.sh — grep for the reference game's names and phrases.
# Usage: scripts/banned-words.sh [file-or-dir ...]   (default: packages/game-data and art under the repo root)
# Exit 2 on any hit, 0 when clean, 1 when the list is empty. Whole-word, case-insensitive;
# '#' lines in the list are comments; a straight apostrophe in the list also matches a curly one.
set -u
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/.." && pwd)"
list="$here/banned-words.txt"
pattern="$(grep -v '^[[:space:]]*#' "$list" | grep -v '^[[:space:]]*$' \
  | sed 's/[][\.*^$()|+?{}]/\\&/g' | sed "s/'/('|’)/g" | paste -sd'|' -)"
if [ -z "$pattern" ]; then echo "banned-words: $list has no entries" >&2; exit 1; fi
if [ "$#" -eq 0 ]; then set -- "$root/packages/game-data" "$root/art"; fi
targets=()
for t in "$@"; do [ -e "$t" ] && targets+=("$t"); done
[ "${#targets[@]}" -eq 0 ] && exit 0
hits="$(grep -rniwEH --binary-files=without-match --exclude-dir=node_modules --exclude-dir=.git "($pattern)" "${targets[@]}" 2>/dev/null)"
if [ -n "$hits" ]; then
  printf '%s\n' "$hits"
  echo "banned-words: $(printf '%s\n' "$hits" | wc -l | tr -d ' ') hit(s); every name and line must be original (PROMPT.md §0 rule 8)" >&2
  exit 2
fi
exit 0
