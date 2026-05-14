const PATRON_TAG_HTML = /<\s*\/?\s*[a-zA-Z][^>]*>/g;
const PATRON_CONTROLES = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const NOMBRES_SENSIBLES = new Set([
  "password",
  "clave",
  "claveactual",
  "nuevaclave",
  "contrasena",
  "contrasenaactual",
  "nuevacontrasena",
  "token",
  "authorization",
  "jwt",
  "codigo",
  "codigoverificacion",
  "otp",
  "pin",
]);

export function esCampoSensible(nombre?: string): boolean {
  if (!nombre) {
    return false;
  }

  const normalizado = nombre.replace(/[_-]/g, "").toLowerCase();
  return NOMBRES_SENSIBLES.has(normalizado);
}

export function sanitizarEntrada(entrada: string): string {
  const sinControles = entrada.replace(PATRON_CONTROLES, "").trim();

  if (!sinControles) {
    return sinControles;
  }

  return sinControles.replace(PATRON_TAG_HTML, "").trim();
}

export function sanitizarValor<T>(valor: T, nombreCampo?: string): T {
  if (valor === null || valor === undefined || esCampoSensible(nombreCampo)) {
    return valor;
  }

  if (typeof valor === "string") {
    return sanitizarEntrada(valor) as T;
  }

  if (Array.isArray(valor)) {
    return valor.map((item) => sanitizarValor(item, nombreCampo)) as T;
  }

  if (typeof valor === "object") {
    const sanitizado: Record<string, unknown> = {};

    Object.entries(valor).forEach(([clave, item]) => {
      sanitizado[clave] = sanitizarValor(item, clave);
    });

    return sanitizado as T;
  }

  return valor;
}
