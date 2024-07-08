// utils/convertSnakeToCamel.ts

function toCamelCase(str: string): string {
  return str.replace(/([-_][a-z])/gi, (match) =>
    match.toUpperCase().replace("-", "").replace("_", "")
  );
}

function convertSnakeToCamel<T>(obj: any): T {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertSnakeToCamel(item)) as any;
  }

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = toCamelCase(key);
    acc[camelKey] = convertSnakeToCamel(obj[key]);
    return acc;
  }, {} as any);
}

export default convertSnakeToCamel;
