import type { StepContext } from "../context.js";

function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c: string | undefined) =>
      c ? c.toUpperCase() : "",
    )
    .replace(/^(.)/, (_, c: string) => c.toUpperCase());
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function toUpperSnake(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[-\s]+/g, "_")
    .toUpperCase();
}

export function replacePlaceholders(
  template: string,
  ctx: StepContext,
): string {
  const name = (ctx.get<string>("projectName") ?? "").toString();

  const builtins: Record<string, string> = {
    name,
    PascalName: toPascalCase(name),
    camelName: toCamelCase(name),
    kebabName: toKebabCase(name),
    UPPER_NAME: toUpperSnake(name),
  };

  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    if (key in builtins) return builtins[key];
    const ctxValue = ctx.get<unknown>(key);
    return ctxValue !== undefined ? String(ctxValue) : match;
  });
}
