import { EStatus } from '@utils/enum';
import {
  BelongsTo,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
} from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'patients',
  timestamps: false,
  paranoid: false,
})
export class Patient extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: Sequelize.literal('uuid_v7()'),
  })
  declare id: string;

  @Column(DataType.STRING)
  declare idCard: string;

  @Column(DataType.UUID)
  declare createdBy: string;

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;

  @Column(DataType.STRING)
  declare status: EStatus;

  @Column(DataType.DATE)
  declare createdAt: Date;

  @Column(DataType.DATE)
  declare trashedAt: Date | null;
}
