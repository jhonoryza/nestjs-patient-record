import { EChangeType, EGender } from '@utils/enum';
import {
  BelongsTo,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Sequelize,
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
  @Column({
    type: DataType.UUID,
    defaultValue: Sequelize.literal('uuid_v7()'),
  })
  declare id: string;

  @Column(DataType.UUID)
  declare patientId: string;

  @BelongsTo(() => Patient, 'patient_id')
  declare patient: Patient;

  @Column(DataType.INTEGER)
  declare version: number;

  @Column(DataType.STRING)
  declare fullName: string;

  @Column(DataType.DATEONLY)
  declare birthDate: Date;

  @Column(DataType.STRING)
  declare gender: EGender;

  @Column(DataType.STRING)
  declare diagnosis: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare medicalNotes: string | null;

  @Column(DataType.STRING)
  declare changeType: EChangeType;

  @Column(DataType.STRING)
  declare updatedBy: string;

  @Column(DataType.DATE)
  declare updatedAt: Date;
}
