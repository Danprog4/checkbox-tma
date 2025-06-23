# Checkbox TMA (Telegram Mini App)

A React-based Telegram Mini App for tracking partner booth visits at events and exhibitions. Users can check off partner booths they've visited, with visual feedback and completion tracking.

## Features

- **Interactive Booth Map**: Visual representation of the event layout
- **Partner Tracking**: Check off visited partner booths across different zones
- **Completion Status**: Visual indicators for completed and pending visits
- **Jetton Support**: Special marking for partners offering jetton rewards
- **Responsive Design**: Optimized for mobile devices and Telegram's WebApp interface
- **Modern UI**: Built with Tailwind CSS and custom typography

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS 4** for styling
- **Custom Involve font** for typography

## Getting Started

### Prerequisites

- Node.js (v18 or higher) or Bun
- npm, yarn, or bun package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd checkbox-tma
```

2. Install dependencies:

```bash
bun install
# or
npm install
```

3. Start the development server:

```bash
bun dev
# or
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun lint` - Run ESLint
- `bun preview` - Preview production build

## Project Structure

```
src/
├── components/          # React components
│   ├── PressZoneHeader  # Zone header component
│   └── PartnerItem      # Individual partner booth item
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── assets/              # Static assets (images, fonts)
├── parthers-config.ts   # Partner booth configuration
└── App.tsx             # Main application component
```

## Configuration

Partner booths are configured in `src/parthers-config.ts`. Each partner has:

- `id`: Unique identifier
- `name`: Display name
- `isCompleted`: Initial completion status
- `isJetton`: Whether the partner offers jetton rewards

## Deployment

1. Build the project:

```bash
bun build
```

2. Deploy the `dist` folder to your hosting platform

3. Configure your Telegram Bot to use the deployed URL as a Web App

## Development

### Adding New Partners

Edit `src/parthers-config.ts` to add new partners to `zone1Partners` or `zone2Partners` arrays.

### Styling

The project uses Tailwind CSS 4 with a custom green theme (`#20A261`). The Involve font family is loaded from `/public/fonts/`.

### TypeScript

Full TypeScript support with strict type checking. Types are defined in the `src/types/` directory.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.
