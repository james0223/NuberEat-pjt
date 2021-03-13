import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { JwtService } from "src/jwt/jwt.service"
import { MailService } from "src/mail/mail.service"
import { Repository } from "typeorm"
import { User } from "./entities/user.entity"
import { Verification } from "./entities/verification.entity"
import { UserService } from "./users.service"

// 테스트를 위한 Mock Repository
// Since we put the same object (mockRepository) to both UserMockRepository and VerificationMockRepository, Jest cannot know they are different. 
// It is because an object in javascript is a reference type, not a primitive type such as number, string, or boolean. 
// So by making mockRepository as a function that returns a new object, we can actually have two different mockRepository objects (even though their shapes are the same!)
const mockRepository = () =>({
    findOne: jest.fn(), // fn은 가짜 함수를 생성해줌
    save: jest.fn(),
    create: jest.fn(),
    findOneOrFail: jest.fn(),
    delete: jest.fn()
  });
  
  const mockJwtService = {
    sign: jest.fn(()=> "signed-token"), // mock 선언시 바로 implement하기
    verify: jest.fn(),
  };
  
  const mockMailService = {
    sendVerificationEmail: jest.fn(),
  };

  // Mock Repository만의 Type을 생성 = 진짜 Repository내부의 모든 함수(User의 경우 findOne, create, delete 등등)를 가져온다
  // Partial - make all properties optional, Record - K에 속해있는 특성들을 갖는 T라는 새로운 타입 생성
  // type MockRepository는 Repository의 모든 함수들의 집합인데, 그 함수들은 모두 jest.Mock함수인 것이다
  // T Repository에 속해있는 모든 함수들(keyof로 모두 불러옴)을 mock이라는 type으로 복제한다
  type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

