# Arena - Competitive Debate Platform with AI Arbitration

A production-ready, viral debate platform where users engage in structured, AI-moderated debates with ELO ratings, achievement systems, and viral sharing mechanics. Arena celebrates intellectual honesty and rewards users who change their minds based on evidence.

## Features

### Core Debate Engine
- **Multiple Debate Formats**
  - Lightning: 5 minutes, 30-second turns
  - Standard: 30 minutes, 2-minute turns
  - Deep Dive: 7 days, daily exchanges
  - Team Battle: 3v3, coordinated arguments

- **Real-time Debate Experience**
  - Live typing indicators
  - Spectator reactions and chat
  - Turn-based argument submission
  - Live audience count

### AI Integration (AWS Bedrock - Claude Sonnet)
- **Pre-Debate**
  - Generate neutral topic briefings
  - Suggest arguments for both sides

- **During Debate**
  - Real-time toxicity detection
  - Automatic fact-checking
  - Logical fallacy identification
  - Argument quality scoring

- **Post-Debate**
  - Comprehensive AI analysis
  - Winner determination with confidence scores
  - Highlight generation
  - Common ground identification

### Gamification System
- **ELO Rating System**: Competitive ranking based on debate performance
- **Achievements**: 50+ achievements for various milestones
- **Badges**: Collectible badges based on rarity (Common → Legendary)
- **XP & Levels**: Progress through 100 levels
- **Credibility Score**: Dynamic score based on behavior and performance
- **Leaderboards**: Global, topic-specific, and seasonal rankings

### User Features
- **Stance Tracking**: Track position evolution on topics
- **Camp System**: Join communities supporting specific positions
- **Resource Libraries**: Shared evidence and strategies within camps
- **Debate History**: Complete record with statistics
- **Profile Analytics**: Detailed performance metrics

### Social & Viral Features
- **Share Debates**: One-click sharing to social media
- **Mind-Change Certificates**: Shareable achievements
- **Challenge Links**: "Debate Me" instant challenge links
- **Highlight Reels**: Auto-generated best moments

## Tech Stack

### Frontend
- **Next.js 14** - App Router, Server Components
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Accessible component library
- **Framer Motion** - Smooth animations
- **tRPC** - End-to-end typesafe APIs
- **React Query** - Data fetching and caching
- **Zustand** - State management

### Backend
- **Node.js** - Runtime environment
- **Express** - HTTP server
- **tRPC** - Type-safe API layer
- **Socket.io** - Real-time communication
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions

### AI & Cloud
- **AWS Bedrock** - Claude Sonnet AI
- **AWS S3** - Media storage
- **AWS Lambda** - Serverless functions (optional)

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Local development
- **Kubernetes** - Production orchestration (optional)
- **Turbo** - Monorepo build system

## Project Structure

```
arena-debate/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/        # App router pages
│   │   │   ├── components/ # React components
│   │   │   ├── hooks/      # Custom hooks
│   │   │   ├── lib/        # Utilities
│   │   │   └── store/      # State management
│   │   └── package.json
│   │
│   └── api/                 # Backend services
│       ├── src/
│       │   ├── routers/    # tRPC routers
│       │   ├── services/   # Business logic
│       │   └── socket.ts   # Real-time server
│       └── package.json
│
├── packages/
│   ├── database/           # Prisma schemas & client
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   │       ├── index.ts
│   │       └── seed.ts
│   │
│   ├── ai-service/         # AWS Bedrock integration
│   │   └── src/
│   │       ├── bedrock-client.ts
│   │       ├── debate-analyzer.ts
│   │       ├── moderation.ts
│   │       ├── fact-checker.ts
│   │       └── argument-quality.ts
│   │
│   └── shared/             # Shared types/utils
│       └── src/
│           ├── types.ts
│           ├── constants.ts
│           ├── validators.ts
│           └── utils.ts
│
├── docker/
│   ├── Dockerfile.api
│   └── Dockerfile.web
│
├── docker-compose.yml
├── turbo.json
└── package.json
```

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 15
- Redis >= 7
- AWS Account (for Bedrock access)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/arena-debate.git
cd arena-debate
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/arena_debate"
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_SECRET="generate-a-32-char-secret"
NEXTAUTH_URL="http://localhost:3000"

