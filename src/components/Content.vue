<template>
  <div class="content">
    <h1>{{repo.name}}</h1>
    <span class="dir" @click="selectDir">{{repo.dir}}</span>
    <div class="download">
      <template v-if="stage === 'cmd'">
        <i @click="download" class="fas fa-download"></i>
      </template>
      <template v-if="stage === 'down'">
        <i class="fas fa-circle-notch fa-spin"></i>
      </template>
      <template v-if="stage === 'ready'">
        <i @click="launch" class="fas fa-rocket"></i>
      </template>
    </div>
    <template v-for="server in repo.servers">
      <div class="server" :key="server.address">
        {{server.name}}
        <span class="button launch"><i class="fas fa-play"></i> Join</span>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { remote } from 'electron';
import { spawn, exec} from 'child_process';

import { Repo } from '../store';
import { join } from 'path';

function isRunning(win: string, nix: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const plat = process.platform;
    const cmd = (plat === 'win32') ? 'tasklist' : 'ps -ax | grep ' + nix;
    const proc = (plat === 'win32') ? win : nix;
    if (cmd === '' || proc === '') {
      resolve(false);
    }
    exec(cmd, (err, stdout, stderr) => {
      resolve(stdout.toLowerCase().indexOf(proc.toLowerCase()) > -1);
    });
  });
}

@Component
export default class Content extends Vue {
  @Prop(undefined) private repo: any;

  private store = (window as any).store;

  private ws: any = undefined;
  private stage = 'cmd';
  private queue = 0;

  public download() {
    this.stage = 'down';
    this.ws.send('fetch');
  }

  public launch() {
    if (this.stage === 'ready') {
      console.log('running verify');
      this.ws.send('verify');
    }
  }

  protected mounted() {
    const vm = this;

    fetch(this.repo.url + 'config.json').then((response: any) => {
      if (response.status !== 200) {
        (window as any).createDialog(
          'Repo Not Found',
          'This repository could not be reached, it will not be useable.',
        );
        return;
      }
      response.json().then((obj: any) => {
        obj.url = this.repo.url;
        obj.dir = this.repo.dir;
        this.store.commit('repo', {key: this.repo.url, repo: obj});
      });
    }).catch(() => {
      (window as any).createDialog(
        'Invalid Address',
        'No server could be reached at the address',
      );
    });

    if (this.repo.dir === '' || this.repo.dir === undefined) {
      (window as any).createDialog(
        'Repo Directory',
        'Select a download directory for the mods in this repo.',
        () => { },
        [
          {
            text: 'Select',
            style: '',
            callback: vm.selectDir,
          },
        ],
        false,
      );
    }

    // TODO check gluon server version
    if (vm.ws !== undefined) { return; }
    setTimeout(() => {
      console.log('creating socket');
      vm.ws = new WebSocket('ws://localhost:51462');
      (vm.ws as WebSocket).onmessage = (event) => {
        console.log(event.data, vm.stage);
        if (!isNaN(parseInt(event.data, 10))) {
          console.log('version:', event.data);
          const check = () => {
            if (vm.repo.dir !== '' && vm.repo.dir !== undefined) {
              vm.stage = 'cmd';
              vm.ws.send('dir');
            } else {
              setTimeout(check, 250);
            }
          };
          check();
          return;
        }
        if (vm.stage === 'cmd') {
          switch (event.data) {
            case 'dir':
              vm.ws.send(vm.repo.dir);
              break;
            case 'url':
              vm.ws.send(vm.repo.url);
              break;
            case 'cmd':
              vm.ws.send('verify');
              break;
            default:
              if (event.data.startsWith('Q')) {
                const queue = event.data.split(' ')[1];
                if (queue === '0') {
                  vm.stage = 'ready';
                } else {
                  vm.queue = queue;
                  vm.stage = 'cmd';
                }
              }
          }
        } else if (vm.stage === 'down') {
          if (event.data === 'Done') {
            vm.stage = 'ready';
          } else {

          }
        } else if (vm.stage === 'ready') {
          if (event.data.startsWith('Q')) {
            const queue = event.data.split(' ')[1];
            if (queue === '0') {
              isRunning('arma3_x64.exe', 'arma3_x64.exe').then((running) => {
                console.log('Launching Arma');
                console.log(join(localStorage.getItem('arma3dir')!, 'arma3_x64.exe'));
                let mods = '-mod=';
                Object.values((this.repo as Repo).mods).forEach((mod) => {
                  mods += join(this.repo.dir, mod.path) + ';';
                });
                console.log(mods);
                const armap = spawn(join(localStorage.getItem('arma3dir')!, 'arma3_x64.exe'), [mods], {
                  cwd: localStorage.getItem('arma3dir')!,
                  detached: true,
                });
                armap.unref();
                vm.stage = 'cmd';
              });
            } else {
              vm.stage = 'cmd';
            }
          }
        }
      };
    }, 500);
  }

  private selectDir() {
    remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
      properties: ['openDirectory'],
    }, (dir) => {
      localStorage.setItem(this.repo.url + '.dir', dir[0]);
      this.store.commit('set', {repo: this.repo.url, key: 'dir', data: dir[0]});
      this.stage = 'cmd';
      this.ws.send('verify');
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.content {
  color: #b4c5c5;
  background: #222629;
  position: fixed;
  left: 5em;
  top: 1.7em;
  width: calc(100% - 7em);
  height: calc(100% - 1.7em);
  padding-left: 1em;
  padding-right: 1em;
  z-index: 1;
  .dir {
    position: absolute;
    top: 4.6em;
    font-size: 0.8em;
    color: gray;
    cursor: pointer;
  }
  .download {
    width: 1.5em;
    height: 1em;
    position: absolute;
    top: 1.8em;
    right: 3em;
    color: white;
    i {
      position: absolute;
      top: 0;
      right: 0;
      font-size: 1.5rem;
    }
    i::before {
      cursor: pointer;
    }
  }
  .server {
    height: 3rem;
    line-height: 3rem;
    .launch {
      float: right;
      line-height: 1.15rem;
    }
  }
}
</style>
