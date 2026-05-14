import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { ModuloApp } from "@app/app.module";

describe("Pruebas E2E (Autenticación)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduloReferencia: TestingModule = await Test.createTestingModule({
      imports: [ModuloApp],
    }).compile();

    app = moduloReferencia.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  it("Debe estar definida la aplicación", () => {
    expect(app).toBeDefined();
  });
});
