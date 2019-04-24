<template>
  <div class="community-list">
    <template v-for="community in state.repos">
      <div class="community" :key="community.url" :class="(state.active == community.url) ? 'active' : ''">
        <a @click="select(community)">
          <img :src="community.url + '/repo.png'" width="100%" height="100%" />
        </a>
      </div>
    </template>
    <div :class="'add ' + ((expand) ? 'expand' : '')">
      <div class="left-cover" @click="toggle">
        <div :class="'btn icon ' + ((expand) ? 'remove' : 'plus') + ' ' + ((fetching) ? 'spin' : '')"></div>
      </div>
      <input type="text" ref="address" placeholder="https://" @keydown.enter="lookup" @keyup="type"/>
    </div>
    <div class="actions" v-if="expand && actioning">
      <template v-for="(f, action) in actions">
        <span :key="action" v-if="action.startsWith(command)">
          {{action}}<br/>
        </span>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { State } from '../store';

@Component({})
export default class CommunityList extends Vue {
  private expand = false;
  private fetching = false;
  private actioning = false;
  private command = '';
  private store = (window as any).store;
  private state: State = (window as any).store.state;
  private actions: {[key: string]: () => void} = {
    arma3: () => {
      localStorage.setItem('arma3dir', '');
      (window as any).getArmaDir();
    },
    devtools: () => { require('remote').getCurrentWindow().toggleDevTools(); },
    reload: () => { location.reload(); },
    term: () => { (this.$parent as any).showTerm = !(this.$parent as any).showTerm; },
  };
  public select(sel: any) {
    this.store.commit('active', sel.url);
  }
  public toggle() {
    this.expand = !this.expand;
    if (this.expand) {
      setTimeout(() => {
        (this.$refs.address as HTMLInputElement).focus();
      }, 200);
    }
  }
  protected mounted() {
    window.addEventListener('keydown', (ev) => {
      if (!this.expand && ev.key === 'z' && ev.ctrlKey) {
        ev.preventDefault();
        this.expand = true;
        (this.$refs.address as HTMLInputElement).value = ':';
        this.type();
        setTimeout(() => {
          (this.$refs.address as HTMLInputElement).focus();
        }, 200);
      } else if (ev.key === 'Escape') {
        this.expand = false;
      }
    });
  }
  private type() {
    Vue.nextTick(() => {
      const text = (this.$refs.address as HTMLInputElement).value;
      if (text.startsWith(':')) {
        this.actioning = true;
        this.command = text.substr(1);
      } else {
        this.actioning = false;
      }
    });
  }
  private lookup() {
    if (this.fetching) { return; }
    let address = (this.$refs.address as HTMLInputElement).value;
    if (address.startsWith(':')) {
      const cmd = address.substr(1);
      if (cmd in this.actions) {
        this.fetching = true;
        this.expand = false;
        (this.$refs.address as HTMLInputElement).value = '';
        this.actions[cmd]();
        this.fetching = false;
      }
      return;
    }
    (this.$refs.address as HTMLInputElement).blur();
    const comp = this;
    this.fetching = true;
    if (!address.startsWith('http')) {
      address = 'https://' + address;
    }
    if (!address.endsWith('/')) {
      address += '/';
    }
    fetch(address + 'config.json').then((response: any) => {
      if (response.status !== 200) {
        (window as any).createDialog(
          'Repo Not Found',
          'A Gluon repository could not be found at that address',
          () => {
            setTimeout(() => {
              (this.$refs.address as HTMLInputElement).focus();
            }, 200);
          },
        );
        this.fetching = false;
        return;
      }
      response.json().then((obj: any) => {
        obj.url = address;
        this.store.commit('new', {key: address, repo: obj});
        this.fetching = false;
        this.expand = false;
        this.select(obj);
        (this.$refs.address as HTMLInputElement).value = '';
      });
    }).catch(() => {
      (window as any).createDialog(
        'Invalid Address',
        'No server could be reached at that address',
        () => {
          setTimeout(() => {
            (this.$refs.address as HTMLInputElement).focus();
          }, 200);
        },
      );
      this.fetching = false;
    });
  }
}
</script>

<style lang="scss" scoped>
  .community-list {
    background-color: #474b4f;
    width: 5em;
    height: 100%;
    position: fixed;
    left: 0;
    top: 0;
    padding-top: 0.5em;
    text-align: center;
    z-index: 2;
    .community {
      background-color: #6b6e70;
      width: 4em;
      height: 4em;
      padding: 0px;
      border-radius: 1em;
      transition: border-radius 0.5s;
      transition: background-color 0.5s;
      margin-left: auto;
      margin-right: auto;
      margin-bottom: 1em;
      img {
        padding: 0;
        margin: 0;
        border-radius: 1em;
        transition: border-radius 0.5s;
      }
      &.active {
        border-radius: 0.2em;
        background-color: #222629;
      }
      &:hover:not(.active) {
        border-radius: 0.7em;
        background-color: #29648A;
        cursor: pointer;
      }
      &:not(.active):not(:hover) {
        filter: grayscale(0.7)
      }
    }
    .add {
      color: white;
      font-size: 2em;
      background-color: rgb(24, 67, 95);
      height: 1em;
      width: 100%;
      line-height: 1em;
      position: absolute;
      bottom: 0.25em;
      left: 0;
      transition: all 0.2s ease-in-out;
      text-align: right;
      &.expand {
        width: 100vw;
        input {
          visibility: visible;
          opacity: 1;
        }
      }
      .left-cover {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 5rem;
        height: 1em;
        text-align: center;
        background-color: rgb(24, 67, 95);
        z-index: 2;
        cursor: pointer;
        .btn {
          position: relative;
          top: 0.2em;
          left: 0.8em;
          width: 10px;
          color: white;
          &.spin {
            animation-name: spin;
            animation-duration: 0.5s;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            transform-origin: 125% 125%;
          }
        }
      }
      input {
        border: none;
        width: calc(100vw - 5.5rem);
        height: 90%;
        position: absolute;
        bottom: 0;
        right: 0;
        visibility: hidden;
        opacity: 0;
        transition: visibility 0s, opacity 0.2s ease;
        transition-delay: 0.15s;
        background-color: rgba(0,0,0,0);
        color: white;
        font-size: 0.7em;
        z-index: 1;
        &:focus {
          outline-width: 0;
        }
      }
    }
    .actions {
      background-color: #29648A;
      position: absolute;
      bottom: 2.5rem;
      left: 5rem;
      width: 20rem;
      text-align: left;
      padding-left: 1rem;
      color: #b4c5c5;
    }
  }
  @keyframes spin {
    from {
      transform:rotate(0deg);
    }
    to {
      transform:rotate(360deg);
    }
  }
</style>
