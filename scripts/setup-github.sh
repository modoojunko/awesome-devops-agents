#!/usr/bin/env bash
# setup-github.sh — GitHub CLI 认证配置
#
# 用法:
#   ./setup-github.sh          # 交互式登录
#   ./setup-github.sh --token  # 从 stdin 或 GH_TOKEN 读取 token

set -euo pipefail

GH_CMD=${GH_CMD:-gh}

echo "=== GitHub CLI 认证配置 ==="

# 1. 检查 gh 是否安装
if ! command -v "$GH_CMD" &>/dev/null; then
  echo "[ERROR] gh CLI 未安装"
  echo "  安装: https://cli.github.com/"
  echo ""
  echo "  macOS: brew install gh"
  echo "  Windows: winget install GitHub.cli"
  echo "  Linux: curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | ..."
  exit 1
fi

# 2. 先检查是否已认证
if $GH_CMD auth status &>/dev/null; then
  echo "  ✅ 已认证"
  $GH_CMD auth status
  exit 0
fi

echo "  ⚠️  未登录，开始配置..."

# 3. 配置方式
if [[ "${1:-}" == "--token" ]]; then
  # Token 模式：从 GH_TOKEN 环境变量或 stdin 读取
  if [[ -n "${GH_TOKEN:-}" ]]; then
    echo "$GH_TOKEN" | $GH_CMD auth login --with-token
  else
    echo "  从 stdin 读取 token..."
    $GH_CMD auth login --with-token
  fi
else
  # 交互式模式
  echo "  启动交互式登录..."
  echo "  请选择:"
  echo "    - GitHub.com  → 选 'GitHub.com'"
  echo "    - HTTPS       → 选 'HTTPS'"
  echo "    - Yes         → 认证 Git 操作"
  echo "    - Paste       → 粘贴 Personal Access Token"
  echo ""
  $GH_CMD auth login
fi

# 4. 验证结果
if $GH_CMD auth status &>/dev/null; then
  echo ""
  echo "  ✅ GitHub 认证成功！"
  $GH_CMD auth status
else
  echo ""
  echo "  ❌ 认证失败"
  echo "  请创建 Personal Access Token:"
  echo "    https://github.com/settings/tokens"
  echo "  需要 scope: repo, read:org, read:user"
  exit 1
fi
