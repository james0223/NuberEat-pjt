import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';
import * as FormData from "form-data"
import got from "got" // backend에서는 fetch를 사용하지 못하므로 제3 라이브러리를 활용함!

@Injectable()
export class MailService {
    constructor(
        @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions
    ) {}
    
    async sendEmail(
        subject: string,
        template: string, 
        emailVars: EmailVar[],
        ): Promise<boolean> {
        const form = new FormData() // form을 생성하고 자료를 넣는다
        form.append("from", `James from NuberEats <mailgun@${this.options.domain}>`)
        form.append("to", `james98403@naver.com`)
        form.append("subject", subject)
        form.append("template", template)
        emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value))
        try {
            await got.post(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
                headers: {
                    "Authorization": `Basic ${Buffer.from(
                        `api:${this.options.apiKey}`,
                    ).toString('base64')}`
                }, // mailgun에 요청을 보내기 위한 헤더 형태
                body: form // mailgun에서 body를 form형태로 보내달라고 요구하므로 form-data 라이브러리를 설치하여 form을 전송
            })
            return true
        } catch (e) {
            return false
        }
    }

    sendVerificationEmail(email: string, code: string){
        this.sendEmail("Verify Your Email", "verify-email", [
            {key: "code", value: code},
            {key:"username", value: email}
        ])
    }
}
