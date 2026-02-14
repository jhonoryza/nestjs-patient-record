import { Migration } from '@config/database/migration.provider';

export const databasePath = __dirname;

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query(
      `CREATE EXTENSION IF NOT EXISTS pgcrypto;`,
      { transaction },
    );
    await queryInterface.sequelize.query(
      `
      CREATE OR REPLACE FUNCTION public.uuid_v7()
       RETURNS uuid
       LANGUAGE plpgsql
      AS $$
      DECLARE
          v_time timestamp with time zone;
          v_secs bigint;
          v_msec bigint;
          v_usec bigint;
      
          v_timestamp bigint;
          v_timestamp_hex varchar;
      
          v_random bigint;
          v_random_hex varchar;
      
          v_hex varchar;
      BEGIN
          -- Get seconds and micros
          v_time := clock_timestamp();
          v_secs := EXTRACT(EPOCH FROM v_time);
          v_msec := mod(EXTRACT(MILLISECONDS FROM v_time)::numeric, 10^3::numeric);
          v_usec := mod(EXTRACT(MICROSECONDS FROM v_time)::numeric, 10^3::numeric);
      
          -- Generate timestamp hexadecimal (and set version 7)
          v_timestamp := (((v_secs * 10^3) + v_msec)::bigint << 12) | (v_usec << 2);
          v_timestamp_hex := lpad(to_hex(v_timestamp), 16, '0');
          v_timestamp_hex := substr(v_timestamp_hex, 2, 12) || '7' || substr(v_timestamp_hex, 14, 3);
      
          -- Generate the random hexadecimal (and set variant b'10xx')
          v_random := ((random()::numeric * 2^62::numeric)::bigint | (1<<63))::bigint;
          v_random_hex := lpad(to_hex(v_random), 16, '0');
      
          -- Concat timestamp and random hexadecimal
          v_hex := v_timestamp_hex || v_random_hex;
      
          -- Format jadi UUID (8-4-4-4-12)
          v_hex := substring(v_hex from 1 for 8) || '-' ||
                   substring(v_hex from 9 for 4) || '-' ||
                   substring(v_hex from 13 for 4) || '-' ||
                   substring(v_hex from 17 for 4) || '-' ||
                   substring(v_hex from 21);
      
          RETURN v_hex::uuid;
      END $$;
      `,
      { transaction },
    );
  });
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query(
      `
        DROP FUNCTION IF EXISTS uuid_v7();
      `,
      { transaction },
    );
  });
};
