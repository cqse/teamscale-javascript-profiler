import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

import IstanbulPlugin from 'vite-plugin-istanbul';

module.exports = {
  open: true,
  port: 3000,
  plugins: [
    reactRefresh(),
    IstanbulPlugin({
      include: 'src/*',
      exclude: [/node_modules/, 'test/'],
      extension: [ '.js', '.ts' ],
    }),
  ],
};
