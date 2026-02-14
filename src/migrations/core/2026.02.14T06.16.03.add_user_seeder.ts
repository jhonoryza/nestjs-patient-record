import { Migration } from '@config/database/migration.provider';
import { User } from '@models/core/User';
import { ERole } from '@utils/enum';
import bcrypt from 'bcrypt';

export const databasePath = __dirname;

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await User.create(
      {
        email: 'admin@mail.com',
        password: await bcrypt.hash('password', 10),
        name: 'admin',
        isActive: true,
        role: ERole.ADMIN,
      },
      { transaction },
    );
    await User.create(
      {
        email: 'doctor@mail.com',
        password: await bcrypt.hash('password', 10),
        name: 'doctor',
        isActive: true,
        role: ERole.DOCTOR,
      },
      { transaction },
    );
  });
};
export const down: Migration = async () => {
  //
};
