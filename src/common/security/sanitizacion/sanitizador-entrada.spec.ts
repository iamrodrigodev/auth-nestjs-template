import { sanitizarValor } from "./sanitizador-entrada";

describe("sanitizarValor", () => {
  it("elimina controles, espacios extremos y etiquetas HTML", () => {
    expect(sanitizarValor("\u0000 <b> Lima </b> ")).toBe("Lima");
  });

  it("no modifica campos sensibles", () => {
    const valor = {
      email: " usuario@test.com ",
      contrasena: "  <b>Secreta123</b>  ",
      token: "  <b>jwt</b>  ",
    };

    expect(sanitizarValor(valor)).toEqual({
      email: "usuario@test.com",
      contrasena: "  <b>Secreta123</b>  ",
      token: "  <b>jwt</b>  ",
    });
  });
});
