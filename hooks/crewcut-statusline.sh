#!/usr/bin/env bash
# Adapted from ponytail (https://github.com/DietrichGebert/ponytail, MIT,
# (c) 2026 DietrichGebert) — see /NOTICE.md.
# CLAUDE_CONFIG_DIR overrides ~/.claude, matching where the hooks write the flag
flag="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/.crewcut-active"
[ -f "$flag" ] || exit 0

mode=$(head -n1 "$flag" | tr -d '[:space:]')

if [ -z "$mode" ] || [ "$mode" = "full" ]; then
    printf '\033[38;5;73m[CREWCUT]\033[0m'
else
    printf '\033[38;5;73m[CREWCUT:%s]\033[0m' "$(printf '%s' "$mode" | tr '[:lower:]' '[:upper:]')"
fi
