import { Migration } from '@config/database/migration.provider';
import { DataType, Sequelize } from 'sequelize-typescript';

export const databasePath = __dirname;

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'patients',
      {
        id: {
          type: DataType.UUID,
          primaryKey: true,
          allowNull: false,
        },
        created_at: {
          type: DataType.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('now()'),
        },
        created_by: {
          type: DataType.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'RESTRICT',
        },
        status: {
          type: DataType.STRING(20),
          allowNull: false,
          defaultValue: 'active',
        },
        trashed_at: DataType.DATE,
      },
      {
        transaction,
      },
    );

    await queryInterface.sequelize.query(
      `
          ALTER TABLE patients
          ADD CONSTRAINT patients_status_check
          CHECK (status IN ('active', 'trash'));
        `,
      { transaction },
    );
  });
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('patients', {
      transaction,
    });
  });
};
