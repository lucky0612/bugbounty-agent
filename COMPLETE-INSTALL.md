# 🚀 Complete Installation Guide

## Quick Start (Minimal Setup)

The scanner **works out-of-the-box** with just Node.js!

```bash
git clone https://github.com/YOUR_USERNAME/bugbounty-agent.git
cd bugbounty-agent/dashboard
npm install
npm run dev
```

Open http://localhost:3000 🎉

---

## 🔧 Optional Tools (Enhanced Capabilities)

Install these to unlock additional features:

### 1. Semgrep (Advanced SAST)

**macOS:**
```bash
brew install semgrep
```

**Linux:**
```bash
pip install semgrep
```

**What it adds:** Advanced static analysis, more vulnerability types

---

### 2. Bandit (Python Security)

```bash
pip install bandit
```

**What it adds:** Python-specific security analysis

---

### 3. Cline CLI (Autonomous Exploration)

```bash
# Install Cline
npm install -g @cline/cli

# Or via package manager
brew install cline  # macOS
```

**What it adds:** Autonomous codebase exploration via MCP

**Configuration:** Already included in `scanner/cline-config.json`

---

### 4. Ollama + DeepSeek-R1 (AI Analysis)

```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Pull DeepSeek-R1 model
ollama pull deepseek-r1:1.5b

# Start Ollama server
ollama serve
```

**What it adds:** AI-powered vulnerability analysis and risk assessment

**Environment variables:**
```bash
export OLLAMA_HOST=http://localhost:11434
export OLLAMA_MODEL=deepseek-r1:1.5b
```

---

### 5. Kestra (Workflow Orchestration)

```bash
# Using Docker
docker-compose up -d kestra

# Or standalone
docker run -p 8080:8080 kestra/kestra:latest server standalone
```

**What it adds:** Workflow orchestration, scheduled scans, multi-step pipelines

**Environment variables:**
```bash
export KESTRA_HOST=http://localhost:8080
```

**Workflows:** Pre-configured in `kestra-flows/`

---

## 📊 Feature Matrix

| Feature | Minimal | + Semgrep | + Cline | + Ollama | + Kestra | Full Stack |
|---------|---------|-----------|---------|----------|----------|------------|
| Pattern Matching | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| SQL Injection Detection | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Weak Crypto Detection | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| CORS Issues | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Advanced SAST | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Python Analysis | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Autonomous Exploration | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| AI Risk Analysis | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Workflow Orchestration | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---


## 🔍 Verification

Test each tool is working:

### Check Pattern Matching (Always Works)
```bash
cd scanner
node security-scanner-simple.js ../demo-repos/vulnerable-express
# Should find: 2+ vulnerabilities
```

### Check Semgrep
```bash
semgrep --version
# Should output: 1.x.x
```

### Check Bandit
```bash
bandit --version
# Should output: 1.x.x
```

### Check Cline
```bash
cline --version
# Should output: x.x.x
```

### Check Ollama
```bash
curl http://localhost:11434/api/tags
# Should return: JSON with models
```

### Check Kestra
```bash
curl http://localhost:8080/api/v1/health
# Should return: {"status":"UP"}
```

---

## 🐛 Troubleshooting

### "Scanner finds 0 vulnerabilities"

**Check:**
1. Is the target repo valid?
2. Are there actually .js or .py files?
3. Try the demo repo: `../demo-repos/vulnerable-express`

### "Semgrep not found"

```bash
# Install Semgrep
brew install semgrep  # macOS
pip install semgrep   # Linux

# Verify
semgrep --version
```

### "Ollama connection refused"

```bash
# Start Ollama
ollama serve

# In another terminal, verify
curl http://localhost:11434/api/tags
```

### "Kestra workflow not triggered"

```bash
# Start Kestra
docker-compose up -d kestra

# Verify
curl http://localhost:8080/api/v1/health
```

---


## 📝 Environment Variables

Create `.env.local` in `dashboard/`:

```bash
# Optional: Ollama configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:1.5b

# Optional: Kestra configuration
KESTRA_HOST=http://localhost:8080

# Optional: Scanner configuration
SEMGREP_ENABLED=true
BANDIT_ENABLED=true
CLINE_ENABLED=true
```

---

## ✅ Success Indicators

Your setup is working when:

- [ ] Dashboard loads at localhost:3000
- [ ] Can click "Launch Scan"
- [ ] Terminal shows scanner output
- [ ] Finds vulnerabilities in demo repo
- [ ] Results appear in dashboard
- [ ] (Optional) See "Ollama detected" in logs
- [ ] (Optional) See "Semgrep: X issues" in logs
- [ ] (Optional) See "Kestra workflow triggered" in logs

---

**Need help?** [Open an issue](https://github.com/lucky0612/bugbounty-agent/issues)
