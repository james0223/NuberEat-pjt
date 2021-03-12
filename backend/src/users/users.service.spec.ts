import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { JwtService } from "src/jwt/jwt.service"
import { MailService } from "src/mail/mail.service"
import { Repository } from "typeorm"
import { User } from "./entities/user.entity"
import { Verification } from "./entities/verification.entity"
import { UserService } from "./users.service"

// 테스트를 위한 Mock Repository
const mockRepository = {
    findOne: jest.fn(), // fn은 가짜 함수를 생성해줌
    save: jest.fn(),
    create: jest.fn(),
  };
  
  const mockJwtService = {
    sign: jest.fn(),
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
    let userRepository: MockRepository<User>
    beforeAll(async ()=> {
        // Nest의 TEST는 테스트만을 위한 독립된 모듈을 생성해줌
        const module = await Test.createTestingModule({
            providers: [
                UserService, 
                {
                    provide: getRepositoryToken(User), 
                    useValue: mockRepository,
                },
                {
                    provide: getRepositoryToken(Verification), 
                    useValue: mockRepository,
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
        userRepository = module.get(getRepositoryToken(User))
    })

    it("should be defined", ()=>{
        expect(service).toBeDefined()
    })
    describe("createAccount", ()=> {
        it("should fail if user exists", async ()=> {
            // Mock의 핵심! - 함수의 반환값을 조작할 수 있다
            // mockResolvedValue는 promise로 값을 반환한다 - async함수의 await 결과값에 사용
            userRepository.findOne.mockResolvedValue({
                id: 1,
                email: "fakemail@mail.com"
            })
            const result = await service.createAccount({
                email: "",
                password: "",
                role: 0
            })
            expect(result).toMatchObject({
                ok: false,
                error: "There is a user with that email already"
            })
        })
    })
    it.todo("createAccount")
    it.todo("login")
    it.todo("findById")
    it.todo("editProfile")
    it.todo("verifyEmail")
})