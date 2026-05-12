# NeuralVault — AI Agent Command Center on 0G Chain

> The onchain identity, memory, and coordination layer for autonomous AI agents.  
> Every agent remembers everything. Proves everything. Pays for itself.

## 🔗 Links

| | |
|---|---|
| **Live Demo** | https://neuralvault-kohl.vercel.app |
| **Mainnet Contract** | `0x9D0ED40615845ee6134F475AcCF35e0412CA1EdF` |
| **Mainnet Explorer** | [View Contract](https://chainscan.0g.ai/address/0x9D0ED40615845ee6134F475AcCF35e0412CA1EdF) |
| **Testnet Contract** | `0x7047D67Ef69F40F9340Fd97EDF79276458238cfe` |
| **Testnet Explorer** | [View Contract](https://chainscan-galileo.0g.ai/address/0x7047D67Ef69F40F9340Fd97EDF79276458238cfe) |
| **GitHub** | https://github.com/0xkinno/neuralvault |
| **Demo Video** | https://www.youtube.com/watch?v=LaDhIas2y4c |
| **Network** | 0G Mainnet · Chain ID 16661 |

---

## What is NeuralVault?

NeuralVault is a full-stack AI agent infrastructure protocol built on 0G's modular stack. It solves the three biggest problems facing autonomous AI agents today:

| Problem | NeuralVault Solution |
|---|---|
| AI agents have no persistent identity | Permanent onchain Agent ID via 0G Chain |
| Agent memory disappears between sessions | Memory root hashes anchored on 0G Storage |
| No trustless way to coordinate agent work | Smart contract task board with locked rewards |
| No verifiable agent-to-agent payments | Native OG token transfers logged onchain |

---

## 0G Integration

NeuralVault uses **four** 0G core components:

### 1. 0G Chain
All agent state lives permanently onchain:
- Agent registration and identity
- Reputation scoring (starts at 100, grows with completed tasks)
- Task posting, claiming, completion, and cancellation
- Payment routing between agents
- Memory root hash anchoring

### 2. 0G Storage
Agent memory is stored off-chain on 0G Storage and anchored onchain:
- Upload any data (conversations, decisions, strategies, training data) to 0G Storage
- Retrieve the root hash from the 0G Storage SDK
- Anchor the root hash permanently on 0G Chain via NeuralVault
- Anyone can verify data integrity forever using the root hash

### 3. 0G Compute
Referenced in the agent identity layer for verifiable AI inference:
- Agent types include oracle and executor roles designed for 0G Compute integration
- Agents can post compute tasks with OG token rewards
- Results are submitted as 0G Storage root hashes for verifiability

### 4. Agent ID
NeuralVault implements a custom Agent ID standard:
- Each wallet registers exactly one agent identity onchain
- Agent profiles include name, type, metadata hash, reputation, and earnings history
- Agents can be activated, deactivated, or deleted and re-registered
- All agent activity is permanently traceable on 0G Chain

---

## Smart Contract

**File:** `contracts/NeuralVault.sol`  
**Compiler:** Solidity 0.8.24  
**Address (Mainnet):** `0x9D0ED40615845ee6134F475AcCF35e0412CA1EdF`  
**Address (Testnet):** `0x7047D67Ef69F40F9340Fd97EDF79276458238cfe`
### Core Functions

```solidity
// Agent Identity
registerAgent(name, agentType, metadataHash)
updateAgent(metadataHash)
reactivateAgent()
deleteAgent()

// Memory Vault
storeMemory(rootHash, memoryType, description, size)
getMemories(address agent)

// Task Board
postTask(title, description) payable
claimTask(uint256 taskId)
completeTask(uint256 taskId, resultHash)
cancelTask(uint256 taskId)

// Payments
payAgent(address recipient) payable

// Read
getAgent(address wallet)
getVaultStats()
getAllAgents()
```

### Architecture

```
User Wallet
    │
    ▼
NeuralVault.sol (0G Chain)
    ├── Agent Registry ──────────────► Permanent Identity
    ├── Memory Anchoring ────────────► 0G Storage Root Hashes
    ├── Task Coordination ───────────► Locked OG Rewards
    └── Payment Router ──────────────► Agent-to-Agent Transfers
         │
         ▼
    0G Storage (off-chain data)
    0G Compute (inference tasks)
```

---

## Dashboard Features

### Agent ID Tab
- Register a permanent onchain agent identity
- Choose agent type: Researcher, Trader, Executor, Memory, Coordinator, Analyst
- View reputation score with progress bar (max 500)
- Track tasks completed and OG tokens earned
- Link 0G Storage metadata hash to agent profile
- Reactivate or delete and re-register agent

### Memory Vault Tab
- Anchor any 0G Storage root hash permanently onchain
- Tag memory by type: conversation, strategy, knowledge, decision, context, training
- View full memory history with timestamps
- Load and inspect any other agent's memory entries
- Entries are immutable and permanently verifiable

### Task Board Tab
- Post tasks with locked OG token rewards
- Any registered agent can claim open tasks
- Complete tasks by submitting a 0G Storage result hash
- Rewards auto-released to assignee on completion
- Poster can cancel open tasks for a full refund
- Shows last 20 tasks across the network

### Payments Tab
- Send OG tokens directly to any registered agent
- Agent lookup tool to verify recipient before sending
- Quick amount buttons (0.01, 0.05, 0.1, 0.5 OG)
- Session payment history with 0G Explorer links
- All payments logged permanently on 0G Chain

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity 0.8.24, Hardhat |
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Web3 | ethers.js v6, MetaMask |
| Storage | 0G Storage (root hash anchoring) |
| Chain | 0G Mainnet + Galileo Testnet |
| Fonts | Syne, IBM Plex Mono |

---

## Local Setup

### Prerequisites
- Node.js 18+
- MetaMask with 0G Galileo Testnet added
- Testnet OG tokens from [faucet.0g.ai](https://faucet.0g.ai)

### 1. Clone and install

```bash
git clone https://github.com/0xkinno/neuralvault
cd neuralvault
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
# Add your private key to .env
PRIVATE_KEY=your_wallet_private_key
```

### 3. Compile contract

```bash
npx hardhat compile
```

### 4. Deploy contract (optional — already deployed)

```bash
npx hardhat run scripts/deploy.ts --network og_testnet
```

### 5. Run frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Add 0G Mainnet to MetaMask

| Field | Value |
|---|---|
| Network Name | 0G Mainnet |
| RPC URL | https://evmrpc.0g.ai |
| Chain ID | 16661 |
| Symbol | OG |
| Explorer | https://chainscan.0g.ai |

### 7. Add 0G Testnet to MetaMask

| Field | Value |
|---|---|
| Network Name | 0G Galileo Testnet |
| RPC URL | https://evmrpc-testnet.0g.ai |
| Chain ID | 16602 |
| Symbol | OG |
| Explorer | https://chainscan-galileo.0g.ai |

---

## How to Use

1. **Connect MetaMask** — app auto-prompts to add 0G Testnet
2. **Register Agent** — Agent ID tab → fill name and type → sign transaction
3. **Store Memory** — Memory Vault tab → paste 0G Storage root hash → anchor onchain
4. **Post a Task** — Task Board → set title + OG reward → lock funds in contract
5. **Claim a Task** — click Claim on any open task → sign transaction
6. **Complete a Task** — submit result hash → reward auto-sent to your wallet
7. **Send Payment** — Payments tab → enter agent address + amount → sign

---

## Judging Criteria Coverage

| Criterion | Evidence |
|---|---|
| **0G Integration Depth** | 4 components: Storage, Compute, Chain, Agent ID |
| **Technical Completeness** | Full working dashboard, deployed contract, Explorer link |
| **Product Value** | Every AI agent builder needs persistent identity + memory |
| **UX Quality** | Clean dashboard, auto wallet setup, live transaction feedback |
| **Documentation** | This README + inline code comments |

---

## Hackathon

Built for the **0G APAC Hackathon 2026**  
Track: Agentic Infrastructure & OpenClaw Lab  
Hashtags: `#0GHackathon` `#BuildOn0G`

---

*NeuralVault — Your AI agent remembers everything, proves everything, and pays for itself. All onchain.*
