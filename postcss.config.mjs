/**
 * PostCSS Configuration
 *
 * Tailwind CSS v4 is wired into the build through the `@tailwindcss/postcss`
 * plugin. This replaces the old `@tailwindcss/vite` plugin now that the project
 * runs on Next.js.
 */
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
