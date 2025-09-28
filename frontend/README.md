# CrimeGrid.ai - React Frontend

This directory contains the React-based frontend for the [CrimeGrid.ai](../../README.md) project. It uses Vite as a build tool and the Google Maps Platform for visualization.

The primary goal of this component is to provide a modern, interactive user interface for visualizing and filtering crime data, replacing the legacy `mapanimation.js` implementation.

## Getting Started

### Prerequisites

- Node.js (v20.19+ or v22.12+)
- A valid Google Maps API Key.

### Installation & Setup

1.  From this (`/frontend`) directory, create a `.env` file for your API key:
    ```bash
    cp .env.example .env
    ```
2.  Add your Google Maps API key to the newly created `.env` file.
3.  Install the dependencies:
    ```bash
    npm install
    ```
4.  Start the Vite development server:
    ```bash
    npm run dev
    ```

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
