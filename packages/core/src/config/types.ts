import { SecureServerOptions } from 'node:http2';
import { DevServer } from '../index.js';

import type cors from '@koa/cors';
import type { OutgoingHttpHeaders } from 'http';
import type { Logger } from '../utils/index.js';
import type { ProxiesOptions } from '../server/middlewares/proxy.js';
import type { JsPlugin } from '../plugin/type.js';
import type { RustPlugin } from '../plugin/rust/index.js';
import type { Config } from '../../binding/index.js';

export interface UserServerConfig {
  headers?: OutgoingHttpHeaders | undefined;
  port?: number;
  https?: SecureServerOptions;
  protocol?: 'http' | 'https';
  hostname?: string;
  // http2?: boolean;
  hmr?: boolean | UserHmrConfig;
  proxy?: Record<string, ProxiesOptions>;
  strictPort?: boolean;
  open?: boolean;
  host?: string | boolean;
  cors?: boolean | cors.Options;
  // whether to serve static assets in spa mode, default to true
  spa?: boolean;
  middlewares?: DevServerMiddleware[];
  writeToDisk?: boolean;
}

export type NormalizedServerConfig = Required<
  Omit<UserServerConfig, 'hmr'> & {
    hmr: Required<UserHmrConfig>;
  }
>;

export interface ConfigEnv {
  command: 'build' | 'serve';
  mode: string;
}

export type ResolveConfigType = {
  config?: UserConfig;
  normalizedConfig?: Config;
};

export interface UserHmrConfig {
  /** ignored watch paths of the module graph, entries of this option should be a string regexp  */
  ignores?: string[];
  host?: string | boolean;
  port?: number;
  path?: string;
  watchOptions?: {
    // this options only works in windows
    awaitWriteFinish?: number;
  };
}

type InternalConfig = Config['config'] extends undefined
  ? object
  : Required<Config>['config'];

type AvailableUserConfigKeys = Exclude<
  keyof InternalConfig,
  'configFilePath' | 'env' | 'envPrefix' | 'envFiles' | 'coreLibPath' | 'root'
>;

export interface UserConfig {
  /** current root of this project, default to current working directory */
  root?: string;
  clearScreen?: boolean;
  envDir?: string;
  envPrefix?: string | string[];
  publicDir?: string;
  /** js plugin(which is a javascript object) and rust plugin(which is string refer to a .farm file or a package) */
  plugins?: (RustPlugin | JsPlugin | JsPlugin[])[];
  /** vite plugins */
  vitePlugins?: (object | (() => { vitePlugin: any; filters: string[] }))[];
  /** config related to compilation */
  compilation?: Pick<InternalConfig, AvailableUserConfigKeys>;
  /** config related to dev server */
  server?: UserServerConfig;
  /** Files under this dir will always be treated as static assets. serve it in dev, and copy it to output.path when build */
}

export interface ResolvedUserConfig extends UserConfig {
  inlineConfig?: FarmCLIOptions;
  configPath?: string;
  isBuild?: boolean;
  command?: 'serve' | 'build';
  resolveConfigPath?: string;
  // TODO set this field for persistent cache
  configFileDependencies?: string[];
}

export interface GlobalFarmCLIOptions {
  '--'?: string[];
  c?: boolean | string;
  config?: string;
  m?: string;
  mode?: 'development' | 'production';
}

export interface FarmCLIServerOptions {
  port?: number;
  open?: boolean;
  https?: SecureServerOptions;
  hmr?: boolean;
  host?: boolean | string;
  strictPort?: boolean;
}

export interface FarmCLIBuildOptions {
  outDir?: string;
  sourcemap?: boolean;
  minify?: boolean;
}

export interface FarmCLIPreviewOptions {
  open?: boolean;
  https?: SecureServerOptions;
  port?: number;
}

export interface FarmCLIOptions
  extends FarmCLIServerOptions,
    FarmCLIBuildOptions,
    FarmCLIPreviewOptions {
  logger?: Logger;
  config?: string;
  configPath?: string;
  mode?: string;
  clearScreen?: boolean;
}

export type DevServerMiddleware = (context: DevServer) => void;
