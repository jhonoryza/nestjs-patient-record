import { AuthProvider } from '@common/auth/provider.service';
import { User } from '@models/core/User';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  RefreshTokenDto,
  UserLoginDto,
} from '../controllers/requests/cms.auth.request';

@Injectable()
export class CmsAuthService {
  constructor(private authProvider: AuthProvider) {}

  public async login(body: UserLoginDto) {
    const user = await this.validateLogin(body.email, body.password);

    if (!user) {
      throw new UnauthorizedException();
    }

    const { accessToken, expiresIn } = this.authProvider.generateAccessToken(
      user.email,
      user.role,
    );

    return {
      accessToken,
      expiresIn,
      refreshToken: this.authProvider.generateRefreshToken(
        user.email,
        user.role,
      ),
    };
  }

  public async refresh(req: RefreshTokenDto) {
    const decoded = this.authProvider.verifyRefreshToken(req.refreshToken);

    const userEmail = decoded.sub;

    const user = await this.validateEmail(userEmail);

    if (!user) {
      throw new UnauthorizedException();
    }

    const { accessToken, expiresIn } = this.authProvider.generateAccessToken(
      user.email,
      user.role,
    );

    return {
      accessToken,
      expiresIn,
    };
  }

  private async validateLogin(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return null;
    }

    return user;
  }

  private async validateEmail(email: string) {
    return User.findOne({
      where: { email },
    });
  }
}
