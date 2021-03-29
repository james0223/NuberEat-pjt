import { useMutation } from "@apollo/client"
import gql from "graphql-tag"
import React from "react"
import { useForm } from "react-hook-form"
import { FormError } from "../components/form-error"

// 중요! gql 내부에서 선언되는 mutation의 이름은 backend로 가지 않고, 프론트엔드에서만 사용된다
// 인자 앞에 $를 붙이면 apollo가 이를 variable로 인식한다
const LOGIN_MUTATION = gql`
    mutation LoginMutation($email:String!, $password:String!) {
        login(input: {
            email: $email,
            password: $password
        }) {
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
    const [loginMutation, {loading, error, data}] = useMutation(LOGIN_MUTATION)
    const onSubmit = () => {
        const { email, password } = getValues()
        loginMutation({
            variables: {
                email,
                password
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
            </form>
        </div>
    </div>
    )
}