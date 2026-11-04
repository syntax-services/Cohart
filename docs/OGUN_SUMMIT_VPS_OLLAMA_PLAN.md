# Ogun Tech Summit Edition (Vs) • Self-Hosted VPS & Ollama AI Architecture Plan

## 1. Executive Summary & Context
For the **Ogun State Tech/Innovate Summit Hackathon**, we are transitioning the architecture to an independent, self-hosted deployment running directly on a VPS. This eliminates third-party cloud tier limits, prevents sudden API rate-limiting during hackathon demos, and ensures that student features (timetables, course catalog, campus navigation, notes) remain **100% free with unlimited usage**.

---

## 2. Model Selection Decision Matrix: Choosing the Best Lightweight LLM

Running an LLM on a cost-effective CPU VPS requires balancing **RAM consumption**, **inference speed (tokens/sec)**, and **academic reasoning quality**.

| Model | Size / Quantization | RAM Footprint | Inference Speed (4-8 vCPU) | Academic / Nigerian Context | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Qwen 2.5 3B** (`qwen2.5:3b`) | 3.09B (Q4_K_M) | **~2.2 GB** | **35 - 50 tok/s** | **Exceptional** (Top benchmark in math, reasoning, code, and structured instruction following). | **#1 Recommended Choice (Primary Engine)** |
| **Llama 3.2 3B** (`llama3.2:3b`) | 3.21B (Q4_K_M) | **~2.0 GB** | **38 - 52 tok/s** | **Very Good** (Fluent natural English, 128k context, low latency). | **Strong Alternative** |
| **DeepSeek-R1-Distill-Qwen-1.5B** (`deepseek-r1:1.5b`) | 1.78B (Q4_K_M) | **~1.3 GB** | **55 - 75 tok/s** | **Great Step-by-Step Reasoning** (Includes chain-of-thought `<think>` blocks for complex calculations). | **Best for Math / Science Solvers** |
| **Qwen 2.5 7B** (`qwen2.5:7b`) | 7.61B (Q4_K_M) | **~4.8 GB** | **12 - 20 tok/s** | **Near GPT-4o-mini Quality** (Remarkable depth, requires at least 8GB-16GB RAM VPS). | **Best if VPS has 8+ vCPUs or GPU** |
| **Phi-3.5 Mini 3.8B** (`phi3.5:latest`) | 3.82B (Q4_K_M) | **~2.5 GB** | **28 - 40 tok/s** | **Good** (Strong reasoning, slightly slower prompt ingestion). | **Fallback** |

### **The Winner: Qwen 2.5 3B (`qwen2.5:3b`)**
- **Why?** Qwen 2.5 3B punches well above its weight class. It outperforms older 7B models on MMLU, GSM8K, and HumanEval.
- **Speed & Footprint:** At only ~2.2 GB of RAM, it leaves 75% of an 8GB VPS free for PostgreSQL, Node.js, and background tasks.
- **Instruction Adherence:** It follows system prompts strictly, respects our "zero emojis" and "simple layman English" rules, and handles Nigerian academic terminology smoothly.

---

## 3. The Hybrid "Smart Summarizer" Architecture

Instead of relying solely on either a local VPS model or expensive cloud APIs, we deploy a **Hybrid Synergy**:

```
+-----------------------------------------------------------------------------------+
|                                 STUDENT DEVICE                                    |
|                       (Mobile Web / PWA / Desktop App)                            |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                               NEXT.JS API BACKEND                                 |
|                             (`src/app/api/ai/route.ts`)                           |
+--------------------+---------------------------------------+---------------------+
                     |                                       |
    [Standard Chats, Course Queries,        [Heavy PDFs, Multimodal OCR,
      Timetable Help, Room Navigation]        Complex Batch CGPA, Web Summaries]
                     |                                       |
                     v                                       v
+----------------------------------------+ +----------------------------------------+
|            SELF-HOSTED VPS             | |            GEMINI API ENGINE           |
|            (Ollama Daemon)             | |       (Gemini 2.5 / 3.5 Flash)         |
|  - Qwen 2.5 3B (qwen2.5:3b)            | |  - High-speed summarization            |
|  - Zero API cost, unlimited tokens     | |  - Document image extraction           |
|  - Zero rate-limit drops               | |  - Live web content distillation       |
+----------------------------------------+ +----------------------------------------+
```

