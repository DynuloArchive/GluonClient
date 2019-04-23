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
import { Repo } from '../store';

@Component
export default class Content extends Vue {
  @Prop(undefined) private repo: any;

  private store = (window as any).store;

  private ws: any = undefined;
  private stage = 'cmd';
  private queue = 0;

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

  protected mounted() {
    const vm = this;

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
      vm.ws = new WebSocket('ws://localhost:51462');
      (vm.ws as WebSocket).onmessage = (event) => {
        console.log(event.data, vm.stage);
        if (!isNaN(parseInt(event.data, 10))) {
          console.log('version:', event.data);
          let check = () => {
            if (vm.repo.dir !== '' && vm.repo.dir !== undefined) {
              vm.stage = 'cmd';
              vm.ws.send('dir');
            } else {
              setTimeout(check, 250);
            }
          }
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
                let queue = event.data.split(' ')[1];
                if (queue === "0") {
                  vm.stage = 'ready'
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
            let queue = event.data.split(' ')[1];
            if (queue === "0") {
              console.log("Launching Arma");
            } else {
              vm.stage = 'cmd';
            }
          }
        }
      }
    }, 500);
  }

  public download() {
    this.stage = 'down';
    this.ws.send('fetch');
  }

  public launch() {
    if (this.stage === 'ready') {
      this.ws.send('verify');
    }
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
