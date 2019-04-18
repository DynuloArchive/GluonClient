<template>
  <div :style="($parent.showTerm) ? '' : 'display: none'" class="wrapper">
    <div class="output"><pre>{{output}}</pre></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import {remote} from 'electron';

import os from 'os';
import spawn from 'child_process';
import { TextDecoder } from 'util';

@Component
export default class Shell extends Vue {
  @Prop(undefined) private active: any;

  private output = '';

  private mounted() {
    const command = spawn.spawn('./gluon', ['server']);
    const decoder = new TextDecoder('utf-8');
    command.stdout!.on('data', (data) => {
      this.output += decoder.decode(data);
    });
  }
}
</script>

<style lang="scss" scoped>
  .wrapper {
    z-index: 1;
    position: fixed;
    left: 5em;
    top: 1.7em;
    width: calc(100% - 5em);
    height: calc(100% - 1.7em);
    background-color: black;
    overflow-y: scroll;
    .output {
      color: white;
      padding: 1em;
    }
  }
</style>
