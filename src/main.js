import './style.css'

const STORAGE_KEY = 'ai-engineer-growth-os-v1'
const API_KEY_SESSION = 'ai-engineer-growth-os-api-key'

const tasks = [
  { id: 'attention', type: 'LLM 原理', title: '拆解 Self-Attention', detail: '画出 Q/K/V 张量形状，并解释缩放点积。', minutes: 25, icon: '⌁' },
  { id: 'window', type: '算法模式', title: '滑动窗口：最小覆盖子串', detail: '先写不变量，再编码；目标 35 分钟内无提示完成。', minutes: 35, icon: '↔' },
  { id: 'rag', type: '工程实践', title: '给 RAG 增加引用校验', detail: '为每条回答绑定检索片段，记录无法支持的陈述。', minutes: 30, icon: '◇' },
  { id: 'review', type: '复盘表达', title: '口述今天的技术决策', detail: '用 3 分钟讲清问题、方案、取舍和验证方法。', minutes: 10, icon: '◉' },
]

const roadmap = [
  { phase: '01', title: '基础重建', weeks: '第 1–2 周', topics: 'Python · 复杂度 · 张量 · 神经网络', status: 'current' },
  { phase: '02', title: '核心模型', weeks: '第 3–5 周', topics: 'Transformer · Tokenizer · 训练与推理', status: 'next' },
  { phase: '03', title: '算法模式', weeks: '第 2–8 周', topics: '窗口 · 树图 · 回溯 · 动态规划', status: 'next' },
  { phase: '04', title: 'LLM 工程', weeks: '第 6–9 周', topics: 'RAG · Agent · 微调 · 评估', status: 'locked' },
  { phase: '05', title: '面试冲刺', weeks: '第 10–12 周', topics: '系统设计 · 项目深挖 · 模拟面试', status: 'locked' },
]

const hints = [
  '先复述题目：窗口需要满足什么条件？什么时候窗口才算“可行”？',
  '尝试用两个哈希表：一个记录目标需求，一个记录当前窗口。你还需要一个变量表示多少类字符已经满足。',
  '右指针负责扩张直到可行；一旦可行，左指针持续收缩并更新最短答案。注意字符计数从满足变为不满足的时机。',
  '伪代码：移动 right → 更新计数 → 若新满足则 valid++ → 当 valid 等于需求种类时循环移动 left → 保存最优区间。',
  '参考复杂度：两个指针都最多遍历字符串一次，时间 O(n)，空间 O(k)。现在请先独立写代码，再对照测试。',
]

const defaults = {
  name: '学习者', goal: 'LLM 应用工程师', weeklyHours: 8, streak: 1,
  completed: [], hintLevel: 0, studyMinutes: 0, onboarded: false,
  apiBaseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', aiReply: '',
}

let state = loadState()

function loadState() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) }
  } catch {
    return { ...defaults }
  }
}

function saveState() {
  const { aiReply, ...persistentState } = state
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistentState))
}

function hasApiKey() {
  return Boolean(sessionStorage.getItem(API_KEY_SESSION))
}

function escapeHtml(value) {
  const element = document.createElement('div')
  element.textContent = String(value)
  return element.innerHTML
}

