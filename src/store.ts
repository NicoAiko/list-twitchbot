import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { RootState } from './types';

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
  state: {
    username: '',
    password: '',
    channel: '',
    discord: '',
    twitter: '',
    friendCode: '',
    youtube: '',
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
    setDiscord(state, payload: string) {
      state.discord = payload;
    },
    setTwitter(state, payload: string) {
      state.twitter = payload;
    },
    setFriendCode(state, payload: string) {
      state.friendCode = payload;
    },
    setYoutube(state, payload: string) {
      state.youtube = payload;
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
    setDiscord({ commit }, payload: string) {
      commit('setDiscord', payload);
    },
    setTwitter({ commit }, payload: string) {
      commit('setTwitter', payload);
    },
    setFriendCode({ commit }, payload: string) {
      commit('setFriendCode', payload);
    },
    setYoutube({ commit }, payload: string) {
      commit('setYoutube', payload);
    },
  },
  getters: {
    getUsername: (state) => state.username,
    getPassword: (state) => state.password,
    getChannel: (state) => state.channel,
    getDiscord: (state) => state.discord,
    getTwitter: (state) => state.twitter,
    getYoutube: (state) => state.youtube,
    getFriendCode: (state) => state.friendCode,
  },
};

export default new Vuex.Store<RootState>(store);
