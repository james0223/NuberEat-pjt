module.exports = {
    client: {
        // includes - 해당 경로에 있는 파일들의 tagname속에 들어있는 코드들 찾아서 필요한 schema들만을 가져온다 - 서버와 연결되는 최초의 순간에 자동으로 schema를 불러오는 query가 실행됨
        includes: ["./src/**/*.tsx"], // **는 한번만 해도 폴더가 여러개여도 알아서 탐색한다 즉, .src/**/**/*.tsx 와 같이 작성할 필요가 없는 것
        tagName: "gql",
        service: {
            name: "nuber-eats-backend",
            url: "http://localhost:4000/graphql" // backend의 url
        }
    }
}