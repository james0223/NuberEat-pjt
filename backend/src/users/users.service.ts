import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { MailService } from 'src/mail/mail.service';


// Service handles functions and errors

@Injectable()
export class UserService {
  constructor(
    // By importing ConfigService from users.module, ConfigService can now be called here
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return { ok: false, error: 'There is a user with that email already' };
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      const verification = await this.verifications.save(
        this.verifications.create({
          user: user,
        }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code)
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    // find the user with the email
    // check if the password is correct
    // make a jwt and give it to the user
    try {
      // email을 id로 하는 유저 있는지 확인
      const user = await this.users.findOne(
        { email },
        { select: ["id", 'password'] }, // select는 전부 가져오지 않고 select된 것만 가져오는데, password 필드를 불러오기 위해 이렇게 함
      );// 존재한다면 그 유저의 id과 password값을 받아 user에 기록
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      // 유저가 기입한 비밀번호를 hash하여 유저의 db에 기록된 hashed password와 같은지 확인
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }
      // 이메일과 비밀번호가 일치하면 해당 유저의 id값으로 만들어진 jwt 토큰을 생성하여 보냄
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error: "Failed to log in",
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });
      return {
          ok: true,
          user: user,
        };
      } catch (error) {
      return { ok: false, error: 'User Not Found' };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (email) {
        const existingEmail = await this.users.findOne({email: email})
        if (existingEmail) {
          return {
            ok: false,
            error: "That email is already registered"
          }
        }
        user.email = email;
        user.verified = false;
        await this.verifications.delete({user: {id: user.id}}) // 1:1 관계이므로 삭제해주고 새로 생성해야함
        const verification = await this.verifications.save(this.verifications.create({ user: user }));
        this.mailService.sendVerificationEmail(user.email, verification.code)
      }
      if (password) {
        user.password = password;
      }
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      console.log(error)
      return { ok: false, error: 'Could not update profile.' };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne(
        { code },
        { relations: ['user'] },
      );
      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verifications.delete(verification.id) // 1:1 관계이므로 인증완료 후 해당 verification을 삭제해야 훗날 다른 이메일 변경 시 인증이 가능해짐
        return { ok: true };
      }
      return { ok: false, error: 'Verification not found' };
    } catch (error) {
      return { ok: false, error: "Could not verify email" };
    }
  }
}