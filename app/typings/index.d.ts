interface classmap {
  [k: string]: string;
}

declare module "*.css" {
  const classMap: classmap;
  export default classMap;
}
