# Contributing to EcoTrack AI

Thank you for your interest in contributing to **EcoTrack AI**! We welcome contributions from developers, designers, and sustainability enthusiasts.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. **Fork the Repository**: Create a personal fork on GitHub.
2. **Clone Locally**: Clone your fork to your development machine:
   ```bash
   git clone https://github.com/YOUR-USERNAME/EcoTrack.git
   cd EcoTrack
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/amazing-improvement
   ```

## Development guidelines

- **TypeScript**: All components and helpers must be written in TypeScript with proper type safety.
- **Styling**: Use Tailwind CSS for interface styling, matching the dark slate and emerald modern aesthetic.
- **Modularization**: Keep components focused. If a component exceeds 250-300 lines of code, split it into smaller sub-components.
- **JSDoc**: Add JSDoc comments to all exported modules, handlers, and calculation functions.
- **Linting**: Ensure `npm run lint` passes with zero warnings or errors.
- **Testing**: Add or expand tests in `test.ts` for any new utility calculations or endpoints. Run `npm test` to verify.

## Submitting Pull Requests

1. Commit your changes with clear, descriptive commit messages.
2. Push your feature branch to your fork.
3. Open a Pull Request against the `main` branch of the original repository.
4. Ensure the GitHub Actions CI workflow successfully builds and passes all tests.
