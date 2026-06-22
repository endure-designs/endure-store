/* import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: '../react-builds/current',
    emptyOutDir: true
  },

  base: './'
}) */



import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],

  build: {
    lib: {
      entry: resolve(__dirname, "src/widget.jsx"),
      name: "AnimeGallery",
      formats: ["iife"],
      fileName: () => "anime-gallery.js"
    }
  }
});