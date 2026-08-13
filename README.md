# AI Engineer Growth OS

一个面向大模型学习、LeetCode 训练和技术面试准备的个人成长工作台。纯静态网页，无需账号和后端，打开即用；支持 BYOK（Bring Your Own Key），没有 Key 时自动使用内置训练内容。

## 已有功能

- 建立目标岗位、称呼和每周学习时间档案
- 每日 LLM 原理、算法、工程和表达训练任务
- 12 周 AI 工程师成长路线
- LeetCode 分级提示，不直接展示完整答案
- 保存当前解题尝试、记录提示依赖度
- 生成每周模拟面试训练清单
- 连接任意 OpenAI-compatible API，获得针对草稿的苏格拉底式追问
- 无 Key、网络失败或跨域受限时自动降级到内置提示
- 桌面端与移动端响应式界面

## 使用自己的模型 API

1. 点击页面右上角 **连接 AI 导师**。
2. 输入 OpenAI-compatible API 地址、模型名称和自己的 API Key。
3. 点击 **测试并保存**。
4. 在算法训练区先写草稿，再点击 **让 AI 审阅当前思路**。

API Key 只保存在当前标签页的 `sessionStorage` 中，关闭标签页后自动清除；不会写入 `localStorage`、源码、构建文件或 GitHub。API 地址与模型名称会保存在浏览器，方便下次填写。

浏览器会直接请求用户配置的模型服务，因此该服务必须允许网页跨域访问（CORS）。不允许跨域时，可使用服务商提供的浏览器兼容端点、本地代理，或继续使用无需 Key 的内置模式。

## 本地运行

需要 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

## 发布到 GitHub Pages

1. 在 GitHub 创建一个空仓库。
2. 将本项目推送到仓库的 `main` 分支。
3. 打开仓库 **Settings → Pages**。
4. 将 **Source** 设置为 **GitHub Actions**。
5. 推送后，`Deploy to GitHub Pages` 工作流会自动构建并发布。

项目使用相对资源路径，无论仓库名称是什么都可正常发布。

## 数据与隐私

默认模式不连接服务器。用户主动连接 AI 后，当前题目和解题草稿会直接发送给用户配置的模型服务，请勿提交敏感信息。学习档案、完成记录和解题草稿保存在浏览器 `localStorage`；API Key 仅临时保存在 `sessionStorage`。不同浏览器或设备之间暂不自动同步。

## 后续路线

- 入学能力诊断与动态 12 周计划
- LeetCode 题库、间隔复习调度和错因分类
- LLM 交互式实验与项目评审模板
- 更多动态题目与大模型实验课程
- 数据导入导出与跨设备同步

## License

MIT