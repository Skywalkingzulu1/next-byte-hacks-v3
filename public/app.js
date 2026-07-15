// PriorAuthFlow — frontend demo controller.
// Pipeline logic lives in the shared, unit-tested module (public/pipeline.js,
// built from src/pipeline). This file only handles UI + routing to the
// serverless Supabase Edge Function when configured.

// Human-speed delay so the multi-agent flow is observable.
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getSupabase() {
  const cfg = window.PRIORAUTH_CONFIG || {}
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) return null
  if (!window._paSupabase) {
    const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm')
    window._paSupabase = mod.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
  }
  return window._paSupabase
}

// Compute the deliverable: serverless Edge Function when Supabase is configured,
// otherwise the bundled client-side pipeline (always works on GitHub Pages).
async function computeDeliverable(req) {
  const sb = await getSupabase()
  if (sb) {
    const { data, error } = await sb.functions.invoke('run-pipeline', { body: req })
    if (error) throw new Error(`Edge function error: ${error.message}`)
    return data
  }
  if (!window.PriorAuthFlow || typeof window.PriorAuthFlow.runPipeline !== 'function') {
    throw new Error('Pipeline bundle (pipeline.js) failed to load')
  }
  return window.PriorAuthFlow.runPipeline(req)
}

// ---- Pipeline visualization config --------------------------------------
const STAGES = [
  { agent: 'Intake', label: 'Intake', icon: '📋' },
  { agent: 'Chart-Retriever', label: 'Chart', icon: '🏥' },
  { agent: 'Criteria-Matcher', label: 'Criteria', icon: '✅' },
  { agent: 'Evidence-Builder', label: 'Evidence', icon: '📄' },
  { agent: 'Escalation', label: 'Safety', icon: '🛡️' },
  { agent: 'Submitter', label: 'Submit', icon: '🚀' },
]

const CPT_NAMES = {
  J3490: 'GLP-1 Receptor Agonist (non-specific)',
  J3299: 'Injection, not otherwise classified',
}

const CHECK_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ))
}

function stageIndexFor(agent) {
  return STAGES.findIndex((s) => s.agent === agent)
}

function buildViz() {
  const viz = document.getElementById('pipelineViz')
  viz.innerHTML = ''
  STAGES.forEach((s) => {
    const el = document.createElement('div')
    el.className = 'stage'
    el.innerHTML = `
      <div class="stage-connector"></div>
      <div class="stage-node">${s.icon}</div>
      <div class="stage-label">${s.label}</div>
      <div class="stage-status">queued</div>
    `
    viz.appendChild(el)
  })
  viz.classList.add('visible')
}

function setStageStatus(el, text) {
  if (el) el.querySelector('.stage-status').textContent = text
}

function setNodeIcon(el, icon) {
  if (el) el.querySelector('.stage-node').textContent = icon
}

async function runPipeline(req) {
  const tracesList = document.getElementById('tracesList')
  const resultContent = document.getElementById('resultContent')
  const statusBadge = document.getElementById('statusBadge')
  const modeTag = document.getElementById('modeTag')

  tracesList.innerHTML = ''
  resultContent.innerHTML = ''
  document.getElementById('tracesContainer').style.display = 'none'
  document.getElementById('resultPanel').classList.remove('visible')
  if (modeTag) {
    const sb = await getSupabase()
    modeTag.textContent = sb ? 'Serverless · Supabase' : 'Local demo'
  }

  buildViz()
  const viz = document.getElementById('pipelineViz')

  // Boot: show the pipeline warming up before the first agent fires.
  const boot = viz.children[0]
  if (boot) {
    boot.classList.add('active')
    setStageStatus(boot, 'booting')
  }

  const result = await computeDeliverable(req)

  // Human-speed warmup so the multi-agent flow is observable.
  await delay(1400)

  for (const t of result.traces || []) {
    const idx = stageIndexFor(t.agent)
    const stageEl = viz.children[idx]
    if (stageEl) {
      stageEl.classList.add('active')
      setStageStatus(stageEl, 'running')
    }

    const item = document.createElement('div')
    item.className = 'trace-item'
    item.innerHTML = `
      <div class="trace-agent">${esc(t.agent)}</div>
      <div class="trace-details">
        <div class="trace-action">${esc(t.action)}</div>
        <div class="trace-io">${esc(t.input_summary)} → ${esc(t.output_summary)}</div>
      </div>
    `
    tracesList.appendChild(item)
    document.getElementById('tracesContainer').style.display = 'block'

    if (stageEl) {
      await delay(400)
      stageEl.classList.remove('active')
      const isFlag = t.agent === 'Escalation' && /flag/.test(t.action)
      if (isFlag) {
        stageEl.classList.add('flag')
        setNodeIcon(stageEl, '⚠')
        setStageStatus(stageEl, 'flagged')
      } else {
        stageEl.classList.add('done')
        setNodeIcon(stageEl, '✓')
        setStageStatus(stageEl, 'done')
      }
      const conn = stageEl.querySelector('.stage-connector')
      if (conn) conn.classList.add('filled')
    } else {
      await delay(400)
    }
  }

  const escalation = result.escalation || null
  const resultStatus = escalation ? 'needs_review' : 'submitted'
  statusBadge.textContent = resultStatus
  statusBadge.className = 'status-badge ' + (escalation ? 'status-needs-review' : 'status-submitted')

  // On the escalation path the safety loop prevents submission.
  if (escalation) {
    const submitStage = viz.children[viz.children.length - 1]
    if (submitStage) {
      setStageStatus(submitStage, 'skipped')
      submitStage.classList.add('skipped')
    }
  }

  renderPacket(result)
  document.getElementById('resultPanel').classList.add('visible')

  return result
}

