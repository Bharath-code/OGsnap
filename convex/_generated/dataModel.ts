// Temporary scaffold stubs.
// Convex codegen will replace this file when `convex dev` or `convex codegen` runs.

export type Id<TableName extends string = string> = string & {
  __tableName?: TableName;
};
