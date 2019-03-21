<template>
  <div class="community-list">
    <template v-for="community in communities">
      <div class="community" :key="community.url" :class="(active == community.url) ? 'active' : ''">
        <a @click="select(community.url)">
          <img :src="community.image" width="100%" height="100%" />
        </a>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class CommunityList extends Vue {
  active =  '';
  communities = [{
    url: 'https://repo.synixe.com/mods/',
    image: 'https://synixe.com/logo.png',
  }];
  select(url: string) {
    this.active = url;
    console.log(url);
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
    .community {
      background-color: #6b6e70;
      width: 4em;
      height: 4em;
      margin-left: auto;
      margin-right: auto;
      padding: 0px;
      border-radius: 1em;
      transition: border-radius 0.5s;
      transition: background-color 0.5s;
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
    }
    
  }
</style>
