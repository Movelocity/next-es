# Project Context

## Purpose
ES Viewer is a modern ElasticSearch query and log viewing tool built with Next.js. It provides an intuitive interface for executing ES queries and viewing results with features including:
- Real-time ElasticSearch query execution with native Query DSL support
- Multi-workspace management for organizing different query environments
- Query template system for saving and reusing common queries
- Dual view modes (Raw JSON and structured list)
- Offline support via Service Worker
- Dark theme UI with CodeMirror integration

Target users: Developers and operations engineers who need to query and analyze ElasticSearch logs and data.

## Tech Stack
- **Framework**: Next.js 14 (App Router architecture)
- **Language**: TypeScript 5 (strict mode enabled)
- **Styling**: Tailwind CSS 3.4
- **Code Editor**: CodeMirror 6 with JSON/JavaScript language support
- **State Management**: Zustand 5 (with localStorage persistence)
- **ES Client**: @elastic/elasticsearch ^8.15
- **Themes**: Dracula, Abyss (via @uiw/codemirror themes)
- **Runtime**: Node.js >= 18
- **Package Manager**: Yarn (primary), npm/pnpm supported

## Project Conventions

### Code Style
- **TypeScript**: Strict mode enabled, all code must be type-safe
- **Path Aliases**: Use `@/` prefix for imports from the `app/` directory (e.g., `@/components`, `@/utils`)
- **File Naming**: 
  - React components: PascalCase (e.g., `EsLogPanel.tsx`, `WorkspaceManager.tsx`)
  - Utilities and stores: camelCase (e.g., `service.ts`, `store.ts`)
  - API routes: lowercase with `route.ts` suffix
- **Comments**: Preserve useful parameter and method descriptions (per user rules)
- **Linting**: ESLint with Next.js config (`eslint-config-next`)

### Architecture Patterns
- **Next.js App Router**: Route groups used for organization (e.g., `(main)/`)
- **API Routes**: Backend logic in `app/api/` directory (search, version, workspace endpoints)
- **Component Structure**:
  - Feature components: `app/components/[FeatureName]/` (e.g., `EsLogPanel/`, `SearchResults/`)
  - Shared UI components: `app/components/ui/`
  - Common utilities: `app/utils/`
- **State Management**:
  - Zustand stores for global state (see `store.ts` pattern)
  - localStorage for persistence with server sync
  - Workspace-based data isolation
- **Data Storage**:
  - File-based workspace data in `data/workspaces/`
  - Each workspace has separate JSON files for queries, params, and config
- **Service Worker**: Offline support and caching strategy (see `docs/SERVICE_WORKER_GUIDE.md`)

### Testing Strategy
- Currently no formal testing framework configured
- Manual testing via development server on port 3999
- Linting enforced via `yarn lint`

### Git Workflow
- **Branching**: Feature branches from main (e.g., `feature/AmazingFeature`)
- **Commits**: Descriptive commit messages encouraged
- **Pull Requests**: Required for merging features
- **Release**: Version updates via `scripts/update-version.js`
- **Changelog**: Maintained in `docs/CHANGELOG.md`

## Domain Context

### ElasticSearch Query DSL
- The application works with native ElasticSearch Query DSL (JSON format)
- Supports all standard ES query types (match, term, range, bool, aggregations, etc.)
- Query templates support parameterization with `$` prefix (e.g., `$开始时间`, `$结束时间`)
- Global search parameters are used for template variable substitution

### Workspace Concept
- Workspaces are isolated query environments
- Each workspace stores:
  - Search request query (`searchReq.json`)
  - Global parameters (`gSearchParams.json`)
  - Query templates/cards (`queryCards.json`)
  - Value filters for result display (`valueFilter.json`)
- Default workspace: `default`
- Workspaces sync between localStorage and server file system

### Result Display Modes
- **Raw Mode**: Full JSON response from ElasticSearch
- **List Mode**: Structured view of hits with configurable field filters
- Value filters determine which fields to display (comma-separated list)

## Important Constraints

### Technical Constraints
- **Port**: Development server runs on port 3999 (non-standard to avoid conflicts)
- **ElasticSearch Version**: Compatible with ES 8.x (client version ^8.15)
- **Browser Requirements**: Modern browsers with localStorage and Service Worker support
- **Environment Variables Required**:
  - `ES_NODE`: ElasticSearch server URL (default: http://localhost:9200)
  - `ES_USER`: ES username (default: elastic)
  - `ES_PASS`: ES password (default: changeme)

### Business Constraints
- Private package (not published to public npm)
- Custom npm registry: https://nexus.yafex.cn/repository/npm-hosted/
- Chinese language support is primary, English secondary

### Security Constraints
- ES credentials stored in environment variables only (never in code)
- API routes use Next.js backend (credentials not exposed to client)
- CORS and authentication handled server-side

## External Dependencies

### Critical Services
- **ElasticSearch Server**: Required for all search operations
  - Must be accessible from Next.js backend
  - Authentication required (username/password)
  - Minimum version: 8.x

### Third-Party APIs/Libraries
- **@elastic/elasticsearch**: Official ES client for Node.js
- **CodeMirror 6**: Code editor component (via @uiw/react-codemirror)
- **Zustand**: State management without provider requirement
- **Tailwind CSS**: Utility-first CSS framework

### Development Services
- **Nexus Repository**: Custom npm registry for package publishing
- No external analytics or tracking services
- No cloud deployment services configured (self-hosted deployment)
