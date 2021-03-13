import { Test } from "@nestjs/testing"
import got from "got"
import * as FormData from "form-data"
import { CONFIG_OPTIONS } from "src/common/common.constants"
import { MailService } from "./mail.service"

jest.mock("got") // got 자체가 함수임
jest.mock("form-data") // 내부를 설정해주면 특정 함수를 조작해서 가져오고 비우면 그것 전체를 mock해서 가져옴

const TEST_DOMAIN = "test-domain"
// describe, beforeEach, it, expect 등을 import할 필요 없는 이유는 Jest가 모두 준비해놓기 때문임
describe('MailService', () => {
    let service: MailService;
    beforeEach(async () => {
      const module = await Test.createTestingModule({
        providers: [
          MailService,
          {
            provide: CONFIG_OPTIONS,
            useValue: {
              apiKey: 'test-apiKey',
              domain: TEST_DOMAIN,
              fromEmail: 'test-fromEmail',
            },
          },
        ],
      }).compile();
      service = module.get<MailService>(MailService);
    });
    
    it("should be defined", ()=> {
        expect(service).toBeDefined()
    })

    describe("sendVerificationEmail", ()=> {
        it("should call sendEmail", ()=> {
            const sendVerificationEmailArgs = {
                email: "email",
                code: "code"
            }
            // Mock을 할 수 없을 때 spy를 사용한다
            // 현재 sendVE가 sendEmail에 의존하는데, 유닛테스트를 진행하기 위해서는 sendVE을 테스트할 때 sendEmail이 사용되게 됨
            // sendEmail은 또다른 유닛테스팅의 대상이므로, 이를 Mock해선 안되고 spy를 한다
            // sendEmail이 call되었을 때, 이를 intercept하여 밑의 implementation에 따라 작동하도록 한다
            jest.spyOn(service, "sendEmail").mockImplementation(async()=> true)
            service.sendVerificationEmail(sendVerificationEmailArgs.email, sendVerificationEmailArgs.code)

            expect(service.sendEmail).toHaveBeenCalledTimes(1)
            expect(service.sendEmail).toHaveBeenCalledWith("Verify Your Email", "verify-email", [
                {key: "code", value: sendVerificationEmailArgs.code},
                {key:"username", value: sendVerificationEmailArgs.email}
            ])
        })
    })

    describe("sendEmail", ()=> {
        it("sends email", async ()=>{
            const ok = await service.sendEmail("", "", [])
            const formSpy = jest.spyOn(FormData.prototype, "append") // prototype을 선언해주는 이유는 new FormData를 해야 해당 함수들이 생성되기 때문
            expect(formSpy).toHaveBeenCalled()
            expect(got.post).toHaveBeenCalledTimes(1)
            expect(got.post).toHaveBeenCalledWith(`https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`, expect.any(Object))
            expect(ok).toEqual(true)
        })

        it("fails on error", async()=> {
            jest.spyOn(got, "post").mockImplementation(()=> {
                throw new Error()
            })
            const ok = await service.sendEmail("", "", [])
            expect(ok).toEqual(false)
        })
    })
})