import ActionCardDistributionSchema from '@/services/enum/ActionCardDistributionSchema'
import CardName from '@/services/enum/CardName'
import DifficultyLevel from '@/services/enum/DifficultyLevel'
import PlayerColor from '@/services/enum/PlayerColor'
import { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore, Store } from 'vuex'

const LOCALSTORAGE_KEY = process.env.VUE_APP_LOCALSTORAGE_KEY_PREFIX + "store"

export interface State {
  language: string
  baseFontSize: number
  setup: Setup
  rounds: Round[]
}
export interface Setup {
  playerSetup: PlayerSetup
  difficultyLevel: DifficultyLevel
  zooMap?: string
  actionCardDistribution: ActionCardDistributionSchema
}
export interface PlayerSetup {
  playerCount: number
  botCount: number
  playerColors: PlayerColor[]
}
export interface Round {
  round: number
  botRound: BotRound[]
}
export interface BotRound {
  round: number
  bot: number
  cardSlots: CardSlotsPersistence
  slotNumber: number
  tokenScoringCardCount: number
  tokenNotepadCount: number
  appealCount?: number
}
export interface CardSlotsPersistence {
  slots: CardName[]
  upgradedCards: CardName[]
}

declare module '@vue/runtime-core' {
  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $store: Store<State>
  }
}

export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: {
    language: "en",
    baseFontSize: 1.0,
    setup: {
      playerSetup: {
        playerCount: 1,
        botCount: 1,
        playerColors: [PlayerColor.BLUE,PlayerColor.RED,PlayerColor.YELLOW,PlayerColor.BLACK]
      },
      difficultyLevel: DifficultyLevel.L1_BEGINNER,
      actionCardDistribution: ActionCardDistributionSchema.P0_25_25_25_25
    },
    rounds: []
  },
  mutations: {
    // reload state from local storage
    initialiseStore(state) {
      const localStorageCache = localStorage.getItem(LOCALSTORAGE_KEY)
      if (localStorageCache) {
        this.replaceState(Object.assign(state, JSON.parse(localStorageCache)));
      }
    },
    language(state : State, language: string) {
      state.language = language
    },
    setupPlayer(state : State, playerSetup: PlayerSetup) {
      state.setup.playerSetup = playerSetup
    },
    setupDifficultyLevel(state : State, level: number) {
      state.setup.difficultyLevel = level
    },
    setupActionCardDistribution(state : State, schema: ActionCardDistributionSchema) {
      state.setup.actionCardDistribution = schema
    },
    setupZooMap(state : State, zooMap: string) {
      state.setup.zooMap = zooMap
    },
    round(state : State, botRound : BotRound) {
      let round = state.rounds[botRound.round - 1]
      if (!round) {
        round = {
          round : botRound.round,
          botRound: []
        }
      }
      round.botRound[botRound.bot - 1] = botRound
      state.rounds[botRound.round - 1] = round
    },
    endGame(state : State) {
      state.rounds = []
    },
    zoomFontSize(state : State, baseFontSize: number) {
      state.baseFontSize = baseFontSize
    }
  }
})

store.subscribe((_mutation, state) => {
	// store state asJSON string in local storage
	localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
})

// define your own `useStore` composition function
export function useStore() : Store<State> {
  return baseUseStore(key)
}
