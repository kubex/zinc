import type {HTMLTemplateResult} from "lit";

/**
 * Providers are what the data select component uses to get data. They are
 * responsible for defining the data.
 */
export interface LocalDataProvider<T> {
  getName: string;
  getData: T[];
}

export interface RemoteDataProvider<T> {
  getName: string;
  getData: () => Promise<T[]>;
}

export interface DataProviderOption {
  key: string;
  value: string;
  prefix?: string | HTMLTemplateResult;
}

export const emptyDataProvider: LocalDataProvider<DataProviderOption> = {
  getName: 'Empty',
  getData: []
}


export * from './country-data-provider';
export * from './currency-data-provider';
export * from './color-data-provider';
