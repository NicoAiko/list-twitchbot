<template>
  <v-layout fluid fill-height row wrap justify-center align-top>
    <v-flex xs9>
      <v-card>
        <v-list subheader>
          <v-subheader>Waiting Queue</v-subheader>
          <v-list-tile v-show="listNames.length" v-for="(listName, index) in listNames" :key="listName">
            <v-list-tile-content>
              <v-list-tile-title>{{ listName }}</v-list-tile-title>
            </v-list-tile-content>

            <v-list-tile-action v-if="index > 0">
              <v-icon color="info" @click="moveUp(listName, index)">arrow_upward</v-icon>
            </v-list-tile-action>

            <v-list-tile-action>
              <v-icon color="red" @click="removeFromList(listName)">remove</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-flex>

    <v-flex xs3>
      <v-text-field dark label="Name" v-model="input"></v-text-field>
      <v-text-field dark label="Arena ID" v-model="arenaIDInput" @change="updateArena"></v-text-field>
      <v-text-field dark label="Arena Password" v-model="arenaPasswordInput" @change="updateArena"></v-text-field>
      <v-btn color="success" @click="addToList">Add</v-btn>
    </v-flex>
    <v-snackbar
      v-model="snackbar"
      bottom
      :timeout="5000"
    >
      {{ snackbarText }}
      <v-btn
        color="pink"
        flat
        @click="snackbar = false"
      >
        Close
      </v-btn>
    </v-snackbar>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';
import { Client } from '../classes/Client';

@Component
export default class Overview extends Vue {
  private client: Client;
  private input: string;
  private arenaIDInput: string;
  private arenaPasswordInput: string;
  private snackbar: boolean = false;
  private snackbarText: string = '';
  private username: string;
  private password: string;
  private channel: string;

  constructor() {
    super();
    this.input = '';
    this.arenaIDInput = '';
    this.arenaPasswordInput = '';
    this.username = process.env.VUE_APP_USERNAME as string;
    this.password = process.env.VUE_APP_PASSWORD as string;
    this.channel = process.env.VUE_APP_CHANNEL as string;
    this.client = new Client({
      username: this.username,
      password: this.password,
      channel: this.channel,
    });
    this.client.connect();
  }

  get listNames() {
    return this.client.getUserlist().getList();
  }

  get arenaId() {
    return this.client.getArenaId();
  }

  get arenaPassword() {
    return this.client.getArenaPassword();
  }

  private updateArena() {
    this.client.setArenaData(this.arenaIDInput, this.arenaPasswordInput);
  }

  private showSnackbar(text: string): void {
    this.snackbarText = text;
    this.snackbar = true;
  }

  private addToList() {
    if (!this.input.length) {
      return;
    }

    this.client.getUserlist().add(this.input);
  }

  private removeFromList(username: string) {
    this.client.getUserlist().remove(username);
  }

  private moveUp(username: string, index: number) {
    try {
      const temp = this.client.getUserlist().getList()[index - 1];
      this.client.getUserlist().getList()[index - 1] = username;
      this.client.getUserlist().getList()[index] = temp;
      this.$forceUpdate();
    } catch (error) {
      // tslint:disable-next-line no-console
      console.error(error);
    }
  }
}
</script>
