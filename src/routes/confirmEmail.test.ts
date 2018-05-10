import fetch from 'node-fetch';

test("잘못된 id를 보내 에러 발생", async () => {
      const response = await fetch(`${process.env.TEST_HOST}/confirm/12353`);
      const text = await response.text();
      expect(text).toEqual("Invalid");
})