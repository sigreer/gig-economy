# CLAUDE.md - AI Assistant Guide for Gig Economy

> **Last Updated**: 2025-11-17
> **Purpose**: This document provides AI assistants with comprehensive context about the Gig Economy codebase, including structure, conventions, workflows, and development guidelines.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Codebase Structure](#codebase-structure)
3. [Technology Stack](#technology-stack)
4. [Architecture & Patterns](#architecture--patterns)
5. [Development Workflow](#development-workflow)
6. [Code Conventions](#code-conventions)
7. [Common Tasks](#common-tasks)
8. [Known Issues & Technical Debt](#known-issues--technical-debt)
9. [AI Assistant Guidelines](#ai-assistant-guidelines)

---

## Project Overview

**Gig Economy** is a self-hostable web platform for groups of friends to propose music gigs/events and express interest in attending them together. It solves the problem of coordinating live music attendance across WhatsApp groups.

### Key Features
- Browse and search upcoming gigs/events
- Filter by date range, location, venue, and artist
- Express interest in attending events
- Add new gigs with details (artist, venue, date, type)
- User-specific views with localStorage persistence
- Responsive design with dark mode support

### Project Status
**Early/Mid-stage Development** - Core functionality implemented, but needs backend, testing, and production deployment setup.

---

## Codebase Structure

```
gig-economy/
├── .git/                          # Git repository
├── .gitignore                     # Node.js-focused gitignore
├── README.md                      # User-facing project documentation
├── CLAUDE.md                      # This file - AI assistant guide
├── gig-economy.code-workspace     # VS Code workspace configuration
└── frontend/                      # React application (ONLY directory with code)
    ├── package.json               # Dependencies and npm scripts
    ├── package-lock.json          # Locked dependency versions
    ├── db.json                    # Mock database (45 gig entries)
    ├── tailwind.config.js         # Tailwind CSS configuration
    ├── postcss.config.js          # PostCSS configuration
    ├── public/                    # Static assets
    │   ├── index.html             # HTML template
    │   ├── manifest.json          # PWA manifest
    │   ├── robots.txt             # SEO crawler instructions
    │   └── [icons/logos]          # Favicon and PWA icons
    └── src/                       # React source code
        ├── index.js               # React entry point
        ├── App.js                 # Root component (19 LOC)
        ├── App.css                # App-specific styles
        ├── App.test.js            # App test (needs updating)
        ├── setupTests.js          # Jest configuration
        ├── reportWebVitals.js     # Performance monitoring
        ├── css/
        │   └── index.css          # Tailwind imports & custom styles
        └── components/
            └── GigTable.js        # Main table component (452 LOC)
```

### Key Observations
- **Frontend-only project** - No backend directory exists yet
- **Single component architecture** - GigTable.js handles most logic (needs refactoring)
- **Mock API** - Uses json-server with db.json for development
- **Standard CRA structure** - Created with Create React App

---

## Technology Stack

### Frontend Core
- **React 18.3.1** - Modern React with functional components and hooks
- **React DOM 18.3.1** - DOM rendering
- **Create React App 5.0.1** - Build tooling, webpack, babel, dev server

### UI & Styling
- **Tailwind CSS 3.4.6** - Utility-first CSS framework
- **Flowbite 2.4.1** - Tailwind component library (modals, tables, buttons)
- **PostCSS 8.4.39** + **Autoprefixer 10.4.19** - CSS processing
- **react-datepicker 7.3.0** - Date picker UI component
- **react-multi-select-component 4.3.4** - Multi-select dropdowns

### Data & HTTP
- **Axios 1.7.2** - HTTP client for API requests
- **json-server 1.0.0-beta.1** - Mock REST API (development only)
- **localStorage** - Client-side username persistence

### Testing
- **Jest** - Test runner (via react-scripts)
- **React Testing Library** - Component testing (@testing-library/react 13.4.0)
- **jest-dom 5.17.0** - Custom Jest matchers
- **user-event 13.5.0** - User interaction simulation

### Performance
- **web-vitals 2.1.4** - Core Web Vitals tracking

### Language
- **JavaScript ES6+** - No TypeScript (pure JS codebase)

---

## Architecture & Patterns

### Application Architecture
**Single Page Application (SPA)** - Frontend-only with mock backend

```
┌─────────────────────────────────────────┐
│          Browser (React App)            │
│  ┌────────────────────────────────────┐ │
│  │  App.js (Root Component)           │ │
│  │    └── GigTable.js (Main UI)      │ │
│  └────────────────────────────────────┘ │
│              ↓ Axios HTTP                │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   json-server (localhost:5000)          │
│              ↓                           │
│         db.json (Mock DB)               │
│   { gigs: [...45 entries...] }          │
└─────────────────────────────────────────┘
```

### Component Hierarchy
```
App.js (Root - 19 LOC)
  └── GigTable.js (Main Component - 452 LOC)
      ├── Search & Filter Controls
      ├── Column Visibility Toggles
      ├── Gig Data Table
      ├── Modal: Add New Event
      ├── Modal: Set Username
      └── Modal: Gig Details
```

### React Patterns Used
- **Functional Components Only** - No class components
- **React Hooks** - useState, useEffect for state and side effects
- **Controlled Components** - Form inputs managed by state
- **Conditional Rendering** - Ternary operators and logical AND (&&)
- **Event Handler Naming** - Prefix with `handle` (e.g., handleSearch)
- **Inline Event Handlers** - Arrow functions in JSX for event binding

### State Management
**No external state library** (no Redux, Zustand, etc.)
- Local state managed with `useState` hooks
- Side effects with `useEffect` for API calls and localStorage
- Props passed down component tree (currently only 2 levels)

### Data Flow
1. **Initial Load**: useEffect → Axios GET → Set gigs state
2. **User Actions**: Event handlers → State updates → Re-render
3. **Add Gig**: Form submission → Axios POST → Refetch data
4. **Filters**: State changes → Computed filteredGigs → Re-render
5. **Persistence**: Username stored in localStorage

### API Endpoints (Mock)
- `GET http://localhost:5000/gigs` - Fetch all gigs
- `POST http://localhost:5000/gigs` - Create new gig

**⚠️ Hardcoded URLs** - API endpoint is hardcoded in GigTable.js (needs env vars)

---

## Development Workflow

### Prerequisites
- **Node.js** - Version not specified (recommend v18+ for CRA 5)
- **npm** - Package manager (package-lock.json present)
- **Git** - Version control

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd gig-economy

# Install dependencies
cd frontend
npm install
```

### Running the Application

#### Option 1: Frontend Only (No Mock API)
```bash
cd frontend
npm start
```
- Development server starts on `http://localhost:3000`
- Hot reload enabled
- **Note**: API calls will fail without json-server

#### Option 2: Full Stack (With Mock API)
```bash
# Terminal 1 - Start mock API
cd frontend
npx json-server --watch db.json --port 5000

# Terminal 2 - Start React app
cd frontend
npm start
```
- Mock API runs on `http://localhost:5000`
- Frontend runs on `http://localhost:3000`
- Changes to db.json auto-reload json-server

### Available Scripts

```bash
npm start       # Start development server (port 3000)
npm run build   # Create production build in /build directory
npm test        # Run Jest tests in watch mode
npm run eject   # Eject from CRA (irreversible, NOT recommended)
```

### Git Workflow
- **Branch naming**: Feature branches prefixed with `claude/`
- **Current branch**: `claude/claude-md-mi3cdwvfya2mv1u9-014KtggiWxxYgTAQvjeSozca`
- **Commits**: Clear, descriptive messages
- **Pushing**: Always use `git push -u origin <branch-name>`

### Build Output
```bash
npm run build
# Creates optimized production build in:
# frontend/build/
#   ├── static/
#   │   ├── css/
#   │   └── js/
#   └── index.html
```

### Browser Support
- **Production**: >0.2% market share, not dead, not Opera Mini
- **Development**: Latest Chrome, Firefox, Safari

---

## Code Conventions

### JavaScript Style

#### General Patterns
- **ES6+ syntax** - Arrow functions, destructuring, template literals
- **Functional approach** - Pure functions where possible
- **Const by default** - Use `const` unless reassignment needed
- **Destructuring** - Destructure imports and objects

#### Naming Conventions
```javascript
// Variables and functions - camelCase
const userName = 'Alice';
const fetchGigs = () => {};

// React components - PascalCase
const GigTable = () => {};
const AddEventModal = () => {};

// Constants - UPPERCASE (for component-level constants)
const VENUE_OPTIONS = ['Venue A', 'Venue B'];

// Event handlers - handleXxx prefix
const handleSearch = (e) => {};
const handleSubmit = (e) => {};
```

#### File Naming
- **Components**: PascalCase matching component name (`GigTable.js`)
- **Utilities**: camelCase (`reportWebVitals.js`)
- **Styles**: Component name + `.css` (`App.css`)
- **Tests**: Component name + `.test.js` (`App.test.js`)

### React Component Structure

```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ComponentName.css';

// 2. Component definition
const ComponentName = () => {
  // 3. State declarations
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 4. Effects
  useEffect(() => {
    // Side effects
  }, []);

  // 5. Event handlers
  const handleClick = () => {
    // Handler logic
  };

  // 6. Computed values
  const filteredData = data.filter(/* ... */);

  // 7. Render
  return (
    <div className="container">
      {/* JSX */}
    </div>
  );
};

// 8. Export
export default ComponentName;
```

### Tailwind CSS Conventions

#### Usage Patterns
```javascript
// Utility-first approach
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800">

// Responsive design
<div className="w-full md:w-1/2 lg:w-1/3">

// Dark mode support
<button className="text-gray-900 dark:text-white bg-white dark:bg-gray-700">

// State variants
<button className="hover:bg-blue-700 focus:ring-4 focus:ring-blue-300">
```

#### Tailwind Configuration
- **Dark mode**: Manual toggle via `class` strategy
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- **Content paths**: `./src/**/*.{js,jsx,ts,tsx}`, `./public/index.html`
- **Plugins**: Flowbite integrated

### ESLint Configuration
```json
{
  "extends": [
    "react-app",           // Standard CRA rules
    "react-app/jest"       // Jest/testing-library rules
  ]
}
```

**Rules enforced**:
- React best practices
- Hooks rules
- Accessibility warnings
- Unused variable warnings
- Import organization

### Missing Conventions (To Be Added)
- ❌ **Prettier** - No code formatting config
- ❌ **EditorConfig** - No cross-editor consistency
- ❌ **Husky** - No pre-commit hooks
- ❌ **lint-staged** - No staged file linting
- ❌ **PropTypes** or TypeScript - No type checking
- ❌ **JSDoc** - No inline documentation standards

---

## Common Tasks

### Adding a New Component

```bash
# 1. Create component file
touch frontend/src/components/ComponentName.js

# 2. Create component CSS (if needed)
touch frontend/src/components/ComponentName.css

# 3. Create test file
touch frontend/src/components/ComponentName.test.js
```

**Component template**:
```javascript
import React from 'react';
import './ComponentName.css';

const ComponentName = ({ prop1, prop2 }) => {
  return (
    <div className="container">
      {/* Component JSX */}
    </div>
  );
};

export default ComponentName;
```

### Making API Calls

**Current pattern** (in GigTable.js):
```javascript
useEffect(() => {
  axios.get('http://localhost:5000/gigs')
    .then(response => setGigs(response.data))
    .catch(error => console.error('Error fetching gigs:', error));
}, []);
```

**Best practice** (add loading and error states):
```javascript
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  axios.get('http://localhost:5000/gigs')
    .then(response => {
      setGigs(response.data);
      setError(null);
    })
    .catch(error => {
      console.error('Error fetching gigs:', error);
      setError('Failed to load gigs');
    })
    .finally(() => setLoading(false));
}, []);
```

### Adding Tailwind Styles

```javascript
// Use Flowbite components when possible
import { Button, Modal, Table } from 'flowbite-react';

// Compose utilities for custom styling
<div className="flex flex-col gap-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md">

// Use Tailwind @apply in CSS files for repeated patterns
// In ComponentName.css:
.custom-button {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
}
```

### Modifying the Mock Database

**Edit `frontend/db.json`**:
```json
{
  "gigs": [
    {
      "id": "1",
      "day": "Friday",
      "date": "2024-11-22",
      "artist": "Artist Name",
      "type": "Live Music",
      "venue": "Venue Name",
      "location": "City",
      "added": {
        "user": "username",
        "date": "2024-11-17"
      },
      "interested": ["user1", "user2"]
    }
  ]
}
```

**json-server auto-reloads** on file changes when run with `--watch` flag.

### Running Tests

```bash
# Interactive watch mode
npm test

# Run all tests once
npm test -- --watchAll=false

# With coverage report
npm test -- --coverage --watchAll=false

# Update snapshots
npm test -- -u
```

### Building for Production

```bash
cd frontend
npm run build

# Output in frontend/build/
# Deploy contents of build/ to static hosting
```

### Adding New Dependencies

```bash
cd frontend

# Production dependency
npm install <package-name>

# Development dependency
npm install --save-dev <package-name>
```

**After installing**: Commit updated `package.json` and `package-lock.json`

---

## Known Issues & Technical Debt

### High Priority

#### 1. **Component Size - GigTable.js (452 LOC)**
- **Issue**: Single component handles all logic
- **Impact**: Hard to test, maintain, and reuse
- **Recommendation**: Split into smaller components:
  ```
  GigTable.js (Container)
    ├── GigTableFilters.js (Search, date filters, toggles)
    ├── GigTableColumns.js (Column visibility controls)
    ├── GigTableRow.js (Individual gig row)
    ├── AddGigModal.js (Add event form)
    ├── UserNameModal.js (Username prompt)
    └── GigDetailsModal.js (Gig detail view)
  ```

#### 2. **No Backend**
- **Issue**: json-server is development-only, not production-ready
- **Impact**: Cannot deploy to production
- **Options**:
  - Build Node.js/Express backend
  - Use Firebase/Supabase
  - Integrate with existing API
  - Deploy json-server with json-server-auth

#### 3. **Hardcoded API URL**
- **Issue**: `http://localhost:5000` hardcoded in GigTable.js
- **Impact**: Cannot change API endpoint for production
- **Fix**: Use environment variables
  ```javascript
  // Create frontend/.env.local
  REACT_APP_API_URL=http://localhost:5000

  // In code
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  axios.get(`${API_URL}/gigs`)
  ```

#### 4. **Minimal Test Coverage**
- **Issue**: Only 1 default test exists, GigTable.js untested
- **Impact**: No safety net for refactoring
- **Fix**: Add component tests, integration tests, E2E tests

### Medium Priority

#### 5. **No Error Handling**
- **Issue**: API failures only console.log errors
- **Impact**: Poor UX when network fails
- **Fix**: Add error states, toast notifications, retry logic

#### 6. **No Loading States**
- **Issue**: No visual feedback during API calls
- **Impact**: App feels unresponsive
- **Fix**: Add loading spinners, skeleton screens

#### 7. **No Error Boundaries**
- **Issue**: React errors crash entire app
- **Fix**: Add error boundary component

#### 8. **Default CRA Branding**
- **Issue**: Title still "React App", default icons
- **Files to update**:
  - `public/index.html` - Update title and meta tags
  - `public/manifest.json` - Update name and icons
  - `public/favicon.ico` - Replace with custom icon
  - `public/logo192.png`, `public/logo512.png` - Custom logos

### Low Priority

#### 9. **No Code Formatting**
- **Fix**: Add Prettier config
  ```json
  // .prettierrc
  {
    "singleQuote": true,
    "trailingComma": "es5",
    "tabWidth": 2,
    "semi": true
  }
  ```

#### 10. **No Pre-commit Hooks**
- **Fix**: Add Husky + lint-staged
  ```bash
  npm install --save-dev husky lint-staged
  npx husky install
  ```

#### 11. **No PropTypes or TypeScript**
- **Issue**: No type safety
- **Fix**: Add PropTypes or migrate to TypeScript

---

## AI Assistant Guidelines

### General Principles

#### 1. **Understand Before Changing**
- Always read relevant files before editing
- Use Grep/Glob to find related code
- Check for existing patterns to follow

#### 2. **Maintain Consistency**
- Follow existing code style (see [Code Conventions](#code-conventions))
- Match naming patterns
- Use same libraries/patterns as existing code

#### 3. **Test Your Changes**
- Run `npm start` to verify app still works
- Check browser console for errors
- Test affected features manually
- Write tests for new functionality

#### 4. **Incremental Changes**
- Make small, focused commits
- One feature/fix per commit
- Clear commit messages

### When Working with This Codebase

#### ✅ DO:
- **Read GigTable.js** before making changes to understand data flow
- **Follow React hooks patterns** - Use useState, useEffect correctly
- **Use Tailwind utilities** - Don't write custom CSS unless necessary
- **Use Flowbite components** - Check Flowbite docs before building custom UI
- **Test with mock API** - Start json-server before testing features
- **Check localStorage** - Remember username is persisted locally
- **Respect existing structure** - Keep components in `src/components/`
- **Update this file** - Keep CLAUDE.md current with significant changes

#### ❌ DON'T:
- **Don't add class components** - Use functional components only
- **Don't install Redux/MobX** - Not needed yet (only 1 component)
- **Don't bypass ESLint** - Fix warnings, don't disable rules
- **Don't hardcode values** - Use constants, environment variables
- **Don't ignore errors** - Handle API failures gracefully
- **Don't create new files unnecessarily** - Edit existing when possible
- **Don't break dark mode** - Always add dark: variants to Tailwind classes
- **Don't forget responsive design** - Use Tailwind breakpoints (md:, lg:)

### Common Pitfalls

#### 1. **API URL Issues**
```javascript
// ❌ Wrong - Hardcoded
axios.get('http://localhost:5000/gigs')

// ✅ Better - Use constant at file top
const API_URL = 'http://localhost:5000';
axios.get(`${API_URL}/gigs`)

// ✅ Best - Use environment variable
const API_URL = process.env.REACT_APP_API_URL;
axios.get(`${API_URL}/gigs`)
```

#### 2. **State Management in GigTable.js**
- **Multiple state variables** - Be careful not to create race conditions
- **Derived state** - filteredGigs is computed, not stored in state
- **Effect dependencies** - useEffect runs on mount (empty [])

#### 3. **Tailwind Dark Mode**
```javascript
// ❌ Wrong - Only light mode
<div className="bg-white text-gray-900">

// ✅ Correct - Dark mode support
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
```

#### 4. **Modal State**
- Flowbite modals controlled by `show` prop
- Always provide `onClose` handler
- Reset form state when closing

### File-Specific Guidelines

#### **frontend/src/components/GigTable.js**
- **Purpose**: Main application logic and UI
- **Current state**: Monolithic, needs refactoring
- **When editing**:
  - Be extremely careful - this is the core component
  - Test thoroughly after changes
  - Consider extracting logic into smaller components
  - Watch for state dependencies
  - Check both add gig and filter functionality

#### **frontend/db.json**
- **Purpose**: Mock database for json-server
- **When editing**:
  - Maintain schema consistency (all gigs have same fields)
  - IDs must be unique strings
  - Date format: YYYY-MM-DD
  - `interested` is array of usernames
  - `added` is object: `{ user: string, date: string }`

#### **frontend/src/App.js**
- **Purpose**: Root component, currently minimal
- **When editing**:
  - Keep it simple - just renders GigTable
  - Good place to add global providers (context, theme)
  - Good place to add error boundaries

#### **frontend/tailwind.config.js**
- **Purpose**: Tailwind CSS configuration
- **When editing**:
  - Don't change content paths without testing
  - Dark mode strategy is 'class' (manual toggle)
  - Flowbite plugin must stay for components to work

#### **frontend/package.json**
- **Purpose**: Dependencies and scripts
- **When editing**:
  - Always test after adding/removing dependencies
  - Don't eject from Create React App without discussion
  - Keep versions updated but test compatibility

### Debugging Tips

#### **API Issues**
```bash
# Check if json-server is running
curl http://localhost:5000/gigs

# Restart json-server
npx json-server --watch db.json --port 5000
```

#### **React Errors**
- Check browser console (F12)
- Look for ESLint warnings in terminal
- Check React DevTools for component state

#### **Styling Issues**
- Verify Tailwind classes in browser DevTools
- Check dark mode is applied (look for 'dark' class on html)
- Inspect Flowbite component props

#### **Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear React cache
rm -rf node_modules/.cache
```

### Refactoring Recommendations

When asked to refactor or improve code:

#### **Priority 1: Split GigTable.js**
Extract components in this order:
1. Modals (easiest, low coupling)
2. Filter controls (clear boundaries)
3. Table rows (repeated logic)
4. Column toggles (isolated functionality)

#### **Priority 2: Add Error Handling**
1. Loading states for all async operations
2. Error states with user-friendly messages
3. Retry mechanisms for failed requests
4. Error boundary component

#### **Priority 3: Environment Configuration**
1. Create `.env.local` file
2. Add `REACT_APP_API_URL` variable
3. Update API calls to use environment variable
4. Document in README.md

#### **Priority 4: Testing**
1. Update App.test.js to match actual content
2. Add GigTable.test.js with basic render test
3. Add integration tests for user flows
4. Set up coverage thresholds

### Questions to Ask Users

When a task is ambiguous, clarify:

- **New features**: "Should this integrate with existing filters or be separate?"
- **Styling**: "Should I follow the existing Tailwind/Flowbite pattern or create custom styles?"
- **Data**: "Should this modify db.json or be computed client-side?"
- **Backend**: "Are you planning to replace json-server soon, or should I build for it?"
- **Breaking changes**: "This will change the data structure in db.json. Okay to proceed?"

---

## Additional Resources

### Project Documentation
- **README.md** - Project motivation and purpose
- **This file (CLAUDE.md)** - Technical guide for AI assistants

### External Documentation
- [React Docs](https://react.dev) - React 18 documentation
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Flowbite React](https://flowbite-react.com) - Component library documentation
- [Create React App](https://create-react-app.dev) - Build tooling documentation
- [json-server](https://github.com/typicode/json-server) - Mock API documentation
- [Axios](https://axios-http.com/docs/intro) - HTTP client documentation

### Development Tools
- **VS Code Workspace**: `gig-economy.code-workspace` configured
- **React DevTools**: Browser extension for debugging React
- **Tailwind CSS IntelliSense**: VS Code extension for Tailwind autocomplete

---

## Changelog

### 2025-11-17 - Initial Creation
- Created comprehensive CLAUDE.md based on codebase analysis
- Documented project structure, tech stack, architecture
- Defined code conventions and development workflow
- Identified technical debt and refactoring priorities
- Established AI assistant guidelines

---

## Contributing to This Document

This document should be updated when:
- ✅ Major architectural changes occur
- ✅ New conventions are established
- ✅ Dependencies are added/removed/updated significantly
- ✅ Known issues are resolved
- ✅ Development workflow changes

**How to update**: Edit this file and commit with message format:
```
docs: update CLAUDE.md - [brief description]
```

---

**Version**: 1.0.0
**Maintained by**: Development team + AI assistants
**Last reviewed**: 2025-11-17
