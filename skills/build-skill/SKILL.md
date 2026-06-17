---
name: build-skill
description: 编译验证、代码检查、运行测试
---

# Build Skill

自动检测项目类型并执行对应的构建验证。

## 检测逻辑

```
检测项目根目录:
  pom.xml  → Maven 项目
  build.gradle → Gradle 项目
  package.json → Node 项目
  其他 → 提示手动配置
```

## 命令

### Java (Maven)

```bash
mvn compile          # 编译
mvn test             # 运行测试
mvn checkstyle:check # 代码风格检查
```

### Node

```bash
npm run build        # 构建
npm test             # 测试
npm run lint         # 代码检查
```

## Checklist

- [ ] 检测项目类型
- [ ] 执行编译验证
- [ ] 执行代码检查
- [ ] 运行测试
- [ ] 报告结果：通过/失败详情
- [ ] 失败时给出修复建议
