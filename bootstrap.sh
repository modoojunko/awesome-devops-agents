#!/usr/bin/env bash
set -euo pipefail

# awesome-devops-agents bootstrap.sh
# Usage: bash bootstrap.sh
#
# Does two things:
#   1. Detect/install Claude Code
#   2. Configure LLM provider

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()   { echo -e "${RED}[ERR]${NC} $1"; }

# ─── Step 1: Detect / Install Claude Code ──────────────────────────

info "Checking Claude Code..."

if command -v claude &>/dev/null; then
    CL_VERSION=$(claude --version 2>/dev/null || echo "unknown")
    ok "Claude Code found (v${CL_VERSION})"
else
    warn "Claude Code not found. Installing..."
    if command -v npm &>/dev/null; then
        npm install -g @anthropic-ai/claude-code
        ok "Claude Code installed via npm"
    else
        err "npm not found. Please install Node.js first: https://nodejs.org"
        exit 1
    fi
fi

# ─── Step 2: Configure LLM ─────────────────────────────────────────

info "Configuring LLM provider..."

configure_anthropic() {
    echo ""
    read -rsp "Enter your Anthropic API Key: " ANTHROPIC_API_KEY
    echo ""
    if [ -z "$ANTHROPIC_API_KEY" ]; then
        err "API Key cannot be empty"
        exit 1
    fi
    export ANTHROPIC_API_KEY
    # Persist to shell profile if not present
    local profile_files=("$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.profile")
    local profile_count=0
    for pf in "${profile_files[@]}"; do
        if [ -f "$pf" ] && ! grep -q "ANTHROPIC_API_KEY" "$pf" 2>/dev/null; then
            printf '\nexport ANTHROPIC_API_KEY=%q\n' "$ANTHROPIC_API_KEY" >> "$pf"
            ok "Saved to $pf"
            profile_count=$((profile_count + 1))
        fi
    done
    if [ "$profile_count" -eq 0 ]; then
        # Fallback: write to first existing profile
        for pf in "${profile_files[@]}"; do
            if [ -f "$pf" ]; then
                printf '\nexport ANTHROPIC_API_KEY=%q\n' "$ANTHROPIC_API_KEY" >> "$pf"
                ok "Updated existing key in $pf"
                break
            fi
        done
    fi
    ok "Anthropic API Key configured"
}

configure_custom() {
    echo ""
    read -rsp "Enter your API Key: " CUSTOM_API_KEY
    echo ""
    read -rp "Enter your API Endpoint URL (e.g. https://api.openai.com/v1): " CUSTOM_ENDPOINT
    read -rp "Enter model name (e.g. gpt-4o, claude-sonnet-4-6): " CUSTOM_MODEL
    if [ -z "$CUSTOM_API_KEY" ] || [ -z "$CUSTOM_ENDPOINT" ]; then
        err "API Key and Endpoint are required"
        exit 1
    fi
    # Write Claude Code config file
    mkdir -p "$HOME/.claude"
    cat > "$HOME/.claude/settings.json" << __EOF__
{
  "model": "${CUSTOM_MODEL:-claude-sonnet-4-6}",
  "apiKey": "${CUSTOM_API_KEY}",
  "endpoint": "${CUSTOM_ENDPOINT}"
}
__EOF__
    chmod 600 "$HOME/.claude/settings.json"
    ok "Custom LLM provider configured"
}

echo ""
echo "Select LLM provider:"
echo "  1) Anthropic (Claude) — recommended"
echo "  2) Custom (OpenAI-compatible API)"
echo ""
read -rp "Choice [1/2]: " llm_choice

case "$llm_choice" in
    1) configure_anthropic ;;
    2) configure_custom ;;
    *) echo "Invalid choice, defaulting to Anthropic" && configure_anthropic ;;
esac

# ─── Done ──────────────────────────────────────────────────────────

echo ""
echo "┌────────────────────────────────────────────────────────┐"
echo "│  awesome-devops-agents  —  Installation Complete!      │"
echo "│                                                        │"
echo "│  Next step:                                            │"
echo "│    cd <your-project-dir>                               │"
echo "│    claude                                               │"
echo "│                                                        │"
echo "│  Claude Code will guide you through the rest.          │"
echo "└────────────────────────────────────────────────────────┘"
