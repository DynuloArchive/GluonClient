<template>
  <div class="content">
    <template v-if="active === undefined || active === 0">
      <h1>No Repos!</h1>
      <p>Use the + button in the bottom left to add your first repo.</p>
    </template>
    <template v-else>
      <h1>{{active.name}}</h1>
      <span class="dir" @click="selectDir">{{dir}}</span>
      <div class="download" @click="download" v-if="allSet">
        <i :class="'fas fa-download ' + ((down) ? 'active' : '')"></i>
        <i :class="'fas fa-play ' + ((down) ? '' : 'active')"></i>
      </div>
      <template v-for="server in active.servers">
        <div class="server" :key="server.address">
          {{server.name}}
          <span class="launch">Join</span>
        </div>
      </template>
      <div ref="output" class="output"></div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import {remote} from 'electron';

import os from 'os';
const pty = remote.require('node-pty');
import { Terminal } from 'xterm';

@Component
export default class Content extends Vue {
  @Prop(undefined) private active: any;

  mounted() {
    setTimeout(() => {
      const shell = os.platform() === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/bash';
      const ptyProcess = pty.spawn('./gluon', ['server'], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.cwd(),
        env: process.env
      } as any);
      const xterm = new Terminal({
        fontFamily: 'Fira Code, Iosevka, monospace',
        fontSize: 12,
        experimentalCharAtlas: 'dynamic'
      });
      //xterm.open(this.$refs.output);
      xterm.open(this.$refs.output as HTMLElement);
      xterm.on('data', (data: any) => {
        ptyProcess.write(data);
      });
      ptyProcess.on('data', function (data: any) {
        xterm.write(data);
      });
    }, 200);
  }

  private down = true;
  private allSet = false;
  private dir = localStorage.getItem(this.active.url + '.dir') || '';
  public download() {
    this.down = false;
  }

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
        () => { return; },
        [
            {
              text: 'Select',
              style: '',
              callback: comp.selectDir,
            },
          ],
        false,
      );
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
  width: calc(100% - 6em);
  height: calc(100% - 1.7em);
  padding-left: 1em;
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
      &.active {
        opacity: 1;
      }
    }
  }
}
</style>
