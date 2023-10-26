<template lang="pug">
.relative
  input.bg-gray-700.text-white.rounded-lg.py-2.px-3(class="w-full focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent", type="text", placeholder="Выберите матч", v-model="inputedName" @click="chooseMatch()")
  .search-results.custom-scrollbar.my-5.bg-gray-700.rounded-lg.text-white(ref="searchResults", v-if="gotResult", class="")
    ul#results-list
      li(v-for="(match, idx) in searchedTeamMatches" :key="match.matchId" class="bg-gray-700 hover:bg-gray-600 transition" @click="selectItem(idx)")
        | {{ match.opponent }}<br>
        | <span class="text-sm">{{ match.score }}</span>
</template>

<script>
export default {
  name: 'ChoseMatch',
  props: {
    teamId: {
      type: Number,
      required: true,
      default: 0,
    },
    teamName: {
      type: String,
      required: true,
      default: '',
    },
    tournamentId: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  data() {
    return {
      inputedName: '',
      searchedTeamMatches: [],
      gotResult: false,
      selectedId: 0,
      selectedName: '',
      choosenMatchInfo: {},
    }
  },
  watch: {
    inputedName() {
      // filter data in searchedTeamMatches, поэтому данные какие-то должны быть. Чистить массив нельзя. Надо проверять, если ли в этом массиве данные и произошли ли изменения в teamId (изменил ли пользователь команду).
      // если изменил, то тогда еще раз стучимся запросом в сервер
    },
  },
  // mounted() {
  //   this.selectedId = localStorage.getItem('selectedId') ?? 0
  //   this.selectedName = localStorage.getItem('selectedName') ?? ''
  //   if (this.selectedId ?? this.selectedName) this.emitSelectedItem()
  // },
  methods: {
    async chooseMatch() {
      console.log(this.teamId)
      console.log(this.$store.state.teamId)
      if (this.searchedTeamMatches.length === 0 || this.teamId !== this.$store.state.teamId) {

        try {
          this.searchedTeamMatches = []
          for (let i = 0; i < 2; i++) {
            const response = await this.$axios.get(
              `/api/v1/team/${this.teamId}/events/last/${i}`
            )
            const events = response.data.events.filter(event => event.tournament.uniqueTournament.id === 17 && event.status.type === 'finished')

            const searchedTeamMatches = []

            events.forEach(event => {
              const homeScore = Object.keys(event.homeScore).length !== 0 ? event.homeScore.normaltime : 0
              const awayScore = Object.keys(event.awayScore).length !== 0 ? event.awayScore.normaltime : 0

              if (event.homeTeam.name === this.teamName) {
                searchedTeamMatches.push({
                  opponent: event.awayTeam.name,
                  matchId: event.id,
                  score: `${homeScore} - ${awayScore}`
                })
              } else if (event.awayTeam.name === this.teamName) {
                searchedTeamMatches.push({
                  opponent: event.homeTeam.name,
                  matchId: event.id,
                  score: `${awayScore} - ${homeScore}`
                })
              }
            })

            searchedTeamMatches.reverse()

            this.searchedTeamMatches.push(...searchedTeamMatches)
            console.log(this.searchedTeamMatches)
            // [ {opponent: 'Brentford', matchId: 9576238, score: '1 - 4'}, {opponent: 'Southampton', matchId: 9576284, score: '6 - 0'} ]
          }

          // this.results = [...results] // [{"name":"Chelsea","id":38},{"name":"Manchester City","id":17}...]
        } catch (e) {
          console.log(e.response)
        }
      }

      this.gotResult = true
      setTimeout(() => {
        console.log(this.$refs.searchResults)
        this.searchModal('open')
      }, 100)
    },
    searchModal(action) {
      const list = this.$refs.searchResults
      action === 'open' ? list.classList.add('visible') : list.classList.remove('visible')
      console.log(action)
    },
    selectItem(index) {
      console.log(this.searchedTeamMatches[index])
      this.inputedName = this.searchedTeamMatches[index].opponent
      this.$emit('item-selected', {
        searchedTeamMatches: this.searchedTeamMatches[index]
      })
      // this.selectedId = this.searchedTeamMatches[index].id
      // this.selectedName = this.searchedTeamMatches[index].name
      // localStorage.setItem('selectedId', this.selectedId)
      // localStorage.setItem('selectedName', this.selectedName)
      this.searchModal('')

      // this.emitSelectedItem()
    },
    emitSelectedItem() {
      this.$emit('item-selected', {
        searchedTeamMatches: this.selectedId,
        name: this.selectedName
      })
    }
  },
}
</script>

<style lang="scss">
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  color: #ffffff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  z-index: 10;
  height: 300px;
  padding: 0 0 0 0;
  overflow-y: scroll;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;

  &.visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  li {
    padding: 4px 16px;
    cursor: pointer;
  }
}

.custom-scrollbar {
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  &::-webkit-scrollbar-track {
    border-radius: 100vh;
    background: rgba(100,116,139,.16);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(100,116,139,.5);
    border-radius: 100vh;
    border: 1px solid #f6f7ed0c;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 116, 139, 0.583);
  }
}
</style>
