import { App, createApp, defineEventHandler, toNodeListener } from "h3";
import supertest, { SuperTest, Test } from "supertest";

const handler = defineEventHandler(async () => {
  return { message: "Ok" };
});

describe("e2e example", () => {
  let app: App;
  let request: SuperTest<Test>;

  beforeEach(() => {
    app = createApp({ debug: true });
    // @ts-expect-error
    request = supertest(toNodeListener(app));
  });

  it("A user can get ingredients", async () => {
    app.use("/", handler);

    const res = await request.get("/");

    expect(res.text).toMatchInlineSnapshot(`
      "{
        "message": "Ok"
      }"
    `);
  });
});
