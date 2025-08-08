# Contributing to copy-paste.space

Thank you for your interest in contributing to **copy-paste.space**! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Project Overview](#project-overview)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Code Review Process](#code-review-process)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)
- [Questions and Support](#questions-and-support)

## Project Overview

**copy-paste.space** is a minimalistic web tool that enables instant cross-device text sharing through a clean, browser-based interface. The project consists of:

- **Frontend**: React with TypeScript, Vite, TailwindCSS
- **Backend**: Node.js with Express, TypeScript, MongoDB
- **Deployment**: Vercel (frontend), Railway (backend)

## Getting Started

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** or **yarn**
- **Git**
- **MongoDB** (for local development)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/copy-paste.space.git
   cd copy-paste.space
   ```
3. Add the original repository as upstream:
   ```bash
   git remote add upstream https://github.com/rshdhere/copy-paste.space.git
   ```

## Development Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables in your `.env` file:
   ```
   PORT=8080
   MONGODB_URI=your_mongodb_connection_string
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The backend will be available at `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

### Running Both Services

You can run both services simultaneously by opening two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

## Project Structure

```
online-clipboard/
├── backend/                 # Backend server (Node.js + Express)
│   ├── src/
│   │   ├── database/       # Database connection and models
│   │   ├── middleware/     # Express middleware (rate limiting, IP blocking)
│   │   ├── routes/         # API route handlers
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utility/        # Utility functions
│   │   └── server.ts       # Main server file
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # Frontend application (React + TypeScript)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux components
│   │   ├── utils/          # Utility functions
│   │   ├── assets/         # Static assets
│   │   └── main.tsx        # Application entry point
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid using `any` type unless absolutely necessary
- Use strict TypeScript configuration

### Code Style

- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Use **semicolons** at the end of statements
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes and interfaces
- Use **UPPER_SNAKE_CASE** for constants

### React Components

- Use functional components with hooks
- Use TypeScript interfaces for props
- Keep components small and focused
- Use meaningful component and prop names

### Backend Code

- Use async/await for asynchronous operations
- Implement proper error handling
- Use middleware for cross-cutting concerns
- Follow RESTful API conventions

### File Naming

- Use **kebab-case** for file names
- Use **PascalCase** for component files
- Use descriptive names that indicate purpose

## Making Changes

### Creating a Feature Branch

1. Ensure you're on the main branch and it's up to date:
   ```bash
   git checkout main
   git pull upstream main
   ```

2. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

   Branch naming conventions:
   - `feature/descriptive-name` for new features
   - `fix/issue-description` for bug fixes
   - `docs/update-description` for documentation changes
   - `refactor/component-name` for code refactoring

### Making Your Changes

1. Write your code following the coding standards
2. Test your changes locally
3. Commit your changes with descriptive messages

### Commit Messages

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(frontend): add dark mode toggle`
- `fix(backend): resolve rate limiting issue`
- `docs: update contributing guidelines`
- `refactor(components): simplify Button component`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Testing

### Frontend Testing

Run the linter to check for code quality issues:
```bash
cd frontend
npm run lint
```

### Backend Testing

Currently, the project doesn't have automated tests, but you should:

1. Test your API endpoints manually
2. Verify rate limiting works correctly
3. Test database operations
4. Check error handling

### Manual Testing Checklist

- [ ] Test the application in different browsers
- [ ] Test on mobile devices
- [ ] Verify text sharing works across devices
- [ ] Test rate limiting functionality
- [ ] Check error handling for invalid inputs
- [ ] Verify CORS settings work correctly

## Submitting Changes

### Before Submitting

1. Ensure your code follows the coding standards
2. Test your changes thoroughly
3. Update documentation if necessary
4. Make sure all commits are properly formatted

### Creating a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Go to your fork on GitHub and click "New Pull Request"

3. Fill out the pull request template:
   - **Title**: Clear, descriptive title
   - **Description**: Explain what changes you made and why
   - **Type of Change**: Select the appropriate type
   - **Testing**: Describe how you tested your changes

4. Submit the pull request

### Pull Request Guidelines

- Keep pull requests focused on a single feature or fix
- Provide clear descriptions of changes
- Include screenshots for UI changes
- Reference any related issues
- Respond to review comments promptly

## Code Review Process

### Review Checklist

Reviewers will check for:

- [ ] Code follows project standards
- [ ] Changes are properly tested
- [ ] Documentation is updated if needed
- [ ] No security vulnerabilities introduced
- [ ] Performance considerations addressed
- [ ] Error handling is appropriate

### Review Timeline

- Initial review: Within 2-3 days
- Follow-up reviews: Within 1-2 days of updates
- Final approval: When all concerns are addressed

## Reporting Issues

### Before Reporting

1. Check if the issue has already been reported
2. Try to reproduce the issue on the latest version
3. Check if it's a configuration or environment issue

### Issue Template

When reporting an issue, please include:

- **Title**: Clear, descriptive title
- **Description**: Detailed description of the problem
- **Steps to Reproduce**: Step-by-step instructions
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Browser, OS, device information
- **Screenshots**: If applicable

## Feature Requests

### Before Requesting

1. Check if the feature has already been requested
2. Consider if it aligns with the project's goals
3. Think about the implementation complexity

### Feature Request Template

- **Title**: Clear, descriptive title
- **Description**: Detailed description of the feature
- **Use Case**: Why this feature is needed
- **Proposed Implementation**: How it could be implemented
- **Alternatives Considered**: Other approaches you've considered

## Questions and Support

### Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Code Review**: Ask questions in pull request comments

### Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the project's code of conduct

## Additional Resources

- [Project README](README.md)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

---

Thank you for contributing to copy-paste.space! Your contributions help make this tool better for everyone. 
