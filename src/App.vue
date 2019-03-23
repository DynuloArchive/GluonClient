<template>
  <div id="app">
    <Frame/>
    <CommunityList/>
    <Content :active="active"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Frame from './components/Frame.vue';
import Content from './components/Content.vue';
import CommunityList from './components/CommunityList.vue';

@Component({
  components: {
    Frame,
    Content,
    CommunityList,
  },
})
export default class App extends Vue {
  public active: any = 0;
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
