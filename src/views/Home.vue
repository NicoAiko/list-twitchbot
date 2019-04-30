<template>
  <v-content>
    <v-container fluid grid-list-xl>
      <overview />
    </v-container>
  </v-content>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Overview from '@/components/Overview.vue';

@Component({
  components: {
    Overview,
  },
})
export default class Home extends Vue {}
</script>
