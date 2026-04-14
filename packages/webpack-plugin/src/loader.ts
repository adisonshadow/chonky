import { chonkyWebpackLoader } from './index';

interface LoaderContext {
  resourcePath: string;
  getOptions: () => { projectRoot: string; mode: string };
  async: () => (err: Error | null, code?: string, map?: unknown) => void;
}

module.exports = function chonkyLoader(this: LoaderContext, source: string) {
  const callback = this.async();
  const options = this.getOptions();
  const filename = this.resourcePath;

  try {
    const result = chonkyWebpackLoader(source, filename, options);
    if (result) {
      callback(null, result.code, result.map);
    } else {
      callback(null, source);
    }
  } catch (err) {
    callback(err instanceof Error ? err : new Error(String(err)));
  }
};
