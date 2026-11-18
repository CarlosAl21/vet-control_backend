import { ValueTransformer } from 'typeorm';

/**
 * Keeps a `date` column on the calendar day the client sent. TypeORM writes a JS Date with
 * its local getters, so a UTC-midnight Date ("2024-01-15") would be stored as the previous
 * day on a server behind UTC. A Date is written as its UTC day instead; strings pass through.
 */
export const dateOnlyTransformer: ValueTransformer = {
  to: (value?: Date | string | null) =>
    value instanceof Date && !isNaN(value.getTime()) ? value.toISOString().slice(0, 10) : value,
  from: (value?: string | null) => value,
};
