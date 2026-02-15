import { Migration } from '@config/database/migration.provider';
import { DataType, Sequelize } from 'sequelize-typescript';

export const databasePath = __dirname;

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'patient_versions',
      {
        id: {
          type: DataType.UUID,
          primaryKey: true,
          allowNull: false,
          defaultValue: Sequelize.literal('uuid_v7()'),
        },
        patient_id: {
          type: DataType.UUID,
          allowNull: false,
          references: {
            model: 'patients',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        version: {
          type: DataType.INTEGER,
          allowNull: false,
          unique: true,
          autoIncrement: true,
        },
        full_name: {
          type: DataType.STRING(150),
          allowNull: false,
        },
        birth_date: {
          type: DataType.DATEONLY,
          allowNull: false,
        },
        gender: {
          type: DataType.STRING(10),
          allowNull: false,
        },
        diagnosis: {
          type: DataType.TEXT,
          allowNull: false,
        },
        medical_notes: {
          type: DataType.TEXT,
          allowNull: true,
        },
        updated_by: {
          type: DataType.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'RESTRICT',
        },
        updated_at: {
          type: DataType.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('now()'),
        },
        change_type: {
          type: DataType.STRING(20),
          allowNull: false,
        },
      },
      {
        transaction,
      },
    );

    await queryInterface.sequelize.query(
      `
      ALTER TABLE patient_versions
      ADD CONSTRAINT patient_versions_change_type_check
      CHECK (change_type IN ('create','update','rollback','delete','restore'));
    `,
      { transaction },
    );
  });
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('patient_versions', {
      transaction,
    });
  });
};
