import { PrimitiveServiceResponse, ServiceResponse } from "./types";
import { dataToString, getErrorMessage, truncateString } from "./formatters";

/**
 * Returns a primitive service error response and logs the error.
 *
 * @param error - The error encountered.
 * @param log - Optional log message.
 * @returns {PrimitiveServiceResponse} The error response object.
 */
export const getPrimitiveServiceErrorResponse = (
  error: any,
  log?: string
): PrimitiveServiceResponse => {
  console.error(log || "Internal Server Error", error);
  return {
    success: false,
    message: getErrorMessage(error),
  };
};

/**
 * Returns a successful service response with logging.
 *
 * @param data - The data to include in the service response.
 * @param log - Optional log message.
 * @returns {ServiceResponse<T>} The successful service response object.
 */
export const getSuccessfulServiceResponse = <T>({
  data,
  log,
  message,
}: {
  data?: T;
  log?: string;
  message?: string;
}): ServiceResponse<T> => {
  console.info(
    `Service response success, 
   Log: ${log || message || ""} \n
   Data: `,
    truncateString(dataToString(data), 250, 2)
  );

  return { data, success: true, message };
};

/**
 * Executes a database query using db.run with logging.
 *
 * @param db - The database instance.
 * @param query - The SQL query to execute.
 * @param params - The parameters for the SQL query.
 * @returns {Promise<T>} A promise that resolves to the context (this) of the query.
 */
export const runDbQuery = <T = void>(
  db: any,
  query: string,
  params: any[] = []
): Promise<T> => {
  console.info(`Running query: ${query}`);

  return new Promise<T>((resolve, reject) => {
    db.run(query, params, function (this: any, err: Error) {
      if (err) {
        console.error(`Error running query "${query}":`, err);
        reject(err);
      } else {
        console.info(`Query succeeded...`);
        resolve(this as T);
      }
    });
  });
};

/**
 * Executes a database query using db.all with logging.
 *
 * @param db - The database instance.
 * @param query - The SQL query to execute.
 * @param params - The parameters for the SQL query.
 * @returns {Promise<T>} A promise that resolves to the rows returned by the query.
 */
export function runDbAll<T>(db: any, query: string, params: any[] = []): Promise<T> {
  console.info(`Running query: ${query}`);
  return new Promise((resolve, reject) => {
    db.all(query, params, (err: Error, rows: T) => {
      if (err) {
        console.error(`Error executing query "${query}":`, err);
        return reject(err);
      }
      console.info(`Query succeeded...`);
      resolve(rows);
    });
  });
}

export function runDbRollback(db: any): Promise<void> {
  return new Promise((resolve, reject) => db.run("ROLLBACK", () => resolve()));
}

export function runDbStartTransactions(db: any): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run("BEGIN TRANSACTION", (err: Error) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
export function runDbCommitTransactions(db: any): Promise<void> {
  return new Promise((resolve, reject) => db.run("COMMIT", () => resolve()));
}
