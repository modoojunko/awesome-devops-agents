#!/usr/bin/env bash
# gh-pr.sh — GitHub PR 操作适配器
#
# 用法:
#   gh-pr.sh create --title <title> --body <body> [--base <branch>]
#   gh-pr.sh list [--state open|closed|merged]
#   gh-pr.sh view <pr-number|branch>
#   gh-pr.sh merge <pr-number>

set -euo pipefail

GH_CMD=${GH_CMD:-gh}

check_gh() {
  if ! command -v "$GH_CMD" &>/dev/null; then
    echo "[ERROR] gh CLI not found. Install: https://cli.github.com/" >&2
    exit 1
  fi
}

cmd_create() {
  local title="" body="" base=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --title) title="$2"; shift 2 ;;
      --body)  body="$2";  shift 2 ;;
      --base)  base="$2";  shift 2 ;;
      *) echo "[ERROR] Unknown arg: $1" >&2; exit 1 ;;
    esac
  done

  if [[ -z "$title" || -z "$body" ]]; then
    echo "[ERROR] --title and --body are required" >&2
    exit 1
  fi

  local args=("--title" "$title" "--body" "$body")
  [[ -n "$base" ]] && args+=("--base" "$base")

  $GH_CMD pr create "${args[@]}" --json number,title,state,url
}

cmd_list() {
  local state="open"
  [[ $# -gt 0 ]] && state="${1#--state=}" && state="${state#--state }"

  $GH_CMD pr list --state "$state" --json number,title,state,headRefName,updatedAt
}

cmd_view() {
  local target="$1"
  $GH_CMD pr view "$target" --json number,title,state,body,headRefName,baseRefName,url,additions,deletions,reviews
}

cmd_merge() {
  local pr_number="$1"
  $GH_CMD pr merge "$pr_number" --merge --body ""
}

# --- main ---
check_gh
[[ $# -lt 1 ]] && { echo "Usage: gh-pr.sh <create|list|view|merge> [...]" >&2; exit 1; }

subcommand="$1"; shift
case "$subcommand" in
  create) cmd_create "$@" ;;
  list)   cmd_list "$@" ;;
  view)   cmd_view "$@" ;;
  merge)  cmd_merge "$@" ;;
  *)      echo "[ERROR] Unknown subcommand: $subcommand" >&2; exit 1 ;;
esac
