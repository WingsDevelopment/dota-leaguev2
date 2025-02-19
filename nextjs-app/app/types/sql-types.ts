declare module "sql.js" {
  export interface Database {
    exec(sql: string): { columns: string[]; values: any[][] }[];
    close(): void;
    // Add other methods you need from the Database instance
  }

  export interface SqlJsStatic {
    Database(data?: Uint8Array | number[]): Database;
    // Add any additional static properties or methods if needed
  }

  export default function initSqlJs(options?: {
    locateFile?: (file: string) => string;
  }): Promise<SqlJsStatic>;
}
