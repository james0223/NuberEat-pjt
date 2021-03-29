import React from "react"

// React Component를 typescript화 하기
// 1. 들어올 데이터를 interface화 한다
interface IFormErrorProps {
    errorMessage: string
}

// fc - functional component
// 2. 아래와 같이 선언하고 받아 사용한다
export const FormError: React.FC<IFormErrorProps> = ({errorMessage}) => (
    <span className="font-medium text-red-500">
        {errorMessage}
    </span>
)