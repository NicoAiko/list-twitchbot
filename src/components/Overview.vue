<template>
  <v-layout fluid fill-height row justify-center align-top>
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
      <v-text-field label="Name" v-model="input"></v-text-field>
      <v-btn color="success" @click="addToList">Add</v-btn>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Client } from '../classes/Client';
import { Notification } from 'electron';

@Component
export default class Overview extends Vue {
  @Prop()
  private client!: Client;
  private input: string;

  constructor() {
    super();
    this.input = '';
  }

  get listNames() {
    return this.client.getUserlist().getList();
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
      // tslint:disable-next-line no-unused-expression
      new Notification({
        title: 'Error',
        body: error,
      });
    }
  }
}
</script>
