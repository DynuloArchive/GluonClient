import Vue from 'vue';
import Vuex from 'vuex';
import App from './App.vue';
import {remote} from 'electron';
import GluonDialog from './components/Dialog.vue';

Vue.config.productionTip = false;

(window as any).createDialog = (
  title: string,
  message: string,
  callback: () => any = () => { return; },
  buttons: Array<{text: string, callback: () => any, style: string}> = [],
  close: boolean = true,
) => {
  const instance = new GluonDialog();
  instance.$data.close = close;
  instance.$data.title = title;
  instance.$data.message = message;
  instance.$data.buttons = buttons;
  instance.$data.callback = callback;
  instance.$mount();
  document.body.appendChild(instance.$el);
};

Vue.use(Vuex);

(window as any).store = new Vuex.Store({
  state: {
    active: '',
    repos: {},
  } as State,
  mutations: {
    active(state, key: string) {
      state.active = key;
      localStorage.setItem('active', key);
    },
    load(state, repos: {[key: string]: Repo}) {
      state.repos = repos;
    },
    new(state, data: {key: string, repo: Repo}) {
      const repos = JSON.parse(JSON.stringify(state.repos));
      repos[data.key] = data.repo;
      state.repos = repos;
      localStorage.setItem('repos', JSON.stringify(state.repos));
    },
    set(state, data: {repo: string, key: string, data: any}) {
      const repos = JSON.parse(JSON.stringify(state.repos));
      repos[data.repo][data.key] = data.data;
      state.repos = repos;
      localStorage.setItem('repos', JSON.stringify(state.repos));
    },
  },
  actions: {
    load(context) {
      context.commit('load', JSON.parse(localStorage.getItem('repos') || '{}') || {});
      context.commit('active', localStorage.getItem('active') || '');
    },
  },
});

new Vue({
  render: (h) => h(App),
  mounted() {
    (window as any).store.dispatch('load');
  },
}).$mount('#app');

import fs from 'fs';
import path from 'path';
import { State, Repo } from './store';

(window as any).getArmaDir = () => {
  const arma3dir = localStorage.getItem('arma3dir');
  if (arma3dir === 'null' || arma3dir === null) {
    fs.exists('C:\\Program Files (x86)\\Sdteam\\steamapps\\common\\Arma 3\\', (exists) => {
      if (exists) {
        localStorage.setItem('arma3dir', 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Arma 3\\');
      } else {
        (window as any).createDialog(
          'Arma 3 Not Detected',
          'The Arma 3 Directory was not able to automatically detected. You will need to locate it manually.',
          () => { return; },
          [
            {
              text: 'Locate',
              style: '',
              callback() {
                remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
                  properties: ['openDirectory'],
                }, (dir) => {
                  localStorage.setItem('arma3dir', dir[0]);
                  return (window as any).getArmaDir();
                });
              },
            },
          ],
          false,
        );
      }
    });
  } else {
    fs.exists(path.join(arma3dir!, 'arma3_x64.exe'), (exists) => {
      if (!exists) {
        (window as any).createDialog(
          'Arma 3 Not Detected',
          'Arma 3 was not detected in the provided directory. Please select the Arma 3 Directory containing arma3.exe.',
          () => { return; },
          [
            {
              text: 'Locate',
              style: '',
              callback() {
                remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
                  properties: ['openDirectory'],
                }, (dir) => {
                  localStorage.setItem('arma3dir', dir[0]);
                  return (window as any).getArmaDir();
                });
              },
            },
          ],
          false,
        );
      } else {
        return arma3dir!;
      }
    });
  }
};
(window as any).getArmaDir();
