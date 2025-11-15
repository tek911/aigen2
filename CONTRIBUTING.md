# Contributing to Arena

Thank you for your interest in contributing to Arena! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment
- Debate ideas, not people

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/arena-debate.git
   cd arena-debate
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Project

```bash
# Start all services
npm run dev

# Run specific workspace
npm run dev --filter=@arena/web
npm run dev --filter=@arena/api

# Database operations
npm run db:push      # Push schema changes
npm run db:migrate   # Create migration
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database
```

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run type-check
```

### Commit Messages

Follow conventional commits:

```
feat: Add new debate format
fix: Resolve ELO calculation bug
docs: Update API documentation
refactor: Simplify voting logic
test: Add debate router tests
chore: Update dependencies
```

## Project Structure

```
arena-debate/
├── apps/
│   ├── web/        # Frontend application
│   └── api/        # Backend API
├── packages/
│   ├── database/   # Prisma schema
│   ├── ai-service/ # AI integration
│   └── shared/     # Shared utilities
```

## Making Changes

### Adding a New Feature

1. **Create an issue** describing the feature
2. **Discuss** the approach in the issue
3. **Implement** the feature with tests
4. **Update** documentation
5. **Submit** a pull request

### Fixing a Bug

1. **Create an issue** with reproduction steps
2. **Write a test** that fails
3. **Fix** the bug
4. **Verify** the test passes
5. **Submit** a pull request

## Testing

```bash
# Run all tests
npm run test

# Run tests for specific package
npm run test --filter=@arena/api

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Database Changes

When modifying the schema:

1. **Update** `packages/database/prisma/schema.prisma`
2. **Create migration**
   ```bash
   cd packages/database
   npx prisma migrate dev --name your_migration_name
   ```
3. **Test** the migration thoroughly
4. **Update seed** file if needed

## Adding tRPC Routes

1. **Create router** in `apps/api/src/routers/`
2. **Add to app router** in `apps/api/src/routers/index.ts`
3. **Add types** to `packages/shared/src/types.ts`
4. **Add validators** to `packages/shared/src/validators.ts`
5. **Test** the endpoint

## UI Components

When adding new components:

1. **Use Shadcn/ui** primitives when possible
2. **Follow accessibility** guidelines
3. **Add TypeScript** types
4. **Document props** with JSDoc
5. **Add to Storybook** if applicable

## Pull Request Process

1. **Update** the README if needed
2. **Add tests** for new functionality
3. **Ensure** all tests pass
4. **Update** documentation
5. **Request review** from maintainers

### PR Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Commits follow conventional format
- [ ] PR description explains changes

## Areas to Contribute

### High Priority
- Additional debate formats
- Mobile app development
- Performance optimizations
- Accessibility improvements
- Test coverage

### Features
- Video debate support
- Advanced analytics
- Tournament system
- Team debates
- Debate recordings

### Documentation
- API documentation
- Tutorial videos
- Blog posts
- Translations

## Questions?

- Open a discussion on GitHub
- Join our Discord
- Email: dev@arena-debate.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
