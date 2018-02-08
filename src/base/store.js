import Vuex from 'vuex';

export default function(Vue) {
  // install vuex
  Vue.use(Vuex);

  // store
  const store = new Vuex.Store({});

  // register module: auth
  const auth = require('./auth.js').default(Vue);
  auth.namespaced = true;
  store.registerModule('auth', auth);

  // mixin
  Vue.mixin({ beforeCreate() {

    const self = this;
    this.$local = {};

    Object.defineProperty(this.$local, 'state', {
      get() {
        const moduleInfo = self.moduleInfo;
        return self.$store.state[moduleInfo.pid][moduleInfo.name];
      },
    });

    Object.defineProperty(this.$local, 'getters', {
      get() {
        return function() {
          const moduleInfo = self.moduleInfo;
          return self.$store.getters[`${moduleInfo.pid}/${moduleInfo.name}/${arguments[0]}`];
        };
      },
    });

    [ 'commit', 'dispatch' ].forEach(key => {
      Vue.prototype.$meta.util.overrideProperty({
        obj: this.$local,
        key,
        objBase: this.$store,
        vueComponent: this,
        combilePath: (moduleInfo, arg) => {
          return `${moduleInfo.pid}/${moduleInfo.name}/${arg}`;
        },
      });
    });

  } });

  return store;
}

