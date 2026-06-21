#!/usr/bin/env bash
# gh-issue.sh — GitHub Issue 操作适配器
#
# 用法:
#   gh-issue.sh list [--assignee @me]
#   gh-issue.sh view <issue-number>
#   gh-issue.sh comment <issue-number> --body <text>
#   gh-issue.sh create --title <title> --body <body> [--label <label>]

set -euo pipefail

GH_CMD=${GH_CMD:-gh}

check_gh() {
  if ! command -v "$GH_CMD" &>/dev/null; then
    echo "[ERROR] gh CLI not found. Install: https://cli.github.com/" >&2
    exit 1
  fi
}

cmd_list() {
  local assignee=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --assignee) assignee="$2"; shift 2 ;;
      --label)    label="$2";    shift 2 ;;
      --state)    state="$2";    shift 2 ;;
      *) echo "[ERROR] Unknown arg: $1" >&2; exit 1 ;;
    esac
  done

  local args=("--json" "number,title,state,updatedAt,labels,assignees")
  [[ -n "$assignee" ]] && args+=("--assignee" "$assignee")
  [[ -n "${label:-}" ]] && args+=("--label" "$label")
  [[ -n "${state:-}" ]] && args+=("--state" "$state")

  $GH_CMD issue list "${args[@]}"
}

cmd_view() {
  local issue_number="$1"
  $GH_CMD issue view "$issue_number" --json number,title,state,body,labels,assignees,comments,createdAt,updatedAt
}

cmd_comment() {
  local issue_number="" body=""
  issue_number="$1"; shift

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --body) body="$2"; shift 2 ;;
      *) echo "[ERROR] Unknown arg: $1" >&2; exit 1 ;;
    esac
  done

  if [[ -z "$body" ]]; then
    echo "[ERROR] --body is required" >&2
    exit 1
  fi

  $GH_CMD issue comment "$issue_number" --body "$body"
}

cmd_create() {
  local title="" body="" label=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --title) title="$2"; shift 2 ;;
      --body)  body="$2";  shift 2 ;;
      --label) label="$2"; shift 2 ;;
      *) echo "[ERROR] Unknown arg: $1" >&2; exit 1 ;;
    esac
  done

  if [[ -z "$title" || -z "$body" ]]; then
    echo "[ERROR] --title and --body are required" >&2
    exit 1
  fi

  local args=("--title" "$title" "--body" "$body")
  [[ -n "$label" ]] && args+=("--label" "$label")

  $GH_CMD issue create "${args[@]}" --json number,title,state,url
}

# --- main ---
check_gh
[[ $# -lt 1 ]] && { echo "Usage: gh-issue.sh <list|view|comment|create> [...]" >&2; exit 1; }

subcommand="$1"; shift
case "$subcommand" in
  list)    cmd_list "$@" ;;
  view)    cmd_view "$@" ;;
  comment) cmd_comment "$@" ;;
  create)  cmd_create "$@" ;;
  *)       echo "[ERROR] Unknown subcommand: $subcommand" >&2; exit 1 ;;
esac
