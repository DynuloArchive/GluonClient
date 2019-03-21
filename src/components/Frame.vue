<template>
  <div class="frame">
    <h3>Gluon</h3>
    <div class="buttons">
      <div class="close" @click="close"></div>
      <div class="minimize" @click="minimize"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Frame extends Vue {
  close() {
    const remote = require('electron').remote;
    remote.getCurrentWindow().close();
  }
  minimize() {
    const remote = require('electron').remote;
    remote.getCurrentWindow().minimize();
  }
}
</script>

<style lang="scss" scoped>
  h3 {
    margin-top: 0;
    line-height: 1.6em;
  }
  .frame {
    -webkit-app-region: drag;
    background-color: #29648A;
    color: #b4c5c5;
    height: 1.7em;
    left: 5rem;
    padding-left: 1em;
    position: fixed;
    top: 0;
    width: calc(100% - 5em);
    .buttons {
      position: fixed;
      top: 0;
      right: 0.6em;
      height: 1.7em;
      .close {
        -webkit-app-region: no-drag;
        background-color: #790f24;
        width: 1.3em;
        height: 1.3em;
        top: calc((1.7em - 1.3em) / 2);
        position: relative;
        &:hover {
          background-color: #ff1744;
        }
      }
      .minimize {
        -webkit-app-region: no-drag;
        background-color: #474b4f;
        width: 1.3em;
        height: 1.3em;
        top: calc((1.7em - 1.3em) / 2);
        right: 2.4em;
        position: fixed;
      }
    }
  }
</style>