function renderPacket(result) {
  const packet = result.pa_packet || {}
  const escalation = result.escalation || null
  const decision = result.decision || null
  const checklist = Array.isArray(packet.criteria_checklist) ? packet.criteria_checklist : []
  const evidence = Array.isArray(packet.supporting_evidence) ? packet.supporting_evidence : []
  const status = escalation ? 'needs_review' : 'submitted'
  const cptName = CPT_NAMES[packet.cpt_code] || packet.cpt_code || '—'
  const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
  const resultContent = document.getElementById('resultContent')

  let html = '<div class="pa-packet">'

  html += `
    <div class="packet-head">
      <div>
        <div class="packet-eyebrow">Prior Authorization Request</div>
        <div class="packet-id">${esc(result.order_id || 'PA-UNKNOWN')}</div>
      </div>
      <div class="packet-status ${status}">${status === 'submitted' ? 'Submitted' : 'Needs Review'}</div>
    </div>`

  html += `
    <div class="packet-meta">
      <div class="pm"><span>Patient</span><strong>${esc(packet.patient_id || '—')}</strong></div>
      <div class="pm"><span>Payer</span><strong>${esc(packet.payer || '—')}</strong></div>
      <div class="pm"><span>Procedure</span><strong>${esc(packet.cpt_code || '—')} · ${esc(cptName)}</strong></div>
      <div class="pm"><span>Generated</span><strong>${esc(now)}</strong></div>
    </div>`

  if (checklist.length) {
    html += '<div class="packet-section"><h4>Payer Criteria Match</h4><ul class="checklist">'
    for (const c of checklist) {
      const cls = c.satisfied ? 'pass' : 'fail'
      const mark = c.satisfied ? '✓' : '✕'
      const catLabel = c.category === 'lab' ? 'Lab' : c.category === 'diagnosis' ? 'Diagnosis' : 'Prior Tx'
      html += `<li class="${cls}"><span class="ci">${mark}</span><span>${esc(c.label)}</span><span class="ccat">${catLabel} · ${c.satisfied ? 'met' : 'missing'}</span></li>`
    }
    html += '</ul></div>'
  }

  html += `<div class="packet-section"><h4>Clinical Summary</h4><div class="packet-summary">${esc(packet.clinical_summary || '')}</div></div>`

  if (evidence.length) {
    html += `<div class="packet-section"><h4>Supporting Evidence (${evidence.length})</h4><ul class="packet-evidence">`
    for (const e of evidence) {
      html += `<li><span class="ei">${CHECK_SVG}</span><span>${esc(e)}</span></li>`
    }
    html += '</ul></div>'
  }

  if (escalation) {
    html += `
      <div class="escalation-banner">
        <strong>⚠️ Escalation Required — Human Review</strong>
        <p>${esc(escalation.reason)}</p>
        <p style="margin-top:8px;"><strong>Missing:</strong> ${esc((escalation.missing_fields || []).join(', '))}</p>
        <p style="margin-top:4px;"><strong>Action:</strong> ${esc(escalation.recommended_action)}</p>
      </div>`
  }

  if (decision && !escalation) {
    const decLabel = decision.decision.charAt(0).toUpperCase() + decision.decision.slice(1)
    html += `
      <div class="submit-box">
        <div class="sb-icon">${CHECK_SVG}</div>
        <div>
          <div class="sb-title">ePA Submitted · ${esc(decLabel)}</div>
          <div class="sb-sub">${esc(decision.reason)}</div>
        </div>
        <div class="sb-ref">ref ${esc(result.order_id || '—')}<br>${esc(now)}</div>
      </div>`
  }

  html += '<div class="packet-foot">Generated by <strong>PriorAuthFlow</strong> · human-in-the-loop · audit-ready typed traces appended for every agent.</div>'
  html += '</div>'

  resultContent.innerHTML = html
}

async function runDemo() {
  const btn = document.getElementById('runBtn')
  const btnText = document.getElementById('btnText')
  const btnLoader = document.getElementById('btnLoader')

  btn.disabled = true
  btnText.textContent = 'Running pipeline'
  btnLoader.style.display = 'inline-flex'

  const req = {
    chart_text: document.getElementById('chartText').value,
    payer: document.getElementById('payer').value,
    cpt_code: document.getElementById('cptCode').value,
    patient_id: document.getElementById('patientId').value,
  }

  try {
    await delay(600)
    await runPipeline(req)
  } catch (err) {
    const resultContent = document.getElementById('resultContent')
    document.getElementById('resultPanel').classList.add('visible')
    resultContent.innerHTML = `<div class="escalation-banner"><strong>Error</strong><p>${esc(String(err && err.message ? err.message : err))}</p></div>`
  } finally {
    btn.disabled = false
    btnText.textContent = 'Run Pipeline'
    btnLoader.style.display = 'none'
  }
}

window.runDemo = runDemo

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute('href'))
      if (target) target.scrollIntoView({ behavior: 'smooth' })
    })
  })

  // Sample patient cards select the matching form values.
  const cards = document.querySelectorAll('#patientCards .patient-card')
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      cards.forEach((c) => c.classList.remove('selected'))
      card.classList.add('selected')
      document.getElementById('patientId').value = card.dataset.patient
      document.getElementById('payer').value = card.dataset.payer
      document.getElementById('chartText').value = card.dataset.chart
    })
  })
  // Pre-select the first (complete) sample patient.
  if (cards.length) cards[0].classList.add('selected')
})