describe("UserService", ()=>{
    let service: UserService // to use the Userservice in all tests, it was created outside the beforeAll function
    let usersRepository: MockRepository<User>
    let verificationsRepository: MockRepository<Verification>
    let mailService: MailService
    let jwtService: JwtService
    beforeEach(async ()=> {
        // Nest의 TEST는 테스트만을 위한 독립된 모듈을 생성해줌
        // beforeALL이 아닌 beforeEach를 사용하는 이유는 특정 함수가 몇번 실행되었는지 파악할 때, BA를 쓰면 하나의 모듈이므로 기존의 횟수가 누적되지만 BE는 매번 새로 생성하므로 횟수 측정이 편해짐
        const module = await Test.createTestingModule({
            providers: [
                UserService, 
                {
                    provide: getRepositoryToken(User), 
                    useValue: mockRepository(),
                },
                {
                    provide: getRepositoryToken(Verification), 
                    useValue: mockRepository(),
                },
                {
                    provide: JwtService, 
                    useValue: mockJwtService,
                },
                {
                    provide: MailService, 
                    useValue: mockMailService,
                }
            ]
        }).compile()
        service = module.get<UserService>(UserService)
        mailService = module.get<MailService>(MailService)
        jwtService = module.get<JwtService>(JwtService)
        usersRepository = module.get(getRepositoryToken(User))
        verificationsRepository = module.get(getRepositoryToken(Verification))
    })

    it("should be defined", ()=>{
        expect(service).toBeDefined()
    })
    describe("createAccount", ()=> {
        const createAccountArgs = {
            email: "",
            password: "",
            role: 0
        }
        it("should fail if user exists", async ()=> {
            // Mock의 핵심! - 함수의 반환값을 조작할 수 있다
            // mockResolvedValue는 promise로 값을 반환한다 - async함수의 await 결과값에 사용
            usersRepository.findOne.mockResolvedValue({
                id: 1,
                email: "fakemail@mail.com"
            })
            const result = await service.createAccount(createAccountArgs)
            expect(result).toMatchObject({
                ok: false,
                error: "There is a user with that email already"
            })
        })

        it("should create a new user", async ()=>{
            usersRepository.findOne.mockResolvedValue(undefined) // 일단 findOne이 해당 유저가 없다고 출력해야 이후의 코드를 테스트할 수 있으므로 이렇게 설정함
            usersRepository.create.mockReturnValue(createAccountArgs)
            usersRepository.save.mockResolvedValue(createAccountArgs)
            verificationsRepository.create.mockReturnValue({user: createAccountArgs})
            verificationsRepository.save.mockResolvedValue({
                code: "code"
            })

            const result = await service.createAccount(createAccountArgs)

            // 함수가 실행되었는지 여부로 테스트도 가능!
            expect(usersRepository.create).toHaveBeenCalledTimes(1) // 특정 함수가 몇번 call되었었는지 계산
            expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs) // 어떤 인자를 받아서 실행되었는지 테스트
            
            expect(usersRepository.save).toHaveBeenCalledTimes(1)
            expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs)
            
            expect(verificationsRepository.create).toHaveBeenCalledTimes(1)
            expect(verificationsRepository.create).toHaveBeenCalledWith({
                user: createAccountArgs
            })

            expect(verificationsRepository.save).toHaveBeenCalledTimes(1)
            expect(verificationsRepository.save).toHaveBeenCalledWith({
                user: createAccountArgs
            })
            
            expect(mailService.sendVerificationEmail).toHaveBeenCalled()
            expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
                expect.any(String), 
                expect.any(String)
            )

            expect(result).toEqual({ok: true})
        })

        it("should fail on exception", async ()=> {
            // findOne을 실패시켰을 때 오류 처리가 잘 작동하는지 확인
            usersRepository.findOne.mockRejectedValue(new Error())
            const result = await service.createAccount(createAccountArgs)
            expect(result).toEqual({ ok: false, error: "Couldn't create account" })
        })
    })

    describe("login", ()=> {
        const loginArgs = {
            email: "mail@mail.com",
            password: "password"
        }
        
        it("should fail if user does not exist", async ()=> {
            usersRepository.findOne.mockResolvedValue(null)
            const result = await service.login(loginArgs)
            expect(usersRepository.findOne).toHaveBeenCalledTimes(1)
            expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object), expect.any(Object))
            expect(result).toEqual({
                ok: false,
                error: "User not found"
            })
        })
        
        it("should fail if the password is wrong", async ()=>{
            const mockedUser = {
                // Promise를 return하는 mock function
                checkPassword: jest.fn(() => Promise.resolve(false))
            }
            usersRepository.findOne.mockResolvedValue(mockedUser)
            const result = await service.login(loginArgs)
            expect(result).toEqual({ok: false, error: "Wrong password"})
        })

        it("should return token if password is correct", async ()=> {
            const mockedUser = {
                id: 1,
                // Promise를 return하는 mock function
                checkPassword: jest.fn(() => Promise.resolve(true))
            }
            usersRepository.findOne.mockResolvedValue(mockedUser)
            const result = await service.login(loginArgs)
            expect(jwtService.sign).toHaveBeenCalledTimes(1)
            expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number))
            expect(result).toEqual({ok: true, token: "signed-token"})
        })

        it('should fail on exception', async () => {
            usersRepository.findOne.mockRejectedValue(new Error());
            const result = await service.login(loginArgs);
            expect(result).toEqual({ ok: false, error: "Failed to log in" });
          });
    })
    
    describe("findById", ()=> {
        const findByIdArgs = {
            id:1
        }
        it("should find an existing user", async ()=>{
           usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs)
           const result = await service.findById(1)
           expect(result).toEqual({ok: true, user: findByIdArgs}) 
        })

        it("should fail if no user is found", async ()=> {
            usersRepository.findOneOrFail.mockRejectedValue(new Error())
            const result = await service.findById(1)
            expect(result).toEqual({ok: false, error: "User Not Found"})
        })
    })

    describe("editProfile", ()=> {
        it("should change email", async ()=> {
            const oldUser = {
                email: "old@old.com",
                verified: true
            }
            const editProfileArgs = {
                userId: 1,
                input: {email: "new@new.com"}
            }
            const newVerification = {
                code: "code"
            }
            const newUser = {
                verified: false,
                email: editProfileArgs.input.email
            }

            usersRepository.findOne.mockResolvedValue(oldUser)
            verificationsRepository.create.mockReturnValue(newVerification)
            verificationsRepository.save.mockResolvedValue(newVerification)

            await service.editProfile(editProfileArgs.userId, editProfileArgs.input)
            
            expect(usersRepository.findOne).toHaveBeenCalledTimes(1)
            expect(usersRepository.findOne).toHaveBeenCalledWith(editProfileArgs.userId)
            
            expect(verificationsRepository.create).toHaveBeenCalledWith({user: newUser})
            expect(verificationsRepository.save).toHaveBeenCalledWith(newVerification)
            
            expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
                newUser.email, 
                newVerification.code
            )
        })

        it("should change password", async ()=> {
            const editProfileArgs = {
                userId: 1,
                input: {password: "new-password"}
            }
            usersRepository.findOne.mockResolvedValue({password: "old"})
            const result = await service.editProfile(editProfileArgs.userId, editProfileArgs.input)
            
            expect(usersRepository.save).toHaveBeenCalledTimes(1)
            expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input)
            expect(result).toEqual({ok: true})
        })

        it("should fail on exception", async()=>{
            usersRepository.findOne.mockRejectedValue(new Error())

            const result = await service.editProfile(1, {email: "12"})
            expect(result).toEqual({ok: false, error: "Could not update profile."})
        })
    })
    describe("verifyEmail", ()=> {
        it("should verify email", async ()=> {
            const mockedVerification = {
                user: {
                    verified: false
                },
                id: 1
            }
            verificationsRepository.findOne.mockResolvedValue(mockedVerification)
            
            const result = await service.verifyEmail("")

            expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1)
            expect(verificationsRepository.findOne).toHaveBeenCalledWith(expect.any(Object), expect.any(Object))
            
            expect(usersRepository.save).toHaveBeenCalledTimes(1)
            expect(usersRepository.save).toHaveBeenCalledWith({verified: true})

            expect(verificationsRepository.delete).toHaveBeenCalledTimes(1)
            expect(verificationsRepository.delete).toHaveBeenCalledWith(mockedVerification.id)
            expect(result).toEqual({ok: true})
        })
        it("should fail on verification not found", async ()=> {
            verificationsRepository.findOne.mockResolvedValue(undefined)
            const result = await service.verifyEmail("")
            expect(result).toEqual({ok: false, error: "Verification not found."})
        })
        it("should fail on exception", async ()=> {
            verificationsRepository.findOne.mockRejectedValue(new Error())
            const result = await service.verifyEmail("")
            expect(result).toEqual({ ok: false, error: "Could not verify email" })
        })
    })
})