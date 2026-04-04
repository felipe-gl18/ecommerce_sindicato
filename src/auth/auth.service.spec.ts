import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { RegisterService } from './register.service';
import { TokenService } from 'src/token/token.service';
import { HashService } from 'src/hash/hash.service';
import { MailService } from 'src/mail/mail.service';
import { UsersService } from 'src/users/user.service';
import { BillingType } from './dto/register-user.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;

  const registerServiceMock = {
    execute: jest.fn(),
  };

  const tokenServiceMock = {
    generateToken: jest.fn(),
  };

  const usersServiceMock = {
    user: jest.fn(),
  };

  const hashServiceMock = {
    compare: jest.fn(),
  };

  const mailServiceMock = {
    sendRecoveryPasswordEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,

        { provide: HashService, useValue: hashServiceMock },
        {
          provide: MailService,
          useValue: mailServiceMock,
        },
        { provide: UsersService, useValue: usersServiceMock },
        {
          provide: RegisterService,
          useValue: registerServiceMock,
        },
        { provide: TokenService, useValue: tokenServiceMock },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register user without charge information', async () => {
    const user = {
      username: 'john doe',
      email: 'johndoe@example.com',
      cpfCnpj: '63244402305',
      postalCode: '62050300',
      isSelling: false,
      password: 'felipe2004',
    };
    registerServiceMock.execute.mockResolvedValue({
      user: {
        id: '1',
        email: 'johndoe@example.com',
        username: 'John Doe',
      },
    });
    tokenServiceMock.generateToken.mockResolvedValue('token');

    const result = await authService.register(user);

    expect(registerServiceMock.execute).toHaveBeenCalledWith(user);
    expect(tokenServiceMock.generateToken).toHaveBeenCalledTimes(1);
    expect(tokenServiceMock.generateToken).toHaveBeenCalledWith({
      sub: '1',
      email: 'johndoe@example.com',
      username: 'John Doe',
    });
    expect(result).toEqual({
      email: 'johndoe@example.com',
      username: 'John Doe',
      access_token: 'token',
      invoiceUrl: undefined,
    });
  });

  it('should register user with charge information', async () => {
    const user = {
      username: 'john doe',
      email: 'johndoe@example.com',
      cpfCnpj: '63244402305',
      postalCode: '62050300',
      isSelling: true,
      password: 'felipe2004',
      storeName: 'Pitonic Store',
      billingType: 'PIX' as BillingType,
    };

    registerServiceMock.execute.mockResolvedValue({
      user: {
        id: '1',
        email: 'johndoe@example.com',
        username: 'John Doe',
      },
      charge: {
        id: 'charge-id',
        invoiceUrl: 'invoice-url',
      },
    });
    tokenServiceMock.generateToken.mockResolvedValue('token');

    const result = await authService.register(user);

    expect(registerServiceMock.execute).toHaveBeenCalledWith(user);
    expect(tokenServiceMock.generateToken).toHaveBeenCalledTimes(1);
    expect(tokenServiceMock.generateToken).toHaveBeenCalledWith({
      sub: '1',
      email: 'johndoe@example.com',
      username: 'John Doe',
    });
    expect(result.invoiceUrl).toBe('invoice-url');
    expect(result).toEqual({
      email: 'johndoe@example.com',
      username: 'John Doe',
      access_token: 'token',
      invoiceUrl: 'invoice-url',
    });
  });

  it('should sign in user through email', async () => {
    const email = 'johndoe@example.com';
    const password = 'johndoe1234';

    usersServiceMock.user.mockResolvedValue({
      id: '1',
      username: 'John Doe',
      email: 'johndoe@example.com',
      password: 'johndoe1234',
    });
    hashServiceMock.compare.mockResolvedValue(true);
    tokenServiceMock.generateToken.mockResolvedValue('token');

    const result = await authService.login(email, password);

    expect(usersServiceMock.user).toHaveBeenCalledWith({
      email: 'johndoe@example.com',
    });
    expect(hashServiceMock.compare).toHaveBeenCalledWith(
      password,
      'johndoe1234',
    );
    expect(tokenServiceMock.generateToken).toHaveBeenCalledTimes(1);
    expect(tokenServiceMock.generateToken).toHaveBeenCalledWith({
      sub: '1',
      email: 'johndoe@example.com',
      username: 'John Doe',
    });
    expect(result).toEqual({
      username: 'John Doe',
      email: 'johndoe@example.com',
      access_token: 'token',
    });
  });

  it('should throw an UnauthorizedExpection(Invalid credentials) when user not found', async () => {
    const email = 'johndoe@example.com';
    const password = 'johndoe1234';

    usersServiceMock.user.mockResolvedValue(null);

    await expect(authService.login(email, password)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw an UnauthorizedExpection(Invalid credentials) when the user password doesnt match', async () => {
    const email = 'johndoe@example.com';
    const password = 'johndoe1234';

    hashServiceMock.compare.mockResolvedValue(false);

    await expect(authService.login(email, password)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should send recovery password email', async () => {
    const email = 'johndoe@example.com';

    usersServiceMock.user.mockResolvedValue({
      id: '1',
      email: 'johndoe@example.com',
      username: 'John Doe',
    });
    tokenServiceMock.generateToken.mockResolvedValue('token');
    mailServiceMock.sendRecoveryPasswordEmail.mockResolvedValue({});

    const result = await authService.recoveryPassword(email);

    expect(usersServiceMock.user).toHaveBeenCalledWith({ email });
    expect(tokenServiceMock.generateToken).toHaveBeenCalledTimes(1);
    expect(tokenServiceMock.generateToken).toHaveBeenCalledWith(
      {
        sub: '1',
        email: 'johndoe@example.com',
        username: 'John Doe',
      },
      {
        expiresIn: '15m',
      },
    );
    expect(mailServiceMock.sendRecoveryPasswordEmail).toHaveBeenCalledWith(
      'johndoe@example.com',
      'token',
    );
    expect(result).toEqual({ success: true });
  });

  it('should throw an error when trying to send a the recovery password email and user not found', async () => {
    const email = 'johndoe@example.com';

    usersServiceMock.user.mockResolvedValue(null);

    await expect(authService.recoveryPassword(email)).rejects.toThrow(
      NotFoundException,
    );
  });
});
