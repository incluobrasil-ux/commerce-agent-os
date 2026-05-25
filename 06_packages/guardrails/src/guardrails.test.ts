import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { detectPII, detectSecrets, hasPII, hasSecrets, redactPII, validate } from './index.js';

describe('validate', () => {
  it('retorna data tipado quando válido', () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const out = validate(schema, { name: 'João', age: 30 });
    expect(out.name).toBe('João');
    expect(out.age).toBe(30);
  });

  it('lança ValidationError com issues quando inválido', () => {
    const schema = z.object({ age: z.number() });
    expect(() => validate(schema, { age: 'not a number' })).toThrowError(/Validation failed/);
  });
});

describe('PII detection', () => {
  it('detecta email', () => {
    const matches = detectPII('Contato: joao@example.com para suporte');
    expect(matches).toHaveLength(1);
    expect(matches[0]?.kind).toBe('email');
  });

  it('detecta CPF', () => {
    expect(hasPII('CPF: 123.456.789-00')).toBe(true);
  });

  it('detecta telefone BR', () => {
    expect(hasPII('Ligue (11) 98765-4321')).toBe(true);
  });

  it('texto limpo não acusa falso positivo', () => {
    expect(hasPII('Lorem ipsum sem dados pessoais aqui')).toBe(false);
  });

  it('redactPII substitui email', () => {
    const out = redactPII('contato a@b.com', '[X]');
    expect(out).toBe('contato [X]');
  });
});

describe('Secret detection', () => {
  it('detecta chave Anthropic fake', () => {
    expect(
      hasSecrets('export ANTHROPIC=sk-ant-api03-FAKE_KEY_FOR_TEST_PURPOSES_ONLY_1234567890'),
    ).toBe(true);
  });

  it('detecta GitHub token fake', () => {
    // ghp_ + 36 alfanuméricos contínuos (sem underscore)
    expect(hasSecrets('token ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789aB')).toBe(true);
  });

  it('detecta AWS access key fake', () => {
    expect(hasSecrets('AKIAIOSFODNN7FAKE000')).toBe(true);
  });

  it('texto limpo não acusa', () => {
    expect(hasSecrets('apenas texto comum')).toBe(false);
  });
});
