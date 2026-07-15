# Next Byte Hacks V3 — Sprint Plan

**Hackathon**: Next Byte Hacks V3
**Deadline**: July 15, 2026 @ 5:00pm EDT (43 hours from now)
**Prize**: $50 cash + CodeCrafters 2-year VIP + other swag
**Theme**: Open-ended, beginner-friendly, anything goes
**Fit**: ✅ PriorAuthFlow is a perfect submission — working, polished, serverless

**MVP status**: ✅ Built. Shared pipeline (`src/pipeline`) ported from the live agent hack, unit
tests pass, client bundle + Supabase Edge Function (`run-pipeline`) + `pa_requests` schema in
place, GitHub Pages deploy workflow wired. Demo runs client-side by default and upgrades to the
serverless edge function when Supabase secrets are set.

---

## What judges want
- **Impact**: Does it solve a real problem?
- **UI/UX**: Is it polished and intuitive?
- Working prototype + clear demo
- Public GitHub repo
- 1–3 min demo video
- 2–3 screenshots

---

## 43-Hour Execution Plan

### Hour 0–2 (Now): Registration + Setup
- [ ] Register at https://next-byte-hacks-v3.devpost.com/register
- [ ] Create submission draft on Devpost
- [ ] Verify GitHub repo is public: https://github.com/Skywalkingzulu1/next-byte-hacks-v3
- [ ] Verify GitHub Pages is live: https://skywalkingzulu1.github.io/next-byte-hacks-v3/

### Hour 2–6: Polish the Project
**Must fix before submission:**
- [ ] Ensure `public/index.html` demo works smoothly
- [ ] Add loading states to demo.js
- [ ] Fix any console errors
- [ ] Add trace visualization to demo (timeline view)
- [ ] Verify mobile responsiveness

**Nice to have:**
- [ ] Add architecture diagram to README
- [ ] Add screenshots folder to repo
- [ ] Polish copy in public/index.html

### Hour 6–10: Create Submission Assets
**Screenshots (3–5 images):**
1. Homepage / hero section
2. Live demo form
3. Happy path result (submitted)
4. Escalation path result (needs_review)
5. Agent traces / pipeline view

**Demo video script (1–3 min):**
1. **Problem** (20s): "Physicians spend 13 hours/week on prior authorization. 68% of denials are from missing clinical data."
2. **Trigger** (15s): "Hire PriorAuthFlow on CROO for 0.01 USDC, paste a patient chart + CPT code."
3. **Demo** (60s): Show the live demo — pick patient, run pipeline, show escalation on missing lab, show submit on complete chart
4. **Close** (25s): "<60 seconds from chart to submit-ready PA packet. Human review only when needed. Callable, paid, auditable."

**Recording:**
- Use Windows built-in recorder (Win+G) or OBS
- Record at 1080p
- Add captions for accessibility
- Keep it under 3 minutes

### Hour 10–14: Write Devpost Submission
**Required sections:**
1. **Project Name**: PriorAuthFlow
2. **Description**: Problem, solution, key features, tech stack
3. **Impact Statement**: Health-tech, reduces physician burnout, cuts PA denial rates
4. **Team Info**: skywalkingzulu1 (solo)
5. **Tools**: @croo-network/sdk, CROO Agent Protocol, TypeScript, Express, Supabase, GitHub Pages
6. **Challenges**: Typed handoff discipline, escalation safety loop
7. **What's Next**: Real EHR integration, real payer APIs

### Hour 14–18: Final Testing + Submit
- [ ] Test live demo one more time
- [ ] Verify all links work
- [ ] Push final commit to GitHub
- [ ] Upload screenshots to Devpost
- [ ] Upload demo video to YouTube/Drive + link on Devpost
- [ ] Submit on Devpost BEFORE 5:00pm EDT July 15

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Can't finish in time | Focus on minimum viable submission: 1 screenshot, 1 min video, working demo |
| GitHub Pages down | Use `npm run pages` local serve + screen recording |
| Demo video too long | Trim to 2:30 max |
| Devpost account issue | Register now, not at last minute |

---

## Immediate Next Step

**Commit + push to GitHub**, enable Pages, then record the 1–3 min demo video and finish submission
assets (screenshots, Devpost copy). Optional: wire Supabase secrets + run the Supabase deploy
workflow for the live serverless path.
