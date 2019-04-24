export interface Mod {
  path: string;
  optional: boolean;
}

export interface Repo {
  url: string;
  dir: string;
  mods: {[key: string]: Mod};
}

export interface State {
  active: string;
  repos: {[key: string]: Repo};
}
