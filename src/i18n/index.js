import Vue from 'vue'
import VueI18n from 'vue-i18n'

// ivew UI
import ivenUS from 'iview/dist/locale/en-US'
import ivviVN from 'iview/dist/locale/vi-VN'

// element UI
import elenUS from 'element-ui/lib/locale/lang/en'
import elviVN from 'element-ui/lib/locale/lang/vi'

Vue.use(VueI18n)

const languages = [
  {value: 'en-US', label: 'English', iv: ivenUS, el: elenUS},
  {value: 'vi-VN', label: 'Tiếng Việt', iv: ivviVN, el: elviVN}
]
const messages = {}

// combine admin and oj
for (let lang of languages) {
  let locale = lang.value
  let m = require(`./oj/${locale}`).m
  Object.assign(m, require(`./admin/${locale}`).m)
  let ui = Object.assign(lang.iv, lang.el)
  messages[locale] = Object.assign({m: m}, ui)
}
// load language packages
export default new VueI18n({
  locale: 'vi-VN',
  messages: messages
})

export {languages}
