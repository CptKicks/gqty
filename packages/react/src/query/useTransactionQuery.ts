import {
  useDocumentVisibility,
  useIntervalEffect,
  useUpdateEffect,
} from '@react-hookz/web';
import type { BaseGeneratedSchema, GQtyError, RetryOptions } from 'gqty';
import {
  LegacyFetchPolicy,
  OnErrorHandler,
  translateFetchPolicy,
} from '../common';
import type { ReactClientOptionsWithDefaults } from '../utils';
import type { UseQuery } from './useQuery';

export interface UseTransactionQueryState<TData> {
  data?: TData;
  error?: GQtyError;
  isLoading: boolean;
  isCalled: boolean;
}

export type UseTransactionQueryOptions<TData, TVariables> = {
  cachePolicy?: RequestCache;
  fetchPolicy?: LegacyFetchPolicy;
  skip?: boolean;
  /**
   * Frequency in milliseconds of polling/refetch of the query
   */
  pollInterval?: number;
  /**
   * If it should do polling while on background
   *
   * @default false
   */
  pollInBackground?: boolean;
  notifyOnNetworkStatusChange?: boolean;
  variables?: TVariables;
  onCompleted?: (data: TData) => void;
  onError?: OnErrorHandler;
  retry?: RetryOptions;
  suspense?: boolean;
  operationName?: string;
};

export interface UseTransactionQuery<TSchema extends BaseGeneratedSchema> {
  <TData, TVariables = undefined>(
    fn: (query: TSchema['query'], variables?: TVariables) => TData,
    options?: UseTransactionQueryOptions<TData, TVariables>
  ): UseTransactionQueryState<TData>;
}

export function createUseTransactionQuery<TSchema extends BaseGeneratedSchema>(
  useQuery: UseQuery<TSchema>,
  {
    defaults: {
      transactionFetchPolicy: defaultFetchPolicy,
      retry: defaultRetry,
      transactionQuerySuspense: defaultSuspense,
    },
  }: ReactClientOptionsWithDefaults
) {
  const useTransactionQuery: UseTransactionQuery<TSchema> = (
    fn,
    {
      fetchPolicy = defaultFetchPolicy,
      cachePolicy = translateFetchPolicy(fetchPolicy),
      notifyOnNetworkStatusChange = true,
      onCompleted,
      onError,
      operationName,
      pollInBackground = false,
      pollInterval,
      retry = defaultRetry,
      skip = false,
      suspense = defaultSuspense,
      variables,
    } = {}
  ) => {
    const query = useQuery({
      cachePolicy,
      notifyOnNetworkStatusChange,
      operationName,
      prepare: ({ query }) => (skip ? undefined : fn(query, variables)),
      retry,
      suspense,
    });

    useUpdateEffect(() => {
      const {
        $state: { isLoading, error },
      } = query;

      if (!isLoading && !error) {
        onCompleted?.(fn(query, variables));
      }
    }, [query.$state.isLoading]);

    useUpdateEffect(() => {
      if (query.$state.error) {
        onError?.(query.$state.error);
      }
    }, [query.$state.error]);

    const visible = useDocumentVisibility();

    useIntervalEffect(() => {
      if (skip || query.$state.isLoading || (!visible && !pollInBackground))
        return;

      query.$refetch();
    }, pollInterval);

    return skip
      ? {
          isCalled: false,
          isLoading: false,
        }
      : {
          data: fn(query, variables),
          isCalled: true,
          isLoading: query.$state.isLoading,
          error: query.$state.error,
        };
  };

  return useTransactionQuery;
}
