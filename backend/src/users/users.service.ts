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
      // email??? id??? ?????? ?????? ????????? ??????
      const user = await this.users.findOne(
        { email },
        { select: ["id", 'password'] }, // select??? ?????? ???????????? ?????? select??? ?????? ???????????????, password ????????? ???????????? ?????? ????????? ???
      );// ??????????????? ??? ????????? id??? password?????? ?????? user??? ??????
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      // ????????? ????????? ??????????????? hash?????? ????????? db??? ????????? hashed password??? ????????? ??????
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }
      // ???????????? ??????????????? ???????????? ?????? ????????? id????????? ???????????? jwt ????????? ???????????? ??????
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
        await this.verifications.delete({user: {id: user.id}}) // 1:1 ??????????????? ??????????????? ?????? ???????????????
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
        await this.verifications.delete(verification.id) // 1:1 ??????????????? ???????????? ??? ?????? verification??? ???????????? ?????? ?????? ????????? ?????? ??? ????????? ????????????
        return { ok: true };
      }
      return { ok: false, error: 'Verification not found' };
    } catch (error) {
      return { ok: false, error: "Could not verify email" };
    }
  }
}