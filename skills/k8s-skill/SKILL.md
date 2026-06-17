---
name: k8s-skill
description: 部署应用到 K8s dev 命名空间验证
---

# Kubernetes Skill

将容器化应用部署到开发 K8s 命名空间进行验证。

## 前提

- `kubectl` 已连接目标集群
- 已切换或创建 dev 命名空间

## 能力

### 生成 K8s 资源清单

```bash
# Deployment
kubectl create deployment <name> --image=<image> --dry-run=client -o yaml

# Service
kubectl expose deployment <name> --port=8080 --dry-run=client -o yaml
```

### 部署到 dev 命名空间

```bash
kubectl apply -f k8s/dev/ -n dev
kubectl rollout status deployment/<name> -n dev
kubectl get pods -n dev
```

### 日志与调试

```bash
kubectl logs -f deployment/<name> -n dev
kubectl describe pod <pod-name> -n dev
kubectl port-forward svc/<name> 8080:8080 -n dev
```

## Checklist

- [ ] 确认 kubectl 已连接集群
- [ ] 创建/确认 dev 命名空间
- [ ] 生成 Deployment + Service 清单
- [ ] 部署到 dev 命名空间
- [ ] 验证 rollout 状态
- [ ] 提供访问入口（port-forward / ingress）
- [ ] 告知开发者验证地址
