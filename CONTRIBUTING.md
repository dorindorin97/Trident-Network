# Contributing to Trident Network Explorer

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect differing viewpoints and experiences

## How to Contribute

### Reporting Bugs

1. **Check existing issues** - Search GitHub issues to avoid duplicates
2. **Create detailed report** - Include:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, browser, Node version)
   - Screenshots if applicable
   - Error messages and stack traces

### Suggesting Features

1. **Open an issue** with the `enhancement` label
2. **Describe the feature** - Include:
   - Clear use case
   - Expected behavior
   - Why it's valuable
   - Potential implementation approach

### Submitting Changes

#### 1. Fork and Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/Trident-Network.git
cd Trident-Network
git remote add upstream https://github.com/dorindorin97/Trident-Network.git
```

#### 2. Create Branch

```bash
git checkout -b feature/my-feature
# or
git checkout -b fix/my-bugfix
```

Branch naming:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Adding tests

#### 3. Make Changes

Follow the [Development Guide](./DEVELOPMENT.md) for setup and workflows.

**Code Standards:**
- Use ESLint and Prettier (configs provided)
- Add PropTypes to React components
- Write tests for new features
- Update documentation as needed
- Follow existing code patterns

#### 4. Test Your Changes

```bash
# Backend
cd backend
npm test
npm run lint

# Frontend
cd frontend
npm test
npm run lint
```

#### 5. Commit Changes

Use conventional commit messages:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in validation"
git commit -m "docs: update API documentation"
git commit -m "refactor: improve cache implementation"
git commit -m "test: add tests for validator"
```

**Commit Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style/formatting
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

#### 6. Push and Create PR

```bash
git push origin feature/my-feature
```

Then create a Pull Request on GitHub with:
- Clear title describing the change
- Detailed description of what and why
- Link to related issues
- Screenshots (if UI changes)
- Checklist of completed items

## Pull Request Checklist

Before submitting, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] New features have tests
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] PR description is complete
- [ ] Branch is up to date with main

## Development Guidelines

### Code Style

**JavaScript/React:**
- Use functional components with hooks
- Add PropTypes to all components
- Use async/await over promises
- Keep functions small and focused
- Add comments for complex logic

**File Organization:**
- One component per file
- Group related files together
- Use descriptive file names
- Keep imports organized

### Testing

- Write unit tests for utilities
- Write integration tests for API routes
- Aim for >80% code coverage
- Test edge cases and error conditions
- Mock external dependencies

### Documentation

- Update README.md for user-facing changes
- Update API.md for API changes
- Update DEVELOPMENT.md for dev workflow changes
- Add inline comments for complex code
- Keep CHANGELOG.md updated

### Security

- Never commit secrets or credentials
- Validate and sanitize all inputs
- Follow OWASP best practices
- Report security issues privately (see SECURITY.md)
- Use environment variables for config

## Project Structure

```
backend/
├── routes/          # API endpoints (add new routes here)
├── utils/           # Utilities (cache, logger, validator)
├── tests/           # Test files
└── server.js        # Main server file

frontend/
├── src/
│   ├── components/  # React components (add new components here)
│   ├── locales/     # Translations (update for i18n)
│   └── utils.js     # Frontend utilities
├── tests/           # Test files
└── public/          # Static assets
```

## Adding New Features

### Backend API Endpoint

1. Create route handler in `backend/routes/`
2. Add validation in `backend/utils/validator.js`
3. Register route in `backend/server.js`
4. Write tests in `backend/tests/`
5. Update `API.md` with endpoint documentation
6. Update `CHANGELOG.md`

### Frontend Component

1. Create component in `frontend/src/components/`
2. Add PropTypes validation
3. Add translations in `frontend/src/locales/`
4. Write tests in `frontend/tests/`
5. Import and use in parent component
6. Update `CHANGELOG.md`

## Review Process

1. **Automated Checks** - CI runs tests and linting
2. **Code Review** - Maintainers review code quality
3. **Testing** - Verify changes work as expected
4. **Discussion** - Address feedback and questions
5. **Merge** - Approved PRs merged to main

## Getting Help

- **Documentation**: See README.md, DEVELOPMENT.md, API.md
- **Issues**: Ask questions on GitHub Issues
- **Discussions**: Use GitHub Discussions for general topics

## Recognition

Contributors will be:
- Added to CONTRIBUTORS.md (if we create one)
- Mentioned in release notes
- Credited in commit history

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to ask questions by:
- Opening a GitHub Issue
- Starting a GitHub Discussion
- Reaching out to maintainers

Thank you for contributing to Trident Network Explorer! 🚀
