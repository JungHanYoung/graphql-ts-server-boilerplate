import { request } from "graphql-request";
import { createTypeormConn } from '../../utils/createTypeormConn';
import { User } from "../../entity/User";
import { 
        passwordNotEnoughLongError
      , emailNotValid
      , emailNotEnoughLongError
      , duplicateEmail 
} from "./errorMessages";

// let getHost = () => '';

// beforeAll(async () => {
//       const app = await startServer();
//       const { port } = app.address();
//       getHost = () => `http://127.0.0.1:${port}`;
// });

beforeAll(async () => {
      await createTypeormConn();
});

const email = "tom@bob.com";
const password = "ksajkasf";

const mutation = (e: string, p: string) => `
      mutation {
            register(email: "${e}", password: "${p}"){
                  path
                  message
            }
      }
`

describe("Register User", async () => {

      test("유저 생성하기", async () => {
            const response = await request(process.env.TEST_HOST as string, mutation(email, password));
            expect(response).toEqual({ register: null });
      });

      test("생성한 유저 찾기", async () => {
            const users = await User.find({ where: { email }});
            expect(users).toHaveLength(1);

            const user = users[0];
            expect(user.email).toEqual(email);
            expect(user.password).not.toEqual(password);
      });

      test("중복된 이메일에 대한 에러", async () => {
            const response2: any = await request(process.env.TEST_HOST as string, mutation(email, password));
            expect(response2.register).toHaveLength(1);
            expect(response2).toEqual({
                  register: [
                        {
                              path: "email",
                              message: duplicateEmail
                        }
                  ]
            });
      });

      test("짧고 이메일 형식아님. 에러", async () => {
            const response: any = await request(process.env.TEST_HOST as string, mutation("as", password));
            expect(response).toEqual({
                  register: [
                        {
                              path: "email",
                              message: emailNotEnoughLongError
                        },
                        {
                              path: "email",
                              message: emailNotValid
                        }
                  ]
            });
      });

      test("이메일 형식 에러", async () => {
            const response: any = await request(process.env.TEST_HOST as string, mutation("asasd", password));
            expect(response).toEqual({
                  register: [
                        {
                              path: "email",
                              message: emailNotValid
                        }
                  ]
            });
      });

      test("패스워드 길이 에러", async () => {
            const response: any = await request(process.env.TEST_HOST as string, mutation(email, "12"));
            expect(response).toEqual({
                  register: [
                        {
                              path: "password",
                              message: passwordNotEnoughLongError
                        }
                  ]
            });
      });

      test("이메일, 패스워드 둘다 에러", async () => {
            const response: any = await request(process.env.TEST_HOST as string, mutation("as", "12"));
            // expect(response.register).toHaveLength(1);
            expect(response).toEqual({
                  register: [
                        {
                              path: "email",
                              message: emailNotEnoughLongError
                        },
                        {
                              path: "email",
                              message: emailNotValid
                        },
                        {
                              path: "password",
                              message: passwordNotEnoughLongError
                        },
                  ]
            });
      });
});

// use a test database
// drop all data once the test is over
// when I run yarn test it also starts the server