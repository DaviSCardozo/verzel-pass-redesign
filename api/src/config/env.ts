import 'dotenv/config'
import { z } from 'zod'

// Lista de valores conhecidos/comprometidos — a aplicação recusa iniciar se um deles for usado.
const JWT_SECRET_BLACKLIST = [
  'chave-provisoria-trocar-em-producao',
  'secret',
  'changeme',
  'mysecret',
  'your-secret',
]

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  // Em produção, CORS_ORIGIN deve ser uma lista explícita de origens — não '*'.
  // Em desenvolvimento, o padrão '*' é aceito por conveniência.
  CORS_ORIGIN: z.string().default('*'),
  // DATABASE_URL não tem default: em produção, a ausência desta variável
  // dispara o erro de parse e impede o app de subir com credenciais triviais.
  DATABASE_URL: z.string().url(),
  // JWT_SECRET é obrigatório sem fallback: se não estiver configurado,
  // o schema falha e o app não sobe — nunca usa um valor público por padrão.
  JWT_SECRET: z.string().min(10, 'JWT_SECRET deve ter ao menos 10 caracteres'),
  TMDB_API_KEY: z.string().min(10),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Variáveis de ambiente inválidas:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

// Guarda de segurança: rejeita segredos JWT conhecidos/comprometidos
if (JWT_SECRET_BLACKLIST.includes(parsed.data.JWT_SECRET)) {
  console.error('❌ SEGURANÇA: JWT_SECRET está usando um valor padrão comprometido.')
  console.error('   Gere um segredo forte: openssl rand -base64 64')
  process.exit(1)
}

// Aviso de CORS em produção caso esteja configurado com wildcard (*)
if (parsed.data.NODE_ENV === 'production' && parsed.data.CORS_ORIGIN === '*') {
  console.warn('⚠️ AVISO DE SEGURANÇA: CORS_ORIGIN está configurado como "*".')
  console.warn('   Em produção, recomenda-se definir uma lista explícita de origens (ex: https://verzel-pass-redesign.vercel.app).')
}

export const env = parsed.data

export const isProduction = env.NODE_ENV === 'production'

/** `*` libera tudo (retorna true para suportar credentials: true); caso contrário, lista de origens. */
export const corsOrigin: boolean | string | string[] =
  env.CORS_ORIGIN === '*'
    ? true
    : env.CORS_ORIGIN.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)

