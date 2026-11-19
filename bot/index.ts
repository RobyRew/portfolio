import { tr, type BotModule, type Lang } from '@robyrew/bot-sdk'

const help: Record<Lang, string> = {
  en: 'Links for the portfolio and RobyRew ID. Nothing is edited from chat.',
  ro: 'Linkuri pentru portofoliu și RobyRew ID. Din chat nu se editează nimic.',
  es: 'Enlaces del portfolio y de RobyRew ID. Desde el chat no se edita nada.',
}

export const meModule: BotModule = {
  id: 'me',
  commands: ['me'],
  bucket: 'lookup',
  signIn: 'no',
  menu: (lang) => tr(lang, { en: 'Me', ro: 'Eu', es: 'Yo' }),
  help: (lang) => help[lang],
  async handle(input) {
    return {
      kind: 'text',
      text: help[input.lang],
      links: [
        { url: 'https://cosmincalin.es', label: 'cosmincalin.es' },
        { url: 'https://id.robyrew.com', label: 'RobyRew ID' },
      ],
    }
  },
}
