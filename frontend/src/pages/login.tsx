import { ApolloError, useMutation } from "@apollo/client"
import { data } from "autoprefixer"
import gql from "graphql-tag"
import React from "react"
import { useForm } from "react-hook-form"
import { FormError } from "../components/form-error"
import { loginMutation, loginMutationVariables } from "../__generated__/LoginMutation"

// 중요! gql 내부에서 선언되는 mutation의 이름은 backend로 가지 않고, 프론트엔드에서만 사용된다
// 인자 앞에 $를 붙이면 apollo가 이를 variable로 인식한다
// const LOGIN_MUTATION = gql`
//     mutation loginMutation($email:String!, $password:String!) {
//         login(input: {
//             email: $email,
//             password: $password
//         }) {
//             ok
//             token
//             error
//         }
//     }
// `

// 위와 같이 하면 frontend에서 input을 따로 작성해줘야 하지만, backend에서 생성해둔 dto를 활용하면 매우 편하고 정확하게 쿼리를 생성할 수 있다
const LOGIN_MUTATION = gql`
    mutation loginMutation($loginInput: LoginInput!) {
        login(input: $loginInput) {
            ok
            token
            error
        }
    }
`

interface ILoginForm {
    email: string
    password: string
}

export const Login = () => {
    const { register, getValues, errors, handleSubmit } = useForm<ILoginForm>()
    const onCompleted = (data: loginMutation) => {
        const {login: {error, ok, token}} = data
        if (ok) {
            console.log(token)
        }
    }
    // apollo codegen으로 생성된 interface 적용은 다음과 깉이 한다
    // destructuring으로 데이터 받아내는 것은 login: {error, ok, token}과 같이 하며, rename은 data: loginMutationResult와 같이 한다
    const [loginMutation, { data: loginMutationResult }] = useMutation<
        loginMutation, 
        loginMutationVariables
        >(LOGIN_MUTATION, 
            {
                onCompleted
            }
        )
    const onSubmit = () => {
        const { email, password } = getValues()
        loginMutation({
            // 이것 역시 dto를 사용하면 바꿔줘야 한다
            // variables: {
            //     email,
            //     password
            // }
            variables: {
                loginInput: {
                    email,
                    password
                }
            }
        })
    }
    return (
        <div className="h-screen flex items-center justify-center bg-gray-800">
            <div className="bg-white w-full max-w-lg pt-10 pb-7 rounded-lg text-center">
                <h3 className="text-2xl text-gray-800">Log In</h3>
                <form 
                    onSubmit={handleSubmit(onSubmit)} 
                    className="grid gap-3 mt-5 px-5"
                >
                    <input 
                        ref={register({ required: "Email is required" })}
                        name="email"
                        required
                        type="email"
                        placeholder="Email" 
                        className="input mb-3"
                    />
                    {errors.email?.message && (
                        <FormError errorMessage={errors.email?.message} />
                    )}
                    <input 
                        ref={register({ required: "Password is required", minLength: 6 })} 
                        name="password"
                        required
                        type="password"
                        placeholder="Password" 
                        className="input"
                    />
                    {errors.password?.message && (
                        <FormError errorMessage={errors.password?.message} />
                    )}
                    {errors.password?.type === "minLength" && (
                        <FormError errorMessage={"Passowrd must be more than 10 chars"} />
                    )}
                    <button className="btn mt-3">
                        Log In
                    </button>
                    {loginMutationResult?.login.error && <FormError errorMessage={loginMutationResult.login.error}/>}
                </form>
            </div>
        </div>
    )
}