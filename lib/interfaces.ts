
interface DocInfo {
  description: string;
  version: string;
  title: string;
  contact: {
    email: string;
  }
}

interface Tag {
  name: string;
  description: string;
}

interface DocumenterOptions {
  secure?: boolean;
  basePath?: string;
  info?: DocInfo;
  tags?: Tag[];
}

interface Response {
  description: string;
  schema: any;
}

interface Responses {
  [key: string]: Response;
}

interface Path {
  tags?: string[];
  summary?: string;
  description?: string;
  parameters?: object[];
  responses?: Responses;
}

interface Paths {
  [key: string]: {
    [key: string]: Path;
  };
}

interface FullState {
  swaggerOptions: object;
  schemes: string[];
  swagger: string;
  paths: Paths;
  definitions: object;
}
interface ParamHash {
  [key: string]: () => {
    [key: string]: any;
  };
}

interface InputOptions {
  param?: {
    [key: string]: Function;
  };
  query?: {
    [key: string]: Function;
  };
}

interface ModuleOptions {
  express?;
  options?: DocumenterOptions;
  swagger?: any;
  inputs?: InputOptions;
}
