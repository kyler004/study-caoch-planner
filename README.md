# Study Coach Planner

Study Coach Planner is a web application designed to support learners in planning, tracking, and optimizing their study activities. Built with Next.js and TypeScript, the application integrates calendar visualization, task management, focus timing, and performance insights into a single productivity interface.

## Project Overview

The application provides a responsive front-end experience for students and self-directed learners. It includes the following core features:

- A calendar view for scheduling sessions and visualizing commitments.
- A draggable task queue for organizing study tasks.
- A focus timer for managing work intervals and maintaining concentration.
- Performance insights and statistical dashboards to evaluate productivity trends.
- Integration with AI-assisted planning components for personalized study recommendations.

## Repository Structure

The repository follows a conventional Next.js project layout with dedicated directories for components, application routes, context management, and library utilities.

- `app/`
  - `layout.tsx` and `page.tsx`: Primary application shell and landing page.
  - `globals.css`: Global style definitions.
  - `api/`: Server route endpoints.
    - `gemini/route.ts`: API route for Gemini integration.

- `components/`
  - `AIStudyCoach.tsx`: AI-powered study coach interface.
  - `CalendarView.tsx`: Calendar visualization component.
  - `DraggableTaskQueue.tsx`: Task management and drag-and-drop workflow.
  - `FocusTimer.tsx`: Timer component for focused study sessions.
  - `PerformanceInsights.tsx`: Productivity analytics and insight presentation.
  - `SchedulesGantt.tsx`: Gantt chart schedule visualization.
  - `StatsDashboard.tsx`: Statistical reporting dashboard.
  - `UpcomingEvents.tsx`: Upcoming events and deadlines display.

- `context/`
  - `StudyContext.tsx`: React context provider for application state and study planning data.

- `lib/`
  - `firebase.ts`: Firebase initialization and configuration utilities.

- `next.config.ts`, `tsconfig.json`, `package.json`, and `postcss.config.mjs`
  - Project configuration and build settings for the Next.js application.

## Development

### Prerequisites

- Node.js 18 or later
- npm 10 or later

### Installation

1. Install dependencies:
   `npm install`

2. Configure environment values in a local environment file such as `.env.local`.

3. Start the development server:
   `npm run dev`

The application will be available at `http://localhost:3000` by default.

## Deployment

The project is configured for deployment as a standard Next.js application. Deployment targets may include Vercel, Netlify, or any platform supporting Next.js.

## Notes

This repository is intended for use as a study planning and productivity tool. Review the component files and context implementation for customization of the study model, scheduling logic, and AI integration.