function render() {
  const completedMinutes = tasks.filter((task) => state.completed.includes(task.id)).reduce((sum, task) => sum + task.minutes, 0)
  const completion = Math.round((state.completed.length / tasks.length) * 100)
  const dateLabel = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date())

  document.querySelector('#app').innerHTML = `
    <aside class="sidebar">
      <a class="brand" href="#today"><span class="brand-mark">A+</span><span><strong>Growth OS</strong><small>AI ENGINEER TRACK</small></span></a>
      <nav aria-label="主导航">
        <a class="nav-link active" href="#today"><span>01</span>今日训练</a>
        <a class="nav-link" href="#roadmap"><span>02</span>成长路线</a>
        <a class="nav-link" href="#practice"><span>03</span>算法训练</a>
        <a class="nav-link" href="#interview"><span>04</span>面试实验室</a>
      </nav>
      <div class="sidebar-note"><span class="pulse"></span><p>学习原则</p><strong>不以“看懂”为掌握，<br>只以“独立完成”为掌握。</strong></div>
    </aside>

    <main>
      <header class="topbar">
        <div><span class="eyebrow">${dateLabel}</span><h1>早上好，${escapeHtml(state.name)}。</h1></div>
        <div class="topbar-actions"><button class="ai-status ${hasApiKey() ? 'connected' : ''}" id="openAiSettings"><span></span>${hasApiKey() ? 'AI 已连接' : '连接 AI 导师'}</button><button class="profile-button" id="openProfile"><span>${escapeHtml(state.name.slice(0, 1).toUpperCase())}</span><div><strong>${escapeHtml(state.goal)}</strong><small>每周 ${state.weeklyHours} 小时 · 编辑档案</small></div></button></div>
      </header>

      <section class="hero-panel" id="today">
        <div class="hero-copy"><span class="section-number">DAILY / 001</span><h2>今天不求学得多，<br><em>只求真正会一件事。</em></h2><p>90 分钟专注训练。先独立思考，再逐级请求提示；完成后安排间隔复习。</p></div>
        <div class="progress-orbit" style="--progress:${completion * 3.6}deg"><div><strong>${completion}%</strong><span>今日完成</span></div></div>
      </section>

      <section class="stats-grid" aria-label="学习数据">
        <article><span>连续学习</span><strong>${state.streak}<small> 天</small></strong><i>保持节奏，比突击更重要</i></article>
        <article><span>今日投入</span><strong>${completedMinutes}<small> / 100 分钟</small></strong><i>完成任务后自动累计</i></article>
        <article><span>无提示完成率</span><strong>${state.hintLevel === 0 ? '—' : Math.max(0, 100 - state.hintLevel * 18)}<small>${state.hintLevel === 0 ? '' : '%'}</small></strong><i>提示越少，掌握越扎实</i></article>
      </section>

      <section class="content-section">
        <div class="section-heading"><div><span class="eyebrow">TODAY'S PLAN</span><h2>今日任务</h2></div><span>${state.completed.length} / ${tasks.length} 已完成</span></div>
        <div class="task-list">${tasks.map((task, index) => `
          <article class="task ${state.completed.includes(task.id) ? 'done' : ''}">
            <button class="task-check" data-task="${task.id}">${state.completed.includes(task.id) ? '✓' : String(index + 1).padStart(2, '0')}</button>
            <span class="task-icon">${task.icon}</span><div class="task-copy"><small>${task.type}</small><h3>${task.title}</h3><p>${task.detail}</p></div><time>${task.minutes} MIN</time>
          </article>`).join('')}</div>
      </section>

      <section class="content-section" id="roadmap">
        <div class="section-heading"><div><span class="eyebrow">12-WEEK ROADMAP</span><h2>成长路线</h2></div><span>目标：${escapeHtml(state.goal)}</span></div>
        <div class="roadmap">${roadmap.map((item) => `<article class="roadmap-item ${item.status}"><span>${item.phase}</span><div><small>${item.weeks}</small><h3>${item.title}</h3><p>${item.topics}</p></div><b>${item.status === 'current' ? '进行中' : item.status === 'locked' ? '待解锁' : '下一阶段'}</b></article>`).join('')}</div>
      </section>

      <section class="practice-section" id="practice">
        <div class="practice-header"><span class="eyebrow">ALGORITHM DOJO / SLIDING WINDOW</span><h2>最小覆盖子串</h2><p>给定字符串 s 和 t，返回 s 中涵盖 t 所有字符的最短子串。如果不存在，返回空字符串。</p></div>
        <div class="practice-grid">
          <div class="problem-card">
            <div class="problem-meta"><span>LEETCODE 76</span><span>困难 · 高频</span></div>
            <pre><code>输入: s = "ADOBECODEBANC", t = "ABC"
输出: "BANC"

约束: 1 ≤ s.length, t.length ≤ 10⁵</code></pre>
            <label for="solution">写下你的思路或代码</label><textarea id="solution" placeholder="先写窗口的不变量，再开始编码……"></textarea>
            <div class="button-row"><button class="button primary" id="saveAttempt">保存本次尝试</button><button class="button secondary" id="resetHints">重新独立挑战</button></div>
          </div>
          <aside class="hint-card"><span class="hint-level">${hasApiKey() ? 'AI SOCRATIC COACH' : `提示阶梯 ${state.hintLevel} / ${hints.length}`}</span><h3>${state.aiReply ? 'AI 导师反馈' : state.hintLevel === 0 ? '先独立思考 10 分钟' : `第 ${state.hintLevel} 级提示`}</h3><p id="coachReply">${state.aiReply ? escapeHtml(state.aiReply) : state.hintLevel === 0 ? '描述暴力解法也算进展。卡住时只领取一级提示，不要一次看完答案。' : hints[state.hintLevel - 1]}</p><button class="button hint" id="askCoach">${hasApiKey() ? '让 AI 审阅当前思路 →' : '使用内置下一级提示 →'}</button><small>${hasApiKey() ? '导师只给一个关键追问或提示，不直接提供完整答案。Key 关闭标签页后自动清除。' : '无需 API Key；连接 AI 后可根据你的草稿生成个性化追问。'}</small></aside>
        </div>
      </section>

      <section class="interview-section" id="interview"><div><span class="eyebrow">MOCK INTERVIEW</span><h2>周末模拟面试</h2><p>算法编码 40 分钟 + LLM 原理追问 30 分钟 + 项目深挖 20 分钟。</p></div><button class="button light" id="startInterview">生成面试清单</button></section>
      <footer><strong>AI Engineer Growth OS</strong><span>所有数据仅保存在你的浏览器中 · 可部署到 GitHub Pages</span></footer>
    </main>

    <dialog id="profileDialog"><form method="dialog" id="profileForm"><button class="dialog-close" id="closeProfile" type="button" aria-label="关闭">×</button><span class="eyebrow">LEARNING PROFILE</span><h2>${state.onboarded ? '调整学习档案' : '建立你的学习起点'}</h2><p>工具会据此调整路线和每日训练强度，所有信息只保存在当前浏览器。</p><label>怎么称呼你？<input name="name" value="${escapeHtml(state.name === '学习者' ? '' : state.name)}" placeholder="你的名字" required></label><label>目标方向<select name="goal"><option>LLM 应用工程师</option><option>大模型算法工程师</option><option>AI Agent 工程师</option><option>科研型 AI 工程师</option></select></label><label>每周可投入时间<input name="weeklyHours" type="range" min="3" max="30" value="${state.weeklyHours}"><output>${state.weeklyHours} 小时</output></label><button class="button primary full" value="default">保存并开始训练</button></form></dialog>
    <dialog id="aiDialog"><form method="dialog" id="aiForm"><button class="dialog-close" id="closeAiSettings" type="button" aria-label="关闭">×</button><span class="eyebrow">BRING YOUR OWN KEY</span><h2>连接你的 AI 导师</h2><p>支持 OpenAI-compatible API。API Key 只保存在当前标签页的 <code>sessionStorage</code>，不会进入源码、GitHub 或长期存储；公共电脑请勿使用长期 Key。</p><label>API 服务地址<input name="apiBaseUrl" type="url" value="${escapeHtml(state.apiBaseUrl)}" placeholder="https://api.openai.com/v1" required></label><label>模型名称<input name="model" value="${escapeHtml(state.model)}" placeholder="gpt-4o-mini" required></label><label>API Key<input name="apiKey" type="password" value="${hasApiKey() ? '••••••••' : ''}" placeholder="sk-..." autocomplete="off" required></label><div class="connection-result" id="connectionResult">${hasApiKey() ? '当前标签页已保存临时 Key。' : '不填写也可继续使用内置提示。'}</div><div class="dialog-actions"><button class="button primary" id="testConnection" type="button">测试并保存</button><button class="button danger" id="clearApiKey" type="button">清除 Key</button></div></form></dialog>
    <div class="toast" role="status" aria-live="polite"></div>`

  bindEvents()
  if (!state.onboarded) document.querySelector('#profileDialog').showModal()
}

