import { EChangeType, EGender } from '@utils/enum';
import {
  BelongsTo,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Patient } from './Patient';

@Table({
  tableName: 'patient_versions',
  timestamps: false,
  paranoid: false,
})
export class PatientVersion extends Model {
  @PrimaryKey
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.UUID)
  declare patient_id: string;

  @BelongsTo(() => Patient, 'patient_id')
  declare patient: Patient;

  @Column(DataType.INTEGER)
  declare version: number;

  @Column(DataType.STRING)
  declare full_name: string;

  @Column(DataType.DATEONLY)
  declare birth_date: Date;

  @Column(DataType.STRING)
  declare gender: EGender;

  @Column(DataType.STRING)
  declare diagnosis: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare medical_notes: string | null;

  @Column(DataType.STRING)
  declare change_type: EChangeType;

  @Column(DataType.STRING)
  declare updated_by: string;

  @Column(DataType.DATE)
  declare created_at: Date;
}
