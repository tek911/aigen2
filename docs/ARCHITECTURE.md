# Arena Platform Architecture

## System Overview

Arena is built as a modern, scalable monorepo application using a microservices-inspired architecture with shared packages for code reuse.

## Architecture Patterns

### Domain-Driven Design (DDD)
- Clear bounded contexts for Users, Debates, Topics, Gamification
- Rich domain models with business logic
- Repository pattern for data access

### Event-Driven Architecture
- Real-time events via Socket.IO
- Asynchronous processing for AI analysis
- Event sourcing for debate history

### CQRS (Command Query Responsibility Segregation)
- Separate read and write models for debates
- Optimized queries for leaderboards
- Cached reads with Redis

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Pages     │  │  Components  │  │  State (Zustand) │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│         │                 │                    │             │
│         └─────────────────┴────────────────────┘             │
│                           │                                  │
│                      tRPC Client                             │
└───────────────────────────┼──────────────────────────────────┘
                            │
                     ┌──────┴──────┐
                     │             │
┌────────────────────┼─────────────┼────────────────────────┐
│                    │             │                         │
│        ┌───────────▼──┐    ┌────▼─────┐                  │
│        │  tRPC Server │    │ Socket.IO│                  │
│        └───────┬──────┘    └────┬─────┘                  │
│                │                │                         │
│         ┌──────▼────────────────▼──────┐                 │
│         │     Business Logic Layer      │                 │
│         │  ┌────────────────────────┐  │                 │
│         │  │  Debate Service        │  │                 │
│         │  │  User Service          │  │                 │
│         │  │  Gamification Service  │  │                 │
│         │  └────────────────────────┘  │                 │
│         └──────┬──────────────┬────────┘                 │
│                │              │                           │
│         ┌──────▼──────┐  ┌───▼──────┐                   │
│         │   Prisma    │  │  Redis   │                   │
│         │   (ORM)     │  │  Cache   │                   │
│         └──────┬──────┘  └──────────┘                   │
└────────────────┼─────────────────────────────────────────┘
                 │
         ┌───────▼────────┐
         │   PostgreSQL   │
         └────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    AI Services (AWS)                      │
│  ┌──────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │   Bedrock    │  │     S3      │  │   Lambda      │  │
│  │  (Claude)    │  │  (Storage)  │  │  (Functions)  │  │
│  └──────────────┘  └─────────────┘  └───────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Debate Creation Flow
```
User → Next.js → tRPC → Debate Router → Prisma → PostgreSQL
                    ↓
              Socket.IO → Notify Participants
```

### 2. Argument Submission Flow
```
User → Next.js → tRPC → Debate Router
                    ↓
            AI Service (Toxicity Check)
                    ↓
            AI Service (Quality Analysis)
                    ↓
              Prisma → PostgreSQL
                    ↓
            Socket.IO → Broadcast to Spectators
```

### 3. AI Analysis Flow
```
Debate Completion → Debate Router
                        ↓
                  Gather Arguments
                        ↓
              AWS Bedrock (Claude)
                        ↓
              Parse AI Response
                        ↓
            Store Analysis → PostgreSQL
                        ↓
              Update User Stats (ELO, XP)
```

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers behind load balancer
- Socket.IO with Redis adapter for multi-instance
- Database read replicas for queries

### Caching Strategy
- Redis for:
  - User sessions
  - Leaderboard data (5 min TTL)
  - Trending topics (1 min TTL)
  - User profiles (10 min TTL)
  - AI analysis results (permanent)

### Database Optimization
- Indexed columns: eloRating, trendingScore, status
- Partitioning for debate history by date
- Materialized views for leaderboards
- Connection pooling (max 20 connections)

### CDN Strategy
- Static assets on CloudFront
- Image optimization with Next.js Image
- Profile pictures on S3 with CloudFront

## Security Architecture

### Authentication
- JWT tokens with 7-day expiration
- Refresh token rotation
- HTTP-only cookies for web clients

### Authorization
- Role-based access control (RBAC)
- Row-level security in Prisma queries
- Rate limiting per endpoint

### Data Protection
- Passwords hashed with bcrypt (10 rounds)
- PII encrypted at rest
- TLS 1.3 for all connections
- CORS configured for known origins

## Monitoring & Observability

### Logging
- Structured JSON logs
- Log levels: ERROR, WARN, INFO, DEBUG
- Request ID tracking across services

### Metrics
- API response times
- Database query performance
- AI service latency
- Active WebSocket connections
- Memory and CPU usage

### Alerting
- >1% error rate
- >3s API response time
- Database connection pool exhaustion
- AI service failures

## Disaster Recovery

### Backups
- PostgreSQL: Daily full, hourly incremental
- S3: Cross-region replication
- Retention: 30 days

### High Availability
- Multi-AZ database deployment
- Auto-scaling for API servers
- Circuit breakers for external services
- Graceful degradation without AI

## Technology Decisions

### Why Next.js?
- Server-side rendering for SEO
- App Router for modern React patterns
- Built-in optimizations
- Great developer experience

### Why tRPC?
- End-to-end type safety
- No code generation needed
- Excellent DX with React Query
- Smaller bundle size vs GraphQL

### Why Prisma?
- Type-safe database access
- Excellent migrations
- Auto-generated types
- Great tooling

### Why Socket.IO?
- Reliable WebSocket fallbacks
- Built-in reconnection
- Room support for debates
- Large ecosystem

### Why AWS Bedrock?
- Access to Claude without API quotas
- Pay-per-use pricing
- Consistent latency
- Enterprise SLA
