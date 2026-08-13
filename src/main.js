import './style.css'

const STORAGE_KEY = 'phenolens-short-stature-demo-v1'

const knownFacts = [
  { label: '主要表型', value: '身材矮小', detail: '医院记录的核心就诊表型' },
  { label: '既往检测', value: 'WES', detail: '已完成全外显子组测序' },
  { label: '当前结果', value: '未解病例', detail: '未发现已知致病位点' },
]

const assumptions = [
  '女性，11 岁，身高 126.2 cm（约 −3.1 SDS）',
  '父母身高在正常范围，家系中无相似矮小成员',
  '足月出生，无明显小于胎龄及围产期异常',
  '智力与运动发育无明显异常，无显著骨骼畸形',
  '生长激素激发试验峰值处于参考范围，甲状腺功能正常',
  'WES 为先证者单样本检测，平均深度与覆盖度尚待回收核验',
]

const readinessChecks = [
  { id: 'phenotype', title: '表型结构化', status: 'warning', score: 42, detail: '目前仅有“矮小”主诉，缺少生长曲线、身体比例、骨龄及系统性阴性表型。', action: '补录 HPO 与纵向生长数据' },
  { id: 'pedigree', title: '家系与遗传模式', status: 'warning', score: 55, detail: '演示假设提示散发病例，但父母表型与亲缘关系尚未由原始病历确认。', action: '确认三代家系与父母身高' },
  { id: 'wes', title: 'WES 可复核性', status: 'blocked', score: 28, detail: '缺少 BAM/CRAM、VCF、捕获试剂、覆盖度和既往过滤规则，无法判断“阴性”的边界。', action: '回收原始文件与检测报告' },
  { id: 'sample', title: '样本与身份链', status: 'warning', score: 60, detail: '尚未确认可否取得父母样本，也未记录样本类型、采样时间及身份核验方式。', action: '确认样本可得性与知情同意' },
  { id: 'governance', title: '数据治理', status: 'blocked', score: 20, detail: '真实数据导入前需确认脱敏、伦理审批、用途范围、访问权限和院内计算边界。', action: '完成伦理与数据权限核验' },
  { id: 'endpoint', title: '研究终点', status: 'ready', score: 80, detail: '近期目标可定义为缩小候选机制并确定最有信息增益的下一项检测，而非自动诊断。', action: '由临床团队确认终点' },
]

const evidence = [
  { type: '临床', title: '显著身材矮小', value: '约 −3.1 SDS', status: 'support', source: '演示假设', note: '需用真实年龄、性别及参考曲线重算。' },
  { type: '家系', title: '散发模式', value: '家系无类似情况', status: 'neutral', source: '演示假设', note: '兼容新生变异、隐性遗传、嵌合或非遗传因素。' },
  { type: '基因组', title: '常规 WES 阴性', value: '无已知致病位点', status: 'conflict', source: '用户提供', note: '只排除既往流程能检出的区域、变异类型和知识范围。' },
  { type: '内分泌', title: '常见内分泌异常未提示', value: 'GH / 甲功参考范围', status: 'neutral', source: '演示假设', note: '需核对检测条件、参考区间与动态随访。' },
  { type: '多组学', title: '功能证据缺失', value: 'RNA / 表观组未检测', status: 'missing', source: '当前缺口', note: '尚不能评估剪接、表达异常及调控效应。' },
]

const hypotheses = [
  { id: 'reanalyze', rank: '01', title: 'WES 再分析可发现遗漏信号', level: '优先验证', confidence: 74, rationale: '知识库更新、表型驱动重排序、覆盖盲区和旧过滤规则都可能造成假阴性。', tests: ['回收 BAM/CRAM 与 VCF', '更新注释并基于 HPO 重排序', '审查低覆盖外显子与 CNV/SV 信号'], falsifier: '高质量再分析且关键区域覆盖充分，仍无可信候选。' },
  { id: 'denovo', rank: '02', title: '新生或隐性遗传变异', level: '条件性高价值', confidence: 63, rationale: '散发病例与父母表型正常时，trio 能显著提高新生、复合杂合和遗传一致性判断能力。', tests: ['补采父母样本', '进行 trio 联合分析', '对候选进行 Sanger 与亲缘核验'], falsifier: 'trio 分析未发现符合遗传模式且与表型相关的候选。' },
  { id: 'structural', rank: '03', title: 'WES 难以识别的变异类型', level: '并行考虑', confidence: 58, rationale: '结构变异、深内含子、重复序列、低水平嵌合及调控区变异可能不在常规 WES 能力范围内。', tests: ['先审查 WES-CNV 与杂合度', '评估 WGS 或长读长适应性', '结合表型确定重点区域'], falsifier: '正交检测和全基因组分析均未提供支持。' },
  { id: 'functional', rank: '04', title: '候选变异需要功能组学显影', level: '候选后置', confidence: 41, rationale: 'RNA 可帮助识别异常剪接或表达，但组织可及性和基因表达范围决定其价值。', tests: ['先判断候选基因在可取组织中是否表达', '设计 RNA-seq 或靶向 RNA 验证', '必要时考虑细胞模型'], falsifier: '目标基因在可及组织不表达，或功能检测结果与假设不一致。' },
]

