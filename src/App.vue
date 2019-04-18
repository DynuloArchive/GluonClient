<template>
  <div id="app">
    <Frame/>
    <CommunityList/>
    <template v-for="repo in state.repos">
      <Content :key="repo.url" :repo="repo" :style="(state.active === repo.url) ? '' : 'display:none'"/>
    </template>
    <Shell/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Frame from './components/Frame.vue';
import Content from './components/Content.vue';
import CommunityList from './components/CommunityList.vue';

import Shell from './components/Shell.vue';

import { State } from './store';

@Component({
  components: {
    Frame,
    Content,
    CommunityList,
    Shell,
  },
})
export default class App extends Vue {
  public showTerm: boolean = false;
  private state: State = (window as any).store.state;
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: #2c3e50;
  height: 100%;
}
</style>