function bindEvents() {
  document.querySelectorAll('.task-check').forEach((button) => button.addEventListener('click', () => toggleTask(button.dataset.task)))
  document.querySelector('#openProfile').addEventListener('click', () => document.querySelector('#profileDialog').showModal())
  document.querySelector('#openAiSettings').addEventListener('click', () => document.querySelector('#aiDialog').showModal())
  document.querySelector('#closeAiSettings').addEventListener('click', () => document.querySelector('#aiDialog').close())
  document.querySelector('#closeProfile').addEventListener('click', () => {
    if (state.onboarded) document.querySelector('#profileDialog').close()
  })
  document.querySelector('#askCoach').addEventListener('click', askCoach)
  document.querySelector('#resetHints').addEventListener('click', () => {
    state.hintLevel = 0; state.aiReply = ''; saveState(); render(); document.querySelector('#practice').scrollIntoView()
  })
  document.querySelector('#saveAttempt').addEventListener('click', () => {
    const attempt = document.querySelector('#solution').value.trim()
    if (!attempt) return showToast('先写下一点思路，再保存本次尝试。')
    localStorage.setItem(`${STORAGE_KEY}-attempt`, attempt); showToast('本次尝试已保存在浏览器中。')
  })
  const savedAttempt = localStorage.getItem(`${STORAGE_KEY}-attempt`)
  if (savedAttempt) document.querySelector('#solution').value = savedAttempt
  document.querySelector('#startInterview').addEventListener('click', () => showToast('本周清单：滑动窗口编码、KV Cache 追问、RAG 项目深挖。'))
  const form = document.querySelector('#profileForm')
  const range = form.elements.weeklyHours
  range.addEventListener('input', () => { form.querySelector('output').textContent = `${range.value} 小时` })
  form.elements.goal.value = state.goal
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const data = new FormData(form)
    state = { ...state, name: data.get('name').trim(), goal: data.get('goal'), weeklyHours: Number(data.get('weeklyHours')), onboarded: true }
    saveState(); document.querySelector('#profileDialog').close(); render(); showToast('学习档案已更新。')
  })
  const aiForm = document.querySelector('#aiForm')
  document.querySelector('#testConnection').addEventListener('click', () => testConnection(aiForm))
  document.querySelector('#clearApiKey').addEventListener('click', () => {
    sessionStorage.removeItem(API_KEY_SESSION)
    state.aiReply = ''
    aiForm.elements.apiKey.value = ''
    document.querySelector('#connectionResult').textContent = 'Key 已从当前标签页清除，已切回内置提示。'
    saveState()
    showToast('API Key 已清除。')
  })
}