const nextTests = [
  { id: 'records', name: '回收病历与 WES 原始资料', info: '最高', cost: '低', time: '1–2 周', impact: 94, reason: '决定现有“阴性”结果是否可信，也是后续任何模型分析的前提。' },
  { id: 'trio', name: '父母样本 + Trio 再分析', info: '高', cost: '中', time: '2–4 周', impact: 86, reason: '直接检验新生、复合杂合及遗传一致性，可快速缩小候选范围。' },
  { id: 'phenotype', name: '标准化深表型与生长曲线', info: '高', cost: '低', time: '1 周', impact: 82, reason: '改善疾病匹配和变异排序，并识别被忽略的综合征线索。' },
  { id: 'genome', name: 'WGS / 结构变异分析', info: '中高', cost: '高', time: '4–8 周', impact: 69, reason: '覆盖 WES 难以识别的非编码和结构变异，但应在原始 WES 复核后决策。' },
  { id: 'rna', name: 'RNA 功能验证', info: '条件性', cost: '中', time: '3–6 周', impact: 52, reason: '只有出现可检验的剪接或表达候选，且可及组织表达时信息增益才高。' },
]

const routes = [
  { id: 'fast', label: 'A', name: '快速复核', duration: '2–3 周', goal: '先判断 WES 阴性是否可靠', steps: ['补齐深表型与三代家系', '回收 WES 原始数据与质控', '更新注释和表型驱动重排序', '审查 CNV、低覆盖与既往过滤'], stop: '原始数据不可获得或质量不足时，不继续做模型评分，转入补测决策。' },
  { id: 'standard', label: 'B', name: '标准研究', duration: '4–8 周', goal: '形成可复核的候选机制清单', steps: ['完成快速复核全部步骤', '补采父母并开展 trio 分析', '多模型候选排序但保留规则基线', '临床遗传专家盲审候选', '正交验证高优先级候选'], stop: '无符合遗传模式、表型和质量要求的候选时，转入 WGS 可行性评估。' },
  { id: 'explore', label: 'C', name: '多组学探索', duration: '8–16 周', goal: '发现 WES 能力边界外的机制', steps: ['以标准研究结果为前置', 'WGS / SV / 非编码变异分析', '用基因组基础模型提供辅助证据', '按候选选择 RNA 或细胞功能验证', '独立专家复核与病例再联系'], stop: '没有具体、可证伪候选时，不盲目开展昂贵多组学检测。' },
]

const defaults = { activeView: 'overview', selectedRoute: 'standard', completedChecks: [], selectedTest: 'records', reviewed: false }
let state = loadState()

function loadState() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) } } catch { return { ...defaults } }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }
function statusLabel(status) { return { ready: '可用', warning: '待补充', blocked: '前置阻塞' }[status] }

