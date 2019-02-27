import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { RootState } from './types';

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
  state: {
    username: '',
    password: '',
    channel: '',
  },
  mutations: {
    setUsername(state, payload: string) {
      state.username = payload;
    },
    setPassword(state, payload: string) {
      state.password = payload;
    },
    setChannel(state, payload: string) {
      state.channel = payload;
    },
  },
  actions: {
    setUsername({ commit }, payload: string) {
      commit('setUsername', payload);
    },
    setPassword({ commit }, payload: string) {
      commit('setPassword', payload);
    },
    setChannel({ commit }, payload: string) {
      commit('setChannel', payload);
    },
  },
  getters: {
    getUsername: (state) => state.username,
    getPassword: (state) => state.password,
    getChannel: (state) => state.channel,
  },
};

export default new Vuex.Store<RootState>(store);
