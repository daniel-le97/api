// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from "@tailwindcss/vite";

import preact from '@astrojs/preact';

import sitemap from "@astrojs/sitemap";

import compress from "astro-compress";
import { VitePWA } from "vite-plugin-pwa"

import { seoConfig, manifest } from './seo';

// https://astro.build/config
export default defineConfig({
  site: seoConfig.baseURL,
  vite:{
    plugins: [tailwindcss(),
      VitePWA({
				registerType: "autoUpdate",
				manifest,
				workbox: {
				  globDirectory: 'dist',
				  globPatterns: [
				    '**/*.{js,css,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,eot,ico}',
				  ],
				  // Don't fallback on document based (e.g. `/some-page`) requests
				  // This removes an errant console.log message from showing up.
				  navigateFallback: null,
				},
			})
    ],
  },
  integrations: [preact(), sitemap(), compress()],
  env:{
    schema:{
      POCKETBASE_URL: envField.string({context: "client", access: "public", default: "http://localhost:8090"})
    }
  }
});