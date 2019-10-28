import * as Github from '@octokit/rest';
import * as config from 'config';
import * as os from 'os';

export interface WhiteList {
  owner: string;
  repo: string;
  // refs accepts branchs, commits and tags. Can be '*' for any
  refs: string | string[];
}

export const PORT =
  config.get('port') as number;
export const BUILDER_CONFIG_NAME =
  config.get('builder-config-name') as string;
export const CHECK_JOBPOOL_RESULTS_ONLY =
  config.get('check-jobpool-results-only') as boolean;
export const KEEP_LEGACY_RESULTS =
  config.get('keep-legacy-results') as boolean;
export const OUTPUT_DIR =
  config.get('output-dir') as string;
export const STATIC_DIR =
  config.get('static-dir') as string;
export const TEMP_DIR =
  (config.get('temp-dir') as string)
  .replace('%SYSTEM_TEMP%', os.tmpdir());
export const WORKSPACE =
  config.get('workspace') as string;
export const REPO_WHITELIST_ENABLED =
  config.get('whitelist-enabled');

const REPO_WHITELIST: WhiteList[] = config.get('whitelist');
export function inWhitelist (owner: string, repo: string, coderef = '') {
  for (const i in REPO_WHITELIST) {
    if (REPO_WHITELIST.hasOwnProperty(i)) {
      const item = REPO_WHITELIST[i];
      if (owner === item.owner && repo === item.repo) {
        let acceptRefs = item.refs;
        if (acceptRefs === '*') {
          return true;
        } else {
          acceptRefs = typeof(acceptRefs) === 'string' ? [ acceptRefs ] : acceptRefs;
          return acceptRefs.includes(coderef);
        }
      }
    }
  }
  return false;
}

export const GITHUB_AUTH_TYPE: 'none' | 'basic' | 'token' =
  config.has('github-auth-type')
  ? config.get('github-auth-type') as any
  : 'none';
const GITHUB_LOGGER = {
  debug: (message: string, info?: object) => {
    console.log('[github.debug] ' + message);
  },
  info: (message: string, info?: object) => {
    console.log('[github.info] ' + message);
  },
  warn: (message: string, info?: object) => {
    console.log('[github.warn] ' + message);
  },
  error: (message: string, info?: object) => {
    console.log('[github.error] ' + message);
  },
};
export function AuthGithub () {
  let auth;
  switch (GITHUB_AUTH_TYPE) {
    case 'basic': {
      console.log('Login github with username & password');
      auth = {
        username: config.get('github-auth-username'),
        password: config.get('github-auth-password'),
        on2fa: async () => {
          throw new Error('2FA required, extension-builder dont support this yet.');
        },
      };
      break;
    }
    case 'token': {
      console.log('Login github with token');
      auth = `token ${config.get('github-auth-token')}`;
      break;
    }
    default: {
      console.log('Didn\'t find a method login onto github');
    }
  }
  return new Github({
    auth: auth as any,
    log: GITHUB_LOGGER,
  });
}