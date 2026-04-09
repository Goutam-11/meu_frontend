# MEU - Trading Agent Management Dashboard

A modern, full-stack web application for creating, managing, and monitoring AI-powered trading agents. Built with Next.js 16, TypeScript, and MongoDB.

**Creator:** Goutam Sharma

## Overview

MEU (Management & Execution Unit) is a comprehensive dashboard for trading automation. It provides a centralized platform to create and manage trading agents, configure exchange connections, manage API credentials, and monitor real-time trading activity and notifications.

## Key Features

### 🤖 Agent Management
- **Create Agents**: Set up new trading agents with custom configurations
- **Agent Types**: Support for both crypto and stock trading
- **Trading Strategies**: Choose from ALGO_TRADING, LLM_TRADING, or HYBRID approaches
- **Risk Management**: Configure per-trade risk limits and daily loss thresholds
- **Agent Monitoring**: Track agent status, last run times, and performance metrics
- **Real-time Control**: Start, pause, and modify running agents

### 🔑 Credential Management
- **Multi-Provider Support**: OpenRouter, OpenAI, Anthropic
- **Secure Storage**: API keys encrypted and securely stored
- **Easy Integration**: Seamlessly connect AI models to agents

### 💱 Exchange Integration
- **Multi-Exchange Support**: Connect to various crypto and stock exchanges via CCXT
- **Sandbox Mode**: Test trading strategies in sandbox environments
- **Exchange Configuration**: Manage API keys and trading URLs
- **Real-time Sync**: Automatic balance and position synchronization

### 📊 Trading Analytics
- **Order Logging**: Track all executed orders and trades
- **Position Management**: Monitor open positions and P&L
- **Trade History**: Complete trading history with execution details
- **Agent Runs**: View detailed logs of agent strategy executions

### 🔔 Notifications System
- **Multi-Channel Alerts**: Error, warning, and info notifications
- **Source Tracking**: Identify whether alerts come from agents, system, or exchanges
- **Smart Routing**: Notifications specific to users, agents, or exchanges
- **Status Management**: Mark notifications as read or acknowledged

### 👤 Authentication & Authorization
- **Secure Auth**: Email/password authentication with better-auth
- **Session Management**: Persistent user sessions
- **User Profiles**: Custom user accounts with profile management

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI (comprehensive component library)
- **Forms**: React Hook Form + Zod validation
- **State Management**: TanStack React Query
- **Animations**: Framer Motion

### Backend
- **API**: tRPC (type-safe RPC framework)
- **Database**: MongoDB (via Prisma)
- **ORM**: Prisma 6.19
- **Authentication**: better-auth
- **AI Integration**: AI SDK with OpenRouter support

### Additional Libraries
- **Exchange Integration**: CCXT
- **Encryption**: Cryptr
- **Charts**: Recharts
- **Markdown**: React Markdown
- **Notifications**: Sonner
- **Data Validation**: Zod
- **Date Handling**: date-fns

## Installation

### Prerequisites
- Node.js 18+
- MongoDB instance running
- Package manager: npm, yarn, pnpm, or bun

### Setup Steps

1. **Clone the repository and install dependencies:**
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

2. **Configure environment variables:**
Create a `.env.local` file in the root directory:
```
DATABASE_URL=mongodb://localhost:27017/trading_db
BETTER_AUTH_SECRET=your_secret_key_here
OPENAI_API_KEY=your_openai_key
OPENROUTER_API_KEY=your_openrouter_key
```

3. **Generate Prisma client:**
```bash
npx prisma generate
```

4. **Run database migrations:**
```bash
npx prisma migrate dev
```

5. **Start the development server:**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

