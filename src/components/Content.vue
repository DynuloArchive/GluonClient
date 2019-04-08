<template>
  <div class="content">
    <template v-if="active === undefined || active === 0">
      <h1>No Repos!</h1>
      <p>Use the + button in the bottom left to add your first repo.</p>
    </template>
    <template v-else>
      <h1>{{active.name}}</h1>
      <span class="dir">{{dir}}</span>
      <div class="download" @click="download" v-if="ready">
        <i :class="'fas fa-download ' + ((down) ? 'active' : '')"></i>
        <i :class="'fas fa-rocket ' + ((down) ? '' : 'active')"></i>
      </div>
      <template v-for="server in active.servers">
        <div class="server" :key="server.address">
          {{server.name}}
          <span class="button launch"><i class="fas fa-play"></i> Join</span>
        </div>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import {remote} from 'electron';

@Component
export default class Content extends Vue {
  @Prop(undefined) private active: any;

  private down = true;
  private dir = localStorage.getItem(this.active.url + '.dir') || '';

  private ws: any = undefined;
  private ready = false;
  private stage = 'cmd';
  private queue = 0;

  private selectDir() {
    remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
      properties: ['openDirectory'],
    }, (dir) => {
      localStorage.setItem(this.active.url + '.dir', dir[0]);
      this.dir = dir[0];
    });
  }

  @Watch('active')
  private onActiveChanged(val: any, old: any) {
    if (this.active === undefined) { return; }
    this.dir = localStorage.getItem(this.active.url + '.dir') || '';
    const comp = this;
    if (this.dir === '') {
      (window as any).createDialog(
        'Repo Directory',
        'Select a download directory for the mods in this repo.',
        () => { this.verify(); },
        [
            {
              text: 'Select',
              style: '',
              callback: comp.selectDir,
            },
          ],
        false,
      );
    } else {
      this.verify();
    }
  }

  protected mounted() {
    // TODO check gluon server version
    const vm = this;
    setTimeout(() => {
      vm.ws = new WebSocket('ws://localhost:51462');
      (vm.ws as WebSocket).onmessage = (event) => {
        console.log(event.data);
        if (vm.stage === 'cmd') {
          switch (event.data) {
            case 'dir':
              vm.ws.send(vm.dir);
              break;
            case 'url':
              vm.ws.send(vm.active.url);
              break;
            case 'cmd':
              vm.ws.send('verify');
              break;
            default:
              if (event.data.startsWith('Q')) {
                let queue = event.data.split(' ')[1];
                vm.ready = true;
                if (queue === "0") {
                  vm.down = false;
                } else {
                  vm.queue = queue;
                }
              }
          }
        } else if (vm.stage === 'down') {
          if (event.data === 'Done') {
            vm.down = false;
          } else {

          }
        }
      }
    }, 500);
  }

  private verify() {
    const vm = this;
    let check = () => {
      if (vm.ws !== undefined) {
        this.ws.send('dir');
      } else {
        setTimeout(check, 250);
      }
    }
    check();
  }

  public download() {
    this.stage = 'down';
    this.ws.send('fetch');
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
      opacity: 0;
      transition: opacity 0.2s;
      position: absolute;
      top: 0;
      right: 0;
      font-size: 1.5rem;
      cursor: pointer;
      &.active {
        opacity: 1;
      }
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
