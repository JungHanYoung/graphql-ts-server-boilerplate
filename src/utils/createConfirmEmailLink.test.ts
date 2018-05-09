import { createConfirmEmailLink } from './createConfirmEmailLink';
import { createTypeormConn } from './createTypeormConn';
import { User } from '../entity/User';
import * as Redis from 'ioredis';
import fetch, { Response } from 'node-fetch';

let userId: string;
const redis = new Redis();

beforeAll(async () => {
      await createTypeormConn();
      const user = await User
      .create({
            email: "bob5@bob.com",
            password: "afsagsadh"
      })
      .save();

      userId = user.id;
})

describe("이메일 링크 생성 테스트", () => {

      test("이메일 링크 작동 확인", async () => {
            
            const url = await createConfirmEmailLink(
                    process.env.TEST_HOST as string
                  , userId as string
                  , redis
            );
      
            const response: Response = await fetch(url);
      
            const text = await response.text();
            expect(text).toEqual("ok");

            const user = await User.findOne({ where: { id: userId } });
            if(user) {
                  expect(user.confirmed).toBeTruthy();
            } else {
                  fail("Found User is undefined");
            }
            const chunks = url.split('/');
            const id = chunks[chunks.length - 1];
            const findUserId = await redis.get(id);
            expect(findUserId).toBeNull();
      });

      test("잘못된 id를 보내 에러 발생", async () => {
            const response = await fetch(`${process.env.TEST_HOST}/confirm/12353`);
            const text = await response.text();
            expect(text).toEqual("Invalid");
      })

})