async function askCoach() {
  const attempt = document.querySelector('#solution').value.trim()
  if (!hasApiKey()) {
    if (state.hintLevel < hints.length) state.hintLevel += 1
    saveState(); render(); document.querySelector('#practice').scrollIntoView()
    return
  }
  if (!attempt) return showToast('请先写下你的思路或代码，AI 才能针对性追问。')
  const button = document.querySelector('#askCoach')
  button.disabled = true
  button.textContent = '导师正在阅读…'
  try {
    state.aiReply = await callModel([
      { role: 'system', content: '你是严格但友善的算法面试导师。使用苏格拉底式教学。只指出学习者当前思路中最关键的一个问题，并给一个追问或一级提示；不要给完整解法或完整代码。使用中文，控制在120字内。' },
      { role: 'user', content: `题目：LeetCode 76 最小覆盖子串。\n学习者当前草稿：\n${attempt}` },
    ])
    saveState(); render(); document.querySelector('#practice').scrollIntoView()
  } catch (error) {
    state.hintLevel = Math.min(state.hintLevel + 1, hints.length)
    state.aiReply = ''
    saveState(); render(); document.querySelector('#practice').scrollIntoView()
    showToast(`AI 暂不可用，已退回内置提示：${friendlyApiError(error)}`)
  }
}

async function testConnection(form) {
  const result = document.querySelector('#connectionResult')
  const button = document.querySelector('#testConnection')
  const rawKey = form.elements.apiKey.value.trim()
  const existingKey = sessionStorage.getItem(API_KEY_SESSION)
  const apiKey = rawKey === '••••••••' ? existingKey : rawKey
  if (!apiKey) return result.textContent = '请输入 API Key。'
  state.apiBaseUrl = form.elements.apiBaseUrl.value.trim().replace(/\/+$/, '')
  state.model = form.elements.model.value.trim()
  sessionStorage.setItem(API_KEY_SESSION, apiKey)
  button.disabled = true
  button.textContent = '正在测试…'
  result.textContent = '正在从浏览器连接模型服务…'
  try {
    const reply = await callModel([
      { role: 'system', content: '你是连接测试助手。' },
      { role: 'user', content: '只回复：连接成功' },
    ], 20)
    saveState()
    result.textContent = `连接成功：${reply}`
    button.textContent = '已连接'
    window.setTimeout(() => { document.querySelector('#aiDialog').close(); render(); showToast('AI 导师已连接。') }, 700)
  } catch (error) {
    sessionStorage.removeItem(API_KEY_SESSION)
    result.textContent = friendlyApiError(error)
    button.disabled = false
    button.textContent = '重新测试'
  }
}

async function callModel(messages, maxTokens = 180) {
  const apiKey = sessionStorage.getItem(API_KEY_SESSION)
  if (!apiKey) throw new Error('MISSING_KEY')
  const response = await fetch(`${state.apiBaseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: state.model, messages, temperature: 0.4, max_tokens: maxTokens }),
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`HTTP ${response.status}: ${detail.slice(0, 160)}`)
  }
  const data = await response.json()
  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) throw new Error('模型没有返回文本。')
  return content
}

function friendlyApiError(error) {
  if (error instanceof TypeError) return '浏览器无法访问该地址，可能是网络或 CORS 限制。可换用允许浏览器请求的服务或本地代理。'
  if (error.message === 'MISSING_KEY') return '当前标签页没有 API Key。'
  return `连接失败：${error.message}`
}

function toggleTask(id) {
  state.completed = state.completed.includes(id) ? state.completed.filter((item) => item !== id) : [...state.completed, id]
  saveState(); render(); showToast(state.completed.includes(id) ? '完成已记录，继续保持。' : '任务已恢复为未完成。')
}

function showToast(message) {
  const toast = document.querySelector('.toast')
  toast.textContent = message; toast.classList.add('show')
  window.setTimeout(() => toast.classList.remove('show'), 2600)
}

render()