1. **Local Ollama on VPS (Primary Engine):**
   - Handles 90% of requests: course syllabi, timetable inquiries, campus gate directions, flashcards, and concept explanations.
   - Cost: **\$0 per token**.
   - Privacy: Student data never leaves your server.
2. **Gemini API (Smart Summarizer & Vision Fallback):**
   - Invoked when students upload heavy scanned syllabus PDFs, lecture slide images, or when web search summarization is requested.
   - Automatic failover if VPS CPU is under heavy peak load.

---

## 4. Recommended VPS Sizing & Specs

To host Ollama, Next.js, and PostgreSQL comfortably:

| Component | Minimum Spec | Recommended Spec |
| :--- | :--- | :--- |
| **vCPU** | 4 Cores | 8 Cores (AMD EPYC or Intel Xeon) |
| **RAM** | 8 GB | 16 GB |
| **Storage** | 50 GB NVMe SSD | 100 GB NVMe SSD |
| **Bandwidth** | 1 Gbps port | 1 Gbps unmetered |
| **Cost Range** | ~\$6 - \$10 / month | ~\$12 - \$18 / month |
| **Tested Providers** | Hetzner Cloud (CPX31 / CCX13), Contabo VPS S, OVH, DigitalOcean |

---

## 5. Migration from Supabase to Self-Hosted Server

To leave Supabase and avoid database row/bandwidth limits:

1. **Option A: Self-Hosted PostgreSQL with pgvector (Simplest)**
   - Install PostgreSQL 16 directly on the VPS (`sudo apt install postgresql-16`).
   - Run our migrations schema (`src/lib/types.ts` tables: `profiles`, `courses`, `timetables`, `locations`, `saved_explanations`).
   - Point `DATABASE_URL` directly to `postgres://user:pass@localhost:5432/cohart`.
2. **Option B: Coolify / Dokku (PaaS on your VPS)**
   - Provides a 1-click dashboard for PostgreSQL, Redis, Next.js, and Ollama with automated SSL certificates and database backups.

---

## 6. Step-by-Step VPS Installation Runbook

### Step 1: Install Ollama on your Linux VPS
SSH into your server:
```bash
# 1. Update packages
sudo apt update && sudo apt upgrade -y

# 2. Install Ollama via official installer
curl -fsSL https://ollama.com/install.sh | sh
```

### Step 2: Configure Ollama to Listen on All Interfaces / Internal Bridge
By default, Ollama binds to `127.0.0.1:11434`. If your Next.js app runs on the same VPS, `http://localhost:11434` works out of the box.

If Ollama is on a separate VPS or in Docker, configure systemd:
```bash
sudo systemctl edit ollama.service
```
Add the following lines:
```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_ORIGINS=*"
```
Save and restart Ollama:
```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

### Step 3: Pull the Recommended Lightweight Models
```bash
# Pull Qwen 2.5 3B (Primary Workhorse - 2.2GB)
ollama pull qwen2.5:3b

# Pull DeepSeek-R1 1.5B (Reasoning / Math - 1.3GB)
ollama pull deepseek-r1:1.5b

# Optional: Llama 3.2 3B (Alternative - 2.0GB)
ollama pull llama3.2:3b
```

### Step 4: Verify Ollama API via Curl
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5:3b",
  "prompt": "Explain opportunity cost in 2 short bullet points for a university student in Nigeria.",
  "stream": false
}'
```

### Step 5: Connect Cohart to Your VPS in `.env.local`
In your Cohart project root, set:
```ini
# Points to your VPS Ollama daemon
OLLAMA_BASE_URL=http://your-vps-ip:11434
OLLAMA_MODEL=qwen2.5:3b

# Keep Gemini key for smart summarization & multimodal vision
GEMINI_API_KEY=your_gemini_api_key
```

Once set, Cohart's AI engine (`src/app/api/ai/route.ts`) automatically routes student inquiries through your self-hosted Ollama model, and seamlessly falls back to Gemini for summaries and vision!
