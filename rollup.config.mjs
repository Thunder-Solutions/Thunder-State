import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'esm/thunderState.min.mjs',
      format: 'esm',
      compact: true,
      sourcemap: true,
    },
    {
      file: 'umd/thunderState.min.js',
      format: 'umd',
      name: 'ThunderState',
      compact: true,
      sourcemap: true,
    },
    {
      file: 'dist/thunderState.min.js',
      format: 'cjs',
      compact: true,
      sourcemap: true,
    },
  ],
  plugins: [
    typescript({
      sourceMap: true,
      inlineSources: true,
      declarationDir: 'types',
      exclude: ['test', '**/*.test.ts', 'node_modules'],
    }),
  ],
}
