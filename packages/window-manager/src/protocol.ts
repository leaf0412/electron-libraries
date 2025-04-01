import { protocol, app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { URL } from 'node:url';
import { Readable } from 'stream';

export const defaultScheme = 'myapp';

// 定义 MIME 类型映射
const mimeTypes = {
  // 文本文件
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.css': 'text/css',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.xml': 'application/xml',
  
  // 图片文件
  '.svg': 'image/svg+xml',
  '.svgz': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  
  // 字体文件
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  
  // 二进制文件
  '.wasm': 'application/wasm',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.tar': 'application/x-tar',
  '.gz': 'application/gzip',
} as const;

type MimeType = typeof mimeTypes[keyof typeof mimeTypes];

interface ProtocolOptions {
  scheme?: string;
  customProtocol?: typeof protocol;
  directory?: {
    isSameDirectory: boolean;
    name: string;
  };
}

interface ProtocolError extends Error {
  code?: string;
  status?: number;
}

class ProtocolHandlerError extends Error implements ProtocolError {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status: number = 500) {
    super(message);
    this.name = 'ProtocolHandlerError';
    this.code = code;
    this.status = status;
  }
}

export const registerProtocol = (
  scheme = defaultScheme,
  customProtocol = protocol
): void => {
  customProtocol.registerSchemesAsPrivileged([
    { 
      scheme, 
      privileges: { 
        secure: true, 
        standard: true, 
        corsEnabled: true,
        supportFetchAPI: true
      } 
    },
  ]);
};

const getMimeType = (filePath: string): MimeType => {
  const extension = path.extname(filePath).toLowerCase();
  return mimeTypes[extension as keyof typeof mimeTypes] || 'application/octet-stream';
};

const normalizePath = (urlPath: string, directory: { isSameDirectory: boolean; name: string }): string => {
  const decodedPath = decodeURI(urlPath)
    .replace(/^\//, '') // 移除前导斜杠
    .replace(/\/$/, ''); // 移除尾随斜杠

  if (directory.isSameDirectory) {
    return decodedPath.includes(directory.name)
      ? path.join(decodedPath, 'index.html')
      : path.join(directory.name, decodedPath);
  }

  return decodedPath;
};

const createFileResponse = async (filePath: string): Promise<Response> => {
  try {
    await fs.promises.access(filePath, fs.constants.R_OK);
    
    const mimeType = getMimeType(filePath);
    const fileStream = fs.createReadStream(filePath);
    const webReadableStream = Readable.toWeb(fileStream) as ReadableStream<Uint8Array>;

    return new Response(webReadableStream, {
      status: 200,
      headers: { 
        'content-type': mimeType,
        'cache-control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new ProtocolHandlerError('File not found', 'ENOENT', 404);
    }
    throw error;
  }
};

export const createProtocol = ({
  scheme = defaultScheme,
  customProtocol = protocol,
  directory = {
    isSameDirectory: false,
    name: 'dist',
  },
}: ProtocolOptions): void => {
  customProtocol.handle(scheme, async request => {
    try {
      const requestUrl = new URL(request.url);
      const urlPath = normalizePath(requestUrl.pathname, directory);
      let basePath;
      if (process.env.NODE_ENV === 'development') {
        // In development mode
        basePath = process.cwd();
      } else {
        // In production mode, use app's path
        basePath = app.getAppPath();
      }
      const filePath = path.resolve(basePath, urlPath);

      return await createFileResponse(filePath);
    } catch (error) {
      console.error('Protocol handler error:', error);
      
      if (error instanceof ProtocolHandlerError) {
        return new Response(error.message, { 
          status: error.status,
          headers: { 'content-type': 'text/plain' }
        });
      }

      return new Response('Internal Server Error', { 
        status: 500,
        headers: { 'content-type': 'text/plain' }
      });
    }
  });
};

export const unregisterProtocol = (
  scheme = defaultScheme,
  customProtocol = protocol
): void => {
  customProtocol.unhandle(scheme);
};

export default createProtocol;