function render() {
  const checkScore = Math.round(readinessChecks.reduce((sum, item) => sum + item.score, 0) / readinessChecks.length)
  const route = routes.find((item) => item.id === state.selectedRoute)
  const selectedTest = nextTests.find((item) => item.id === state.selectedTest)
  document.querySelector('#app').innerHTML = `
    <aside class="sidebar">
      <a class="brand" href="#"><span class="brand-mark">P+</span><span><strong>PhenoLens</strong><small>CLINICAL RESEARCH STUDIO</small></span></a>
      <nav>${[['overview','01','病例总览'],['readiness','02','数据体检'],['evidence','03','证据与假设'],['plan','04','研究路径'],['mdt','05','MDT 草案']].map(([id,num,label]) => `<button class="nav-link ${state.activeView === id ? 'active' : ''}" data-view="${id}"><span>${num}</span>${label}</button>`).join('')}</nav>
      <div class="privacy-card"><i></i><strong>演示模式</strong><p>未加载真实患者数据。补充字段均为演示假设，不可作为临床事实。</p></div>
    </aside>
    <main>
      <header class="topbar"><div><span class="eyebrow">CASE / SS-WES-001 · RESEARCH USE ONLY</span><h1>未诊断矮小症病例</h1></div><div class="header-actions"><span class="case-state"><i></i>证据整理中</span><button class="button ghost" id="exportReport">导出 MDT 草案</button></div></header>
      <div class="demo-banner"><strong>信息边界</strong><span><b>已知：</b>矮小表型、已完成 WES、未发现已知致病位点。</span><span><b>其余：</b>演示假设，必须由真实病历替换。</span></div>

      <section class="workspace ${state.activeView === 'overview' ? 'active' : ''}" data-panel="overview">
        <div class="case-hero"><div class="hero-copy"><span class="section-code">CASE INTAKE / 001</span><h2>不是再找一个分数，<br>而是找出<strong>下一条可验证证据。</strong></h2><p>将 WES 阴性从终点改写为研究起点：先界定既往检测能力，再以深表型、家系和正交数据逐层缩小机制空间。</p><div class="hero-actions"><button class="button primary" data-go="readiness">开始病例体检 →</button><button class="text-button" id="openBoundary">查看使用边界</button></div></div><div class="readiness-orbit" style="--score:${checkScore * 3.6}deg"><div><strong>${checkScore}</strong><span>研究就绪度</span></div></div></div>
        <div class="fact-grid">${knownFacts.map((item) => `<article><span>${item.label}</span><strong>${item.value}</strong><p>${item.detail}</p><small>已知信息</small></article>`).join('')}</div>
        <div class="overview-grid"><section class="card"><div class="card-heading"><div><span class="eyebrow">SYNTHETIC CONTEXT</span><h3>演示假设</h3></div><span class="tag">待真实病历确认</span></div><ul class="assumption-list">${assumptions.map((item) => `<li><i>?</i><span>${item}</span></li>`).join('')}</ul></section><section class="card decision-card"><span class="eyebrow">CURRENT DECISION</span><h3>当前不应直接追加昂贵组学检测</h3><p>最优先动作是回收 WES 原始资料、完善深表型并确认父母样本。否则模型输出无法区分真实信号与既往流程盲区。</p><div class="decision-footer"><span>建议状态</span><strong>需要补充基础证据</strong></div></section></div>
      </section>

      <section class="workspace ${state.activeView === 'readiness' ? 'active' : ''}" data-panel="readiness">
        <div class="page-intro"><div><span class="section-code">COHORT & CASE READINESS</span><h2>病例可研究性体检</h2><p>在接触真实数据前，先识别会让后续模型分析失真的缺口。</p></div><div class="score-box"><strong>${checkScore}<small>/100</small></strong><span>暂不适合直接建模</span></div></div>
        <div class="check-list">${readinessChecks.map((item,index) => `<article class="check-item ${item.status} ${state.completedChecks.includes(item.id) ? 'confirmed' : ''}"><div class="check-index">${String(index + 1).padStart(2,'0')}</div><div class="check-main"><div class="check-title"><h3>${item.title}</h3><span class="status ${item.status}">${state.completedChecks.includes(item.id) ? '已标记处理' : statusLabel(item.status)}</span></div><p>${item.detail}</p><div class="score-track"><i style="width:${item.score}%"></i></div></div><div class="check-action"><small>下一动作</small><strong>${item.action}</strong><button data-check="${item.id}">${state.completedChecks.includes(item.id) ? '撤销标记' : '标记已处理'}</button></div></article>`).join('')}</div>
        <div class="guardrail"><span>!</span><div><strong>临床与数据护栏</strong><p>未完成伦理、脱敏和用途授权前，不上传任何可识别信息或真实基因组文件；演示中不调用外部模型。</p></div></div>
      </section>

      <section class="workspace ${state.activeView === 'evidence' ? 'active' : ''}" data-panel="evidence">
        <div class="page-intro"><div><span class="section-code">PATIENT EVIDENCE BOARD</span><h2>证据不是结论，而是链条</h2><p>每条陈述都区分来源、支持方向与缺失部分。</p></div><div class="legend"><span><i class="support"></i>支持</span><span><i class="conflict"></i>边界</span><span><i class="missing"></i>缺失</span></div></div>
        <div class="evidence-strip">${evidence.map((item) => `<article class="evidence-card ${item.status}"><div><span>${item.type}</span><small>${item.source}</small></div><h3>${item.title}</h3><strong>${item.value}</strong><p>${item.note}</p></article>`).join('')}</div>
        <div class="section-heading"><div><span class="eyebrow">TESTABLE HYPOTHESES</span><h2>待验证机制方向</h2></div><span>可检验性 × 信息增益 × 当前证据</span></div>
        <div class="hypothesis-list">${hypotheses.map((item) => `<details class="hypothesis" ${item.id === 'reanalyze' ? 'open' : ''}><summary><span>${item.rank}</span><div><small>${item.level}</small><h3>${item.title}</h3></div><div class="confidence"><i style="width:${item.confidence}%"></i></div><strong>${item.confidence}%</strong><b>+</b></summary><div class="hypothesis-body"><div><small>为什么值得检查</small><p>${item.rationale}</p></div><div><small>验证动作</small><ol>${item.tests.map((test) => `<li>${test}</li>`).join('')}</ol></div><div><small>停止 / 反证条件</small><p>${item.falsifier}</p></div></div></details>`).join('')}</div>
      </section>

      <section class="workspace ${state.activeView === 'plan' ? 'active' : ''}" data-panel="plan">
        <div class="page-intro"><div><span class="section-code">RESEARCH ROUTES</span><h2>三条路线，先选证据强度</h2><p>模型只是路线中的证据工具；未经确认的模型分数不直接进入临床结论。</p></div></div>
        <div class="route-tabs">${routes.map((item) => `<button class="route-tab ${state.selectedRoute === item.id ? 'active' : ''}" data-route="${item.id}"><span>${item.label}</span><div><strong>${item.name}</strong><small>${item.duration}</small></div></button>`).join('')}</div>
        <article class="route-detail"><div class="route-summary"><span class="route-letter">${route.label}</span><div><small>ROUTE ${route.label} / ${route.duration}</small><h3>${route.name}</h3><p>${route.goal}</p></div><span class="recommendation">${route.id === 'standard' ? '本病例建议' : '可选路线'}</span></div><div class="route-steps">${route.steps.map((step,index) => `<div><span>${String(index + 1).padStart(2,'0')}</span><p>${step}</p></div>`).join('')}</div><div class="stop-rule"><strong>停止 / 转向标准</strong><p>${route.stop}</p></div></article>
        <div class="section-heading"><div><span class="eyebrow">NEXT BEST TEST</span><h2>下一步信息增益</h2></div><span>点击项目查看决策理由</span></div>
        <div class="test-layout"><div class="test-list">${nextTests.map((test,index) => `<button class="test-row ${state.selectedTest === test.id ? 'active' : ''}" data-test="${test.id}"><span>${String(index + 1).padStart(2,'0')}</span><strong>${test.name}</strong><small>信息增益 ${test.info}</small><small>成本 ${test.cost}</small><i style="--impact:${test.impact}%"></i></button>`).join('')}</div><aside class="test-reason"><span class="eyebrow">WHY THIS NEXT?</span><h3>${selectedTest.name}</h3><strong>决策价值 ${selectedTest.impact}/100</strong><p>${selectedTest.reason}</p><div><span>预计周期</span><b>${selectedTest.time}</b></div></aside></div>
      </section>

      <section class="workspace ${state.activeView === 'mdt' ? 'active' : ''}" data-panel="mdt">
        <div class="page-intro"><div><span class="section-code">VIRTUAL MOLECULAR BOARD</span><h2>MDT 会前草案</h2><p>以下内容用于组织讨论，不构成诊断、治疗建议或正式检测报告。</p></div><button class="button primary" id="reviewCase">${state.reviewed ? '✓ 已记录人工复核' : '记录人工复核'}</button></div>
        <div class="mdt-grid"><article class="mdt-card wide"><span class="role">01 / 病例主持人</span><h3>核心问题</h3><blockquote>在常规 WES 未发现已知致病位点的矮小症患者中，现有证据能否支持进一步遗传学研究？哪一步最能降低不确定性？</blockquote><div class="callout"><strong>讨论目标</strong><p>建立可验证候选与下一步检测顺序，不追求在本轮会议中给出诊断。</p></div></article>
        ${[['02 / 临床遗传','表型信息不足','需补齐真实身高 SDS、生长速度、父母靶身高、骨龄、身体比例、出生史及系统性 HPO 阴性表型。','需补临床证据'],['03 / 生物信息','“WES 阴性”尚不可审计','在获得原始数据、覆盖报告和旧过滤规则前，不能判断是无候选还是流程遗漏。','关键阻塞项'],['04 / 多组学','暂缓无目标的 RNA 检测','优先形成候选机制，再判断目标基因是否在可及组织表达，避免低信息增益的泛化检测。','条件性建议'],['05 / 反方审计','遗传病因不是唯一解释','需保留营养、慢性系统疾病、青春期时相和测量误差等非遗传解释，避免因已有 WES 而锚定遗传病。','防止锚定偏差']].map((item) => `<article class="mdt-card"><span class="role">${item[0]}</span><h3>${item[1]}</h3><p>${item[2]}</p><span class="verdict">${item[3]}</span></article>`).join('')}
        <article class="mdt-card action-card"><span class="role">BOARD DECISION / DRAFT</span><h3>建议：补充证据后继续</h3><ol><li>回收真实病历、纵向生长数据与 WES 原始资料</li><li>完成 HPO 深表型、覆盖质控和更新版再分析</li><li>确认父母样本和知情同意，评估 trio</li><li>仅对可证伪候选安排 WGS 或 RNA 验证</li></ol><button class="button light" data-go="readiness">返回阻塞项</button></article></div>
      </section>
      <footer><span>PhenoLens · Multi-omics Clinical Research Studio</span><span>演示病例 · 非医疗器械 · 仅供研究流程设计</span></footer>
    </main>
    <dialog id="boundaryDialog"><form method="dialog"><button class="dialog-close" value="cancel">×</button><span class="eyebrow">RESEARCH BOUNDARY</span><h2>这套原型能做什么？</h2><ul><li><strong>能：</strong>整理证据缺口、生成可证伪假设、比较研究路线、准备 MDT 会前材料。</li><li><strong>不能：</strong>从当前三条信息推断病因、推荐治疗或声称发现致病变异。</li><li><strong>真实使用前：</strong>必须完成伦理、脱敏、院内访问控制，并由临床遗传专家复核。</li><li><strong>演示假设：</strong>所有带该标签的信息都必须被真实病例字段替换或删除。</li></ul><button class="button primary full" value="default">我已了解</button></form></dialog><div class="toast" role="status"></div>`
  bindEvents()
}

