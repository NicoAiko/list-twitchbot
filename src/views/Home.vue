<template>
  <v-content>
    <v-container fluid grid-list-xl>
      <overview :client="client" />
    </v-container>
  </v-content>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Client } from '../classes/Client';
import Overview from '@/components/Overview.vue';

@Component({
  components: {
    Overview,
  },
})
export default class Home extends Vue {
  private client: Client;

  constructor() {
    super();

    const username = process.env.VUE_APP_USERNAME as string;
    const password = process.env.VUE_APP_PASSWORD as string;
    const channel = process.env.VUE_APP_CHANNEL as string;

    this.client = new Client({
      username,
      password,
      channel,
    });
  }
}
</script>