6. **Open in browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
meu/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Main dashboard routes
│   │   ├── api/               # API routes & tRPC endpoint
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── ui/                # Radix UI wrapped components
│   │   ├── entityComponents/  # Feature-specific components
│   │   ├── appHeader.tsx      # App header
│   │   ├── appSidebar.tsx     # Sidebar navigation
│   │   ├── login.tsx          # Login component
│   │   └── signup.tsx         # Signup component
│   ├── features/              # Feature modules
│   │   ├── agents/            # Agent management
│   │   │   ├── components/    # Agent UI components
│   │   │   ├── hooks/         # Agent-related hooks
│   │   │   └── server/        # tRPC agent router
│   │   ├── credentials/       # Credential management
│   │   ├── exchange/          # Exchange configuration
│   │   └── notifications/     # Notification system
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   ├── trpc/                  # tRPC configuration
│   │   ├── routers/          # tRPC route definitions
│   │   ├── client.tsx        # tRPC client setup
│   │   ├── server.tsx        # tRPC server setup
│   │   └── init.ts           # tRPC initialization
│   └── generated/            # Auto-generated files
│       └── prisma/           # Prisma client
├── prisma/
│   └── schema.prisma         # Database schema
├── public/                    # Static assets
├── tests/                     # Test files
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.js
└── prisma.config.ts
```

## Database Schema

### Core Models
- **User**: User accounts with authentication details
- **Session**: User session management
- **Account**: OAuth/provider accounts
- **Verification**: Email/identity verification

### Trading Models
- **Agent**: AI trading agents with configurations
- **Exchange**: Exchange connections and API credentials
- **Credentials**: AI model API credentials (OpenAI, OpenRouter, etc.)
- **Positions**: Current open trading positions
- **Trades**: Historical trade records
- **OrderLogs**: Executed order tracking
- **AgentRuns**: Agent execution logs

### Notification Models
- **Notification**: System alerts and messages

### Key Enums
- **Status**: RUNNING, PAUSED
- **AgentType**: CRYPTO, STOCKS
- **AgentStrategy**: ALGO_TRADING, LLM_TRADING, HYBRID
- **OrderType**: LIMIT, MARKET
- **Side**: BUY, SELL
- **NotificationType**: ERROR, WARNING, INFO

## API Endpoints (tRPC)

The application uses tRPC for type-safe API communication. Main routers:

- **Agents Router**: Create, read, update, delete agents
- **Credentials Router**: Manage AI API credentials
- **Exchange Router**: Configure trading exchanges
- **Notifications Router**: Fetch and manage notifications

## Authentication

The app uses `better-auth` for secure authentication:
- Email/password registration and login
- Session management
- User profile management
- Optional OAuth integration

## UI/UX Features

- **Responsive Design**: Mobile-friendly interface
- **Dark Mode Support**: Next-themes integration
- **Interactive Components**: Smooth animations with Framer Motion
- **Real-time Feedback**: Toast notifications via Sonner
- **Data Tables**: Interactive tables with sorting/filtering
- **Charts & Analytics**: Visual representation of trading data
- **Form Validation**: Client-side and server-side validation with Zod

## Development

### Running the Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

### Prisma Commands
```bash
# Generate Prisma client
npx prisma generate

# Open Prisma Studio
npx prisma studio

# Create migration
npx prisma migrate dev --name migration_name
```

## Available Routes

- `/` - Redirects to `/agents`
- `/(auth)/login` - User login page
- `/(auth)/signup` - User registration page
- `/(dashboard)/agents` - Agent management dashboard
- `/(dashboard)/agents/[id]` - Agent detail view
- `/(dashboard)/credentials` - API credential management
- `/(dashboard)/exchanges` - Exchange configuration
- `/(dashboard)/notifications` - Notification center

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
The project includes Docker support. Build and run:
```bash
docker build -t meu-app .
docker run -p 3000:3000 meu-app
```

### Environment Variables for Production
Ensure all required environment variables are set:
- `DATABASE_URL`: MongoDB connection string
- `BETTER_AUTH_SECRET`: Secure random string for authentication
- `OPENAI_API_KEY`: OpenAI API key (if using OpenAI)
- `OPENROUTER_API_KEY`: OpenRouter API key (if using OpenRouter)
- `NEXT_PUBLIC_*`: Any public variables must be prefixed

## Best Practices

1. **Security**: Never commit `.env.local` files
2. **Type Safety**: Always use TypeScript and Zod for validation
3. **API Calls**: Use tRPC hooks for type-safe API communication
4. **State Management**: Use React Query for server state management
5. **Form Handling**: Use React Hook Form for form management
6. **Error Handling**: Implement proper error boundaries and logging

## Troubleshooting

### Database Connection Issues
- Ensure MongoDB is running on the configured URL
- Check DATABASE_URL in `.env.local`

### tRPC Type Errors
- Regenerate Prisma client: `npx prisma generate`
- Clear `.next` directory: `rm -rf .next`

### Build Failures
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`

## Contributing

This project is under active development. Features are still being added and refined.

## License

Created by Goutam Sharma

---

**Note**: This application is designed to work alongside the **schedulerService** microservice that handles the actual agent execution and trading logic.