import { protocol, app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { URL } from 'node:url';
import { net } from 'electron';
import { isDevelopment } from './constants';

export const defaultScheme = app.getName();

interface ProtocolOptions {
  scheme?: string;
  directory?: {
    isSameDirectory: boolean;
    name: string;
  };
}

export const registerProtocol = (scheme = defaultScheme): void => {
  protocol.registerSchemesAsPrivileged([
    {
      scheme,
      privileges: {
        secure: true,
        standard: true,
        corsEnabled: true,
        supportFetchAPI: true,
      },
    },
  ]);
};

const normalizePath = (
  urlPath: string,
  directory: { isSameDirectory: boolean; name: string }
): string => {
  const decodedPath = decodeURI(urlPath).replace(/^\//, '').replace(/\/$/, '');

  if (directory.isSameDirectory) {
    if (decodedPath.startsWith(directory.name)) {
      if (decodedPath === directory.name) {
        const result = path.join(decodedPath, 'index.html');
        return result;
      }
      return decodedPath;
    }
    if (decodedPath === '') {
      const result = path.join(directory.name, 'index.html');
      return result;
    }
    const result = path.join(directory.name, decodedPath);
    return result;
  }

  return decodedPath;
};

export const createProtocol = ({
  scheme = defaultScheme,
  directory = {
    isSameDirectory: false,
    name: 'dist',
  },
}: ProtocolOptions): void => {
  protocol.handle(scheme, async request => {
    try {
      const requestUrl = new URL(request.url);
      const urlPath = normalizePath(requestUrl.pathname, directory);
      let basePath;
      if (isDevelopment) {
        basePath = process.cwd();
      } else {
        basePath = app.getAppPath();
      }
      const filePath = path.resolve(basePath, urlPath);
      await fs.promises.access(filePath, fs.constants.R_OK);
      return net.fetch(`file://${filePath}`);
    } catch (error) {
      return new Response(null, { status: 404 });
    }
  });
};

export const unregisterProtocol = (scheme = defaultScheme): void => {
  protocol.unhandle(scheme);
};

