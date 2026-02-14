import { EStatus } from '@utils/enum';
import {
  BelongsTo,
  Column,
  DataType,
  Model,
  PrimaryKey,
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
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.UUID)
  declare createdBy: string;

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;

  @Column(DataType.STRING)
  declare status: EStatus;

  @Column(DataType.DATE)
  declare createdAt: Date | null;

  @Column(DataType.DATE)
  declare trashedAt: Date | null;
}