function bindEvents() {
  document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => switchView(button.dataset.view)))
  document.querySelectorAll('[data-go]').forEach((button) => button.addEventListener('click', () => switchView(button.dataset.go)))
  document.querySelectorAll('[data-check]').forEach((button) => button.addEventListener('click', () => { const id = button.dataset.check; state.completedChecks = state.completedChecks.includes(id) ? state.completedChecks.filter((item) => item !== id) : [...state.completedChecks,id]; saveState(); render(); showToast('处理标记已更新；原始风险评分保持不变。') }))
  document.querySelectorAll('[data-route]').forEach((button) => button.addEventListener('click', () => { state.selectedRoute = button.dataset.route; saveState(); render() }))
  document.querySelectorAll('[data-test]').forEach((button) => button.addEventListener('click', () => { state.selectedTest = button.dataset.test; saveState(); render() }))
  document.querySelector('#openBoundary')?.addEventListener('click', () => document.querySelector('#boundaryDialog').showModal())
  document.querySelector('#reviewCase')?.addEventListener('click', () => { state.reviewed = !state.reviewed; saveState(); render(); showToast('人工复核状态已更新。') })
  document.querySelector('#exportReport').addEventListener('click', exportReport)
}

function switchView(view) { state.activeView = view; saveState(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }) }
function exportReport() {
  const route = routes.find((item) => item.id === state.selectedRoute)
  const content = `# SS-WES-001 MDT 会前草案\n\n> 演示病例；仅供研究流程设计，不构成诊断或治疗建议。\n\n## 已知信息\n- 主要表型：身材矮小\n- 既往检测：WES\n- 当前结果：未发现已知致病位点\n\n## 信息边界\n年龄、性别、家系、出生史、内分泌结果及 WES 质控均为演示假设，必须由真实病历替换。\n\n## 当前判断\n现有证据不足以直接开展模型推断。优先回收 WES 原始资料、补齐深表型并确认父母样本。\n\n## 建议路线：${route.label} · ${route.name}\n${route.steps.map((step,index) => `${index + 1}. ${step}`).join('\n')}\n\n停止/转向标准：${route.stop}\n\n## MDT 草案结论\n需要补充基础证据后继续。先界定常规 WES 的能力边界，再决定 trio、WGS 或候选驱动的 RNA 功能验证。\n`
  const url = URL.createObjectURL(new Blob([content], { type: 'text/markdown;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = 'SS-WES-001-MDT-draft.md'; link.click(); URL.revokeObjectURL(url); showToast('MDT 草案已导出。')
}
function showToast(message) { const toast = document.querySelector('.toast'); toast.textContent = message; toast.classList.add('show'); window.setTimeout(() => toast.classList.remove('show'), 2800) }

render()import './style.css'

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
