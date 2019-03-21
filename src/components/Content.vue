<template>
  <div class="hello">
    <h1>Welcome to Gluon</h1>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Content extends Vue {
  @Prop() private msg!: string;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.hello {
  background: #222629;
  position: fixed;
  left: 5em;
  top: 1.7em;
  width: calc(100% - 6em);
  height: calc(100% - 1.7em);
  padding-left: 1em;
}
</style>
