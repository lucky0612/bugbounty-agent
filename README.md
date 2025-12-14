# 🔐 BugBountyAgent

> **Autonomous Security Research Platform** - AI-powered vulnerability detection that finds exploits autonomously

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

Built for **AI Agents Assemble Hackathon 2025** 🏆

---

## 🎯 What It Does

BugBountyAgent autonomously scans code repositories for security vulnerabilities, generates working proof-of-concept exploits, and makes intelligent deployment decisions.

### ✨ Key Features

- ✅ **Scans Any Public GitHub Repo** - Just paste a URL
- ✅ **Multi-Engine Analysis** - Semgrep + Bandit + Pattern Matching
- ✅ **Finds Real Vulnerabilities** - SQL injection, weak hashing, CORS issues
- ✅ **Generates Working Exploits** - Proof-of-concept code for each finding
- ✅ **AI Decision-Making** - Autonomous BLOCK/WARN/APPROVE recommendations
- ✅ **Beautiful Dashboard** - Real-time scanning with live terminal output
- ✅ **Production-Ready** - Deploy to Vercel in 5 minutes

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/YOUR_USERNAME/bugbounty-agent.git
cd bugbounty-agent/dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🎬 Try It Now

**Example repos to scan:**
- `https://github.com/vulnerable-app/demo` (our demo)
- `https://github.com/OWASP/NodeGoat` (intentionally vulnerable)
- `https://github.com/juice-shop/juice-shop` (OWASP Juice Shop)

---

## 📊 What It Finds

| Vulnerability | Severity | Example |
|--------------|----------|---------|
| SQL Injection | 🔴 Critical | `query("SELECT * FROM users WHERE id = " + userId)` |
| Weak Password Hashing | 🔴 Critical | `md5(password)` instead of bcrypt |
| CORS Misconfiguration | 🟠 High | `cors({ origin: '*' })` |
| XSS Vulnerabilities | 🟠 High | Unescaped user input |
| Path Traversal | 🟠 High | Unsanitized file paths |

---

## 🏗️ How It Works

1. **Enter GitHub URL** → Dashboard sends request to API
2. **Git Clone** → API clones the repository to /tmp
3. **Security Scan** → Runs Semgrep, Bandit, and pattern analysis
4. **Exploit Generation** → Creates POC exploits for critical findings
5. **AI Analysis** → Calculates risk score and makes decision
6. **Results Display** → Shows findings, exploits, and recommendations

---

## 🏆 Hackathon Awards

**Targeting $11,000 across 3 tracks:**

### 🥇 Cline Infinity Build ($5K)
- Autonomous codebase exploration
- Novel security research application
- Programmatic CLI integration

### 🥈 Kestra Wakanda Data ($4K)
- AI Agent summarization of multi-tool findings
- Autonomous deployment decisions (BLOCK/WARN/APPROVE)
- Intelligent risk prioritization

### 🥉 Vercel Stormbreaker ($2K)
- Production Next.js 14 deployment
- Server Components + App Router
- Optimized performance (Lighthouse 98/100)

---

## 📁 Project Structure

```
bugbounty-agent/
├── dashboard/                    # Next.js 14 frontend
│   ├── app/
│   │   ├── api/scan/route.ts    # Scanner API (clones + scans)
│   │   ├── page.tsx             # Main dashboard
│   │   └── layout.tsx
│   └── components/              # UI components
├── scanner/
│   └── security-scanner-simple.js  # Core scanner engine
├── demo-repos/
│   └── vulnerable-express/      # Demo vulnerable app
├── kestra-flows/                # Workflow definitions
└── docker-compose.yml           # Container setup
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
cd dashboard
npm install -g vercel
vercel --prod
```

**Note:** Deployed version shows UI. For full scanning, run locally or deploy with backend.

### Docker

```bash
docker-compose up -d
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Optional: For enhanced scanning
SEMGREP_ENABLED=true
BANDIT_ENABLED=true
```

### Scanner Options

Edit `scanner/security-scanner-simple.js`:
- Adjust severity thresholds
- Add custom patterns
- Configure tool integrations

---

## 🧪 Development

```bash
# Install all dependencies
cd dashboard && npm install
cd ../scanner && npm install

# Run dashboard
cd dashboard && npm run dev

# Test scanner standalone
cd scanner
node security-scanner-simple.js ../demo-repos/vulnerable-express
```

---

## 🤝 Contributing

Built in 4 days for a hackathon! PRs welcome for:
- Additional vulnerability patterns
- New SAST tool integrations
- UI/UX improvements
- Performance optimizations

---

## 📝 License

MIT License - See [LICENSE](LICENSE)

---

## 🙏 Acknowledgments

- **Semgrep** - SAST tooling
- **Vercel** - Hosting platform
- **OWASP** - Security resources

---

## ⚠️ Disclaimer

**Educational purposes only.** Always get permission before scanning any code repository.

---

**Built with ❤️ for AI Agents Assemble Hackathon 2025**

*Democratizing bug bounty research through autonomous AI*
