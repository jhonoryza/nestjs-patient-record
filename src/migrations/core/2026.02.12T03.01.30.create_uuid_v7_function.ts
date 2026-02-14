import { Migration } from '@config/database/migration.provider';

export const databasePath = __dirname;

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query(
      `
        CREATE EXTENSION IF NOT EXISTS pgcrypto;

        CREATE OR REPLACE FUNCTION uuid_v7()
        RETURNS uuid
        AS $$
        DECLARE
            unix_ts_ms bigint;
            rand_bytes bytea;
            result bytea;
        BEGIN
            -- timestamp dalam milliseconds
            unix_ts_ms := floor(extract(epoch FROM clock_timestamp()) * 1000);

            -- 10 random bytes (80 bit)
            rand_bytes := gen_random_bytes(10);

            -- gabungkan timestamp (6 byte) + random
            result :=
                set_byte(set_byte(set_byte(set_byte(set_byte(set_byte(
                    '\\x00000000000000000000000000000000'::bytea,
                    0, (unix_ts_ms >> 40) & 255),
                    1, (unix_ts_ms >> 32) & 255),
                    2, (unix_ts_ms >> 24) & 255),
                    3, (unix_ts_ms >> 16) & 255),
                    4, (unix_ts_ms >> 8) & 255),
                    5, unix_ts_ms & 255);

            -- append random bytes
            result := overlay(result placing rand_bytes from 7);

            -- set version (7)
            result := set_byte(result, 6,
                (get_byte(result, 6) & 15) | (7 << 4)
            );

            -- set variant (RFC4122)
            result := set_byte(result, 8,
                (get_byte(result, 8) & 63) | 128
            );

            RETURN encode(result, 'hex')::uuid;
        END;
        $$ LANGUAGE plpgsql;
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
