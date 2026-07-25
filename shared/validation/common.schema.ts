import { z } from "zod";

/** Every id in this schema is a Postgres UUID primary key. */
export const uuidParamSchema = z.object({ id: z.string().uuid() });

/** Shared page/pageSize bounds — caps against a client requesting an absurdly large batch. */
export const pageSchema = z.number().int().positive().max(100_000);
export const pageSizeSchema = z.number().int().positive().max(200);