# AWS
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_BEDROCK_MODEL_ID="anthropic.claude-3-sonnet-20240229-v1:0"
S3_BUCKET_NAME="your-bucket"
```

4. **Initialize the database**
```bash
npm run db:push
npm run db:seed
```

5. **Start development servers**
```bash
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Socket.IO: ws://localhost:3001

### Using Docker

For a complete environment with PostgreSQL and Redis:

```bash
docker-compose up -d
```

This starts all services:
- Web: http://localhost:3000
- API: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Database Schema

### Core Entities

**User**
- Authentication (email, password, OAuth)
- Stats (ELO rating, credibility score, level, XP)
- Streak tracking
- Moderation flags

**Topic**
- Title, description, category
- Heat and trending scores
- Camp associations

**Debate**
- Format (Lightning, Standard, Deep Dive, Team Battle)
- Status flow (Challenge → Active → Voting → Completed)
- Participants, arguments, votes
- AI analysis results

**Argument**
- Content, turn number
- Quality and toxicity scores
- Fallacy detection results
- Source citations

**Achievement & Badge**
- Unlock conditions
- Tier/rarity system
- User progress tracking

**Camp**
- Topic-specific communities
- Resource sharing
- Strategy collaboration

## API Documentation

### tRPC Routers

#### Auth Router
```typescript
auth.register({ username, email, password })
auth.login({ email, password })
```

#### User Router
```typescript
user.getProfile({ userId })
user.updateProfile({ username, bio, avatar })
user.getStats()
user.getDebateHistory({ page, pageSize })
user.updateStance({ topicId, position, confidence })
```

#### Debate Router
```typescript
debate.list({ topicId, format, status, page })
debate.get({ id })
debate.create({ topicId, format, position })
debate.join({ debateId, position })
debate.submitArgument({ debateId, content, sources })
debate.startDebate({ debateId })
debate.completeDebate({ debateId })
```

#### Topic Router
```typescript
topic.list({ category, sortBy, page })
topic.get({ id })
topic.create({ title, description, category })
topic.trending({ limit })
topic.search({ query })
```

#### Vote Router
```typescript
vote.submit({ debateId, winnerId, reasoning })
vote.getResults({ debateId })
```

## AI Service Usage

### Debate Analysis
```typescript
import { DebateAnalyzerService } from "@arena/ai-service";

const analyzer = new DebateAnalyzerService();

const analysis = await analyzer.analyzeDebate(
  topic,
  participant1Data,
  participant2Data
);
```

### Moderation
```typescript
import { ModerationService } from "@arena/ai-service";

const moderator = new ModerationService();

const toxicity = await moderator.checkToxicity(text);
if (toxicity.isToxic) {
  // Handle toxic content
}
```

### Fact Checking
```typescript
import { FactCheckerService } from "@arena/ai-service";

const factChecker = new FactCheckerService();

const result = await factChecker.checkClaim(claim);
console.log(result.verdict); // TRUE, FALSE, UNVERIFIABLE, etc.
```

## Real-time Features

### Socket.IO Events

**Client → Server**
- `debate:join` - Join debate room
- `debate:leave` - Leave debate room
- `argument:submit` - Submit new argument
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `reaction:add` - Add reaction to argument

**Server → Client**
- `argument:received` - New argument posted
- `debate:update` - Debate state changed
- `presence:update` - User online/offline
- `spectator:count` - Viewer count update
- `notification:new` - New notification

## Deployment

### Environment Setup

#### Development
```bash
npm run dev
```

#### Production Build
```bash
npm run build
npm run start
```

#### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables (Production)

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NEXTAUTH_SECRET=your-production-secret
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

### Kubernetes Deployment

See `/k8s` directory for Kubernetes manifests:
- Deployment configs
- Service definitions
- Ingress rules
- ConfigMaps and Secrets

## Testing

### Run Tests
```bash
npm run test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Load Testing
```bash
npm run test:load
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Performance Targets

- 60-second onboarding to first debate
- <3 second page loads
- Real-time updates <100ms latency
- AI moderation catches 95% toxic content
- 30% of users complete first debate
- 10% weekly active retention

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- AWS Bedrock for AI capabilities
- Anthropic Claude for natural language processing
- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- All contributors and debaters

## Support

- Documentation: https://docs.arena-debate.com
- Discord: https://discord.gg/arena-debate
- Email: support@arena-debate.com

---

**Built with passion for better discourse** 🎯
