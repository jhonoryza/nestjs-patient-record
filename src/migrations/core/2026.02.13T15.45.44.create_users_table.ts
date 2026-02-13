import { Migration } from '@config/database/migration.provider';
import { DataType, Sequelize } from 'sequelize-typescript';

export const databasePath = __dirname;

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'users',
      {
        id: {
          type: DataType.UUID,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: DataType.STRING(100),
          allowNull: false,
        },
        email: {
          type: DataType.STRING(150),
          unique: true,
          allowNull: false,
        },
        password: {
          type: DataType.TEXT,
          allowNull: false,
        },
        role: {
          type: DataType.STRING(20),
          allowNull: false,
        },
        created_at: {
          type: DataType.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('now()'),
        },
        updated_at: {
          type: DataType.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('now()'),
        },
        deleted_at: DataType.DATE,
      },
      {
        transaction,
      },
    );
  });
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('users', {
      transaction,
    });
  });
};
