import * as express from 'express'

export interface DocInfo {
  description: string;
  version: string;
  title: string;
  contact: {
    email: string;
  }
}

export interface Tag {
  name: string;
  description: string;
}

export interface DocumenterOptions {
  secure?: boolean;
  basePath?: string;
  info?: DocInfo;
  tags?: Tag[];
}

export interface Response {
  description?: string;
  schema?: any;
}

export interface Responses {
  [key: string]: Response;
}

export interface Route {
  tags?: string[];
  summary?: string;
  description?: string;
  parameters?: object[];
  responses?: Responses;
}

export interface RouteCache {
  [key: string]: {
    [key: string]: Route;
  };
}

export interface FullState {
  swaggerOptions: object;
  schemes: string[];
  swagger: string;
  basePath: string;
  paths: RouteCache;
  definitions: object;
}
export interface ParamHash {
  [key: string]: () => {
    [key: string]: any;
  };
}

export interface InputOptions {
  param?: {
    [key: string]: Function;
  };
  query?: {
    [key: string]: Function;
  };
}

export interface ModuleOptions {
  express?;
  options?: DocumenterOptions;
  swagger?: any;
  inputs?: InputOptions;
}

export interface RouteInput {
  (key: string, target: object | Function): RouteSetup;
}

export interface ResponseInput {
  (key: number | string, target: object | Function): RouteSetup;
}

export interface DocumentHandler {
  (options?: Route): RouteSetup;
  documenter: any;
}

export interface Router extends express.Router {
  document: DocumentHandler;
}

export interface RouteSetup {
  route: Route;
  router: Router;
  // documenter: object;
  param: RouteInput;
  query: RouteInput;
  response: ResponseInput;
}
