import fs from 'fs';
import path from 'path';
import { createTestApp, gql } from 'test-utils';
import { loadOrGenerateConfig } from '../src/config';
import { writeGenerate } from '../src/writeGenerate';
import { getTempDir } from './utils';

const testAppPromise = createTestApp({
  schema: {
    typeDefs: gql`
      type Query {
        hello: String!
      }
    `,
    resolvers: {
      Query: {
        hello() {
          return 'hello world';
        },
      },
    },
  },
});

beforeAll(async () => {
  await testAppPromise;
});

test('generates code and writes existing file', async () => {
  const tempDir = await getTempDir({
    initSchemaFile: "console.log('hello world')",
  });

  try {
    const shouldBeIncluded = '// This should be included';

    const firstStats = await fs.promises.stat(tempDir.schemaPath);

    await writeGenerate(
      (await testAppPromise).getEnveloped().schema,
      tempDir.clientPath,
      {
        preImport: shouldBeIncluded,
      }
    );

    const secondStats = await fs.promises.stat(tempDir.schemaPath);

    expect(secondStats.mtimeMs).toBeGreaterThan(firstStats.mtimeMs);

    // If the code didn't change, it shouldn't write anything
    await writeGenerate(
      (await testAppPromise).getEnveloped().schema,
      tempDir.clientPath,
      {
        preImport: shouldBeIncluded,
      }
    );

    const thirdStats = await fs.promises.stat(tempDir.schemaPath);

    expect(secondStats.mtimeMs).toBe(thirdStats.mtimeMs);

    const generatedContent = await fs.promises.readFile(tempDir.schemaPath, {
      encoding: 'utf-8',
    });

    expect(generatedContent.split('\n')[4]).toStrictEqual(shouldBeIncluded);

    expect(generatedContent).toMatchInlineSnapshot(`
      "/**
       * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
       */

      // This should be included

      export type Maybe<T> = T | null;
      export type InputMaybe<T> = Maybe<T>;
      export type Exact<T extends { [key: string]: unknown }> = {
        [K in keyof T]: T[K];
      };
      export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
        [SubKey in K]?: Maybe<T[SubKey]>;
      };
      export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
        [SubKey in K]: Maybe<T[SubKey]>;
      };
      /** All built-in and custom scalars, mapped to their actual values */
      export interface Scalars {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      }

      export const scalarsEnumsHash: import('gqty').ScalarsEnumsHash = {
        Boolean: true,
        String: true,
      };
      export const generatedSchema = {
        mutation: {},
        query: { __typename: { __type: 'String!' }, hello: { __type: 'String!' } },
        subscription: {},
      } as const;

      export interface Mutation {
        __typename?: 'Mutation';
      }

      export interface Query {
        __typename?: 'Query';
        hello: ScalarsEnums['String'];
      }

      export interface Subscription {
        __typename?: 'Subscription';
      }

      export interface GeneratedSchema {
        query: Query;
        mutation: Mutation;
        subscription: Subscription;
      }

      export type MakeNullable<T> = {
        [K in keyof T]: T[K] | undefined;
      };

      export interface ScalarsEnums extends MakeNullable<Scalars> {}
      "
    `);
  } finally {
    await tempDir.cleanup();
  }
});

