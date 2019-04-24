<template>
  <div class="frame">
    <h3>Gluon&nbsp;<small>{{version}}</small></h3>
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
  private version = require('electron').remote.app.getVersion();

  private close() {
    const remote = require('electron').remote;
    remote.getCurrentWindow().close();
  }
  private minimize() {
    const remote = require('electron').remote;
    remote.getCurrentWindow().minimize();
  }
}
</script>

<style lang="scss" scoped>
  h3 {
    margin-top: 0;
    line-height: 1.6em;
    small {
      line-height: 1.6em;
      font-size: 0.5em;
    }
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
    z-index: 2;
    .buttons {
      position: fixed;
      top: 0;
      right: 0.6em;
      height: 1.7em;
      * {
        border-radius: 50%;
        -webkit-app-region: no-drag;
        width: 1.3em;
        height: 1.3em;
        top: calc((1.7em - 1.3em) / 2);
      }
      .close {
        transition: background-color 0.2s;
        background-color: #790f24;
        position: fixed;
        right: 0.5em;
        &:hover {
          background-color: #c00b2f;
        }
      }
      .minimize {
        background-color: #474b4f;
        right: 2.3em;
        position: fixed;
      }
    }
  }
</style>
