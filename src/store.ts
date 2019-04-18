export interface Repo {
  url: string;
  dir: string;
}

export interface State {
  active: string;
  repos: {[key: string]: Repo};
}
