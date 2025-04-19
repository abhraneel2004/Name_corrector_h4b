/**
 * Declaration file to provide types for genkit packages
 */

declare module '@genkit-ai/googleai' {
  export interface GoogleAIOptions {
    apiKey?: string;
    model?: string;
    maxRetries?: number;
    timeout?: number;
    [key: string]: any;
  }
  
  export function googleAI(options?: GoogleAIOptions): any;
}

declare module 'genkit' {
  type FlowFunction<T = any, U = any> = (input: T) => Promise<U>;
  
  export function define<T = any, U = any>(name: string, fn: FlowFunction<T, U>): FlowFunction<T, U>;
  export function createHandler(options?: any): any;
  export function auth(options?: any): any;
  export const client: any;
}

declare module '@genkit-ai/next' {
  import { NextApiRequest, NextApiResponse } from 'next';
  
  interface WithGenkitOptions {
    functions?: any[];
    [key: string]: any;
  }
  
  export function withGenkit(options?: WithGenkitOptions): (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
} 