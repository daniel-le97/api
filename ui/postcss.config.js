
export default {
  plugins: {
    tailwindcss: {
      config: import.meta.resolve("./tailwind.config.mjs").replace("file://", ""),
    },
    autoprefixer: {},
  },
};
