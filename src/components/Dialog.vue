<template>
  <div v-if="show" class="modal" ref="modal">
    <div class="content">
      <h2>{{title}}</h2>
      <p>{{message}}</p>
      <div class="buttons">
        <template v-for="button in buttons">
          <div class="button" :key="button.text" @click="run(button.callback)">
            {{button.text}}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class GluonDialog extends Vue {
  public close = true;
  public show = true;
  public buttons: Array<{text: string, callback: () => any, style: string}> =  [];
  public title = '';
  public message = '';
  public callback = () => { return; };

  protected mounted() {
    const comp = this;
    window.onclick = (event) => {
      if (comp.close && event.target === comp.$refs.modal) {
        comp.done();
      }
    };
    document.onkeydown = (ev) => {
      ev.preventDefault();
      ev = ev || window.event;
      let isEscape = ev.keyCode === 27;
      if (!comp.close) { return; }
      if (!isEscape && 'key' in ev) {
        isEscape = (ev.key === 'Escape' || ev.key === 'Esc');
      }
      if (isEscape) {
        comp.done();
      }
  };
  }
  private done() {
    this.show = false;
    this.callback();
    Vue.nextTick(() => {
      this.$destroy();
    });
    document.onkeydown = null;
  }
  private run(f: () => any) {
    this.done();
    f();
  }
}
</script>

<style lang="scss" scoped>
  .modal {
    position: fixed;
    z-index: 5;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0,0,0,0.6);
    .content {
      text-align: center;
      background-color: #6b6e70;
      color: white;
      margin: 10% auto;
      width: 60%;
      font-family: 'Avenir', Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      * {
        margin: 0;
      }
      h2 {
        padding: 0 0.3em 0 0.3em;
      }
      p {
        padding: 0 0.3em 0.1em 0.3em;
      }
      .buttons {
        width: calc(100% - 2em);
        background-color: #6b6e70;
        height: 2em;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-end;
        padding-right: 1em;
        padding-left: 1em;
        .button {
          background-color: rgb(189, 187, 187);
          width: 5em;
          height: 1.4em;
          text-align: center;
          line-height: 1.4em;
          color: black;
          cursor: pointer;
        }
      }
    }
  }
</style>