test('creates dir, generates code and writes new file', async () => {
  const tempDir = await getTempDir();

  try {
    const targetPath = path.join(
      tempDir.clientPath,
      '/new_path/file-to-generate.ts'
    );

    const shouldBeIncluded = '// This should be included';

    const destinationPath = await writeGenerate(
      (await testAppPromise).getEnveloped().schema,
      targetPath,
      {
        preImport: shouldBeIncluded,
      }
    );

    const generatedContentSchema = await fs.promises.readFile(
      path.resolve(path.dirname(destinationPath), './schema.generated.ts'),
      {
        encoding: 'utf-8',
      }
    );

    expect(generatedContentSchema.split('\n')[4]).toStrictEqual(
      shouldBeIncluded
    );

    expect(generatedContentSchema).toMatchInlineSnapshot(`
      "/**
       * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
       */

      // This should be included

      export type Maybe<T> = T | null;
      export type InputMaybe<T> = Maybe<T>;
      export type Exact<T extends { [key: string]: unknown }> = {
        [K in keyof T]: T[K];
      };
      export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
        [SubKey in K]?: Maybe<T[SubKey]>;
      };
      export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
        [SubKey in K]: Maybe<T[SubKey]>;
      };
      /** All built-in and custom scalars, mapped to their actual values */
      export interface Scalars {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      }

      export const scalarsEnumsHash: import('gqty').ScalarsEnumsHash = {
        Boolean: true,
        String: true,
      };
      export const generatedSchema = {
        mutation: {},
        query: { __typename: { __type: 'String!' }, hello: { __type: 'String!' } },
        subscription: {},
      } as const;

      export interface Mutation {
        __typename?: 'Mutation';
      }

      export interface Query {
        __typename?: 'Query';
        hello: ScalarsEnums['String'];
      }

      export interface Subscription {
        __typename?: 'Subscription';
      }

      export interface GeneratedSchema {
        query: Query;
        mutation: Mutation;
        subscription: Subscription;
      }

      export type MakeNullable<T> = {
        [K in keyof T]: T[K] | undefined;
      };

      export interface ScalarsEnums extends MakeNullable<Scalars> {}
      "
    `);

    const generatedContentClient = await fs.promises.readFile(
      path.resolve(path.dirname(destinationPath), './file-to-generate.ts'),
      {
        encoding: 'utf-8',
      }
    );

    expect(generatedContentClient).toMatchInlineSnapshot(`
      "/**
       * GQty: You can safely modify this file based on your needs.
       */

      import { createReactClient } from '@gqty/react';
      import type { QueryFetcher } from 'gqty';
      import { Cache, GQtyError, createClient } from 'gqty';
      import type { GeneratedSchema } from './schema.generated';
      import { generatedSchema, scalarsEnumsHash } from './schema.generated';

      const queryFetcher: QueryFetcher = async function (
        { query, variables, operationName },
        fetchOptions
      ) {
        // Modify "/api/graphql" if needed
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables,
            operationName,
          }),
          mode: 'cors',
          ...fetchOptions,
        });

        if (response.status >= 400) {
          throw new GQtyError(
            \`GraphQL endpoint responded with HTTP \${response.status}: \${response.statusText}.\`
          );
        }

        const text = await response.text();

        try {
          return JSON.parse(text);
        } catch {
          throw new GQtyError(
            \`Malformed JSON response: \${
              text.length > 50 ? text.slice(0, 50) + '...' : text
            }\`
          );
        }
      };

      const cache = new Cache(
        undefined,
        /**
         * Default cache options immediate expiry with a 5 minutes window of
         * stale-while-revalidate.
         */
        {
          maxAge: 0,
          staleWhileRevalidate: 5 * 60 * 1000,
          normalization: true,
        }
      );

      export const client = createClient<GeneratedSchema>({
        schema: generatedSchema,
        scalars: scalarsEnumsHash,
        cache,
        fetchOptions: {
          fetcher: queryFetcher,
        },
      });

      // Core functions
      export const { resolve, subscribe, schema } = client;

      // Legacy functions
      export const {
        query,
        mutation,
        mutate,
        subscription,
        resolved,
        refetch,
        track,
      } = client;

      export const {
        graphql,
        useQuery,
        usePaginatedQuery,
        useTransactionQuery,
        useLazyQuery,
        useRefetch,
        useMutation,
        useMetaState,
        prepareReactRender,
        useHydrateCache,
        prepareQuery,
      } = createReactClient<GeneratedSchema>(client, {
        defaults: {
          // Enable Suspense, you can override this option at hooks.
          suspense: false,
        },
      });

      export * from './schema.generated';
      "
    `);
  } finally {
    await tempDir.cleanup();
  }
});

test('generates code and writes existing file', async () => {
  const tempDir = await getTempDir({
    clientFileName: './client.js',
  });

  try {
    try {
      const { config } = await loadOrGenerateConfig();
      await writeGenerate(
        (await testAppPromise).getEnveloped().schema,
        tempDir.clientPath,
        config
      );

      throw Error("shouldn't react");
    } catch (err: unknown) {
      expect(err).toEqual(
        Error(
          `You have to specify the ".ts" extension, instead, it received: "${tempDir.clientPath}"`
        )
      );
    }
  } finally {
    await tempDir.cleanup();
  }
});
