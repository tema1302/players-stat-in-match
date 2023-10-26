<template lang="pug">
.container-fluid.min-h-screen
  .container.mx-auto.pt-5.px-2.relative
    button.hamburger(@click="toggleMenu")
      div.line1(:class="{'change': menuOpen}")
      div.line2(:class="{'change': menuOpen}")
      div.line3(:class="{'change': menuOpen}")
    transition(name="slide-fade")
      .mt-3(v-if="menuOpen", class="absolute z-10")
        .flex.flex-col(class="lg:flex-row justify-between items-start")
          FindId.mr-2(@item-selected="getSearchResult")
          .flex.justify-end(class="flex-col lg:flex-row")
            ChoseSeason.mr-2(v-if="teamId" class="mt-2 lg:mt-0" :teamId="teamId" @season-selected="getChosenSeason")
            ChoseMatch.mr-2(v-if="teamId && seasonData.id" class="mt-2 lg:mt-0" :teamId="teamId" :teamName="teamName" :tournamentId="tournamentId"  @item-selected="getChosenMatch")
            button.relative.button.inline-block.px-5.py-3.text-white.rounded-xl(v-if="matchInfo.matchId" class="bg-gray-700 hover:bg-gray-600 mt-2 lg:mt-0" :class="" @click="fetchSofaPlayersName") Получить стату

  .container.mx-auto.pt-10.relative
    .flex.justify-between.items-start
      //- EditStats(@selected-idxs="getSelectedStats")

    h1.text-5xl.text-center.text-white(v-if="teamName.length > 0") {{ teamName }} {{ matchInfo.score }} {{ matchInfo.opponent }}
  .stats-table-wrapper.custom-scrollbar.mx-auto.mt-12.p-3(ref="statsTable")
    .stats-table.stats-legend.cursor-pointer.mb-2.text-left.text-xs(:style="{ width: computedScrollWidth + 'px'}")
      .player.pl-1.pr-4.flex.flex-column.items-end.text-xs Игроки / players
      .cols-comparison.pl-1.pr-4.flex.flex-column.items-end(v-for="(statName, requestName, idx) in statNames" :key="idx" @click="sortByStat(requestName, sortOrder)")
        span.text-xs.text-white(v-for="(statRus, statEng, i) in statName", :key="i") {{ statRus }} / {{ statEng }}
        //- span(v-if="column.sorted && column.sortOrder === 'asc'")▲
        //- span(v-if="column.sorted && column.sortOrder === 'desc'")▼
    .stats-table.text-left.text-xs(v-for="(value, name, idx) in statNameAndPlayersNameAndValue.minutesPlayed" :key="idx", :style="{ width: computedScrollWidth + 'px'}")
      .player
        .py-2.pr-2 {{ name }}
      .cols-comparison.flex.items-center(v-if="isLoaded", v-for="(statName, requestName, i) in statNames" :key="i")
        //- .stat-legend.mx-1.py-3 {{ russStatName }}
        .stat-value.mx-1.py-2.px-3
          span.range {{ statNameAndPlayersNameAndValue[requestName][name] }}
            span.range-width(v-if="Object.keys(overallWidth).length > 0", :style="{ width: overallWidth[requestName][idx] + '%' }")
</template>



<script>
export default {
  name: 'IndexPage',
  data() {
    return {
      isLoaded: false,

      teamName: '',
      teamId: 0,
      seasonData: {
        name: '',
        year: '',
        id: 0
      },
      matchInfo: {
        matchId: 0,
        opponent: '',
        score: ''
      },

      visibleStats: [],
      menuOpen: false,

      sortOrder: 'asc',
      // team: '33', // tth
      // team: '35', // man utd
      // team: '39', // ньюкасл
      // team: '44', // ливерпуль
      // team: '17', // man city
      // team: '35', // man utd
      // team: '2829', // реал м
      // team: '1643', // лилль

      matchId: 10385513,
      seasonTeam: 41886,
      tournamentId: 17,

      playersDynamic: {},
      computedScrollWidth: 0,
      statNames: {
        minutesPlayed: { 'minutes': 'Минут', },
        touches: { touches: 'Касания (действия с мячом)', },
        totalPass: { 'total passes': 'Пасы', },
        accuratePass: { 'accurate passes': 'Успешные пасы', },
        keyPass: { 'key passes': 'Ключевые передачи', },
        bigChanceCreated: { 'big chances created': 'Созданные голевые моменты', },
        goalAssist: { 'assists': 'Ассисты', },
        shotOffTarget: { 'shots off target': 'Удары мимо ворот', },
        onTargetScoringAttempt: { 'shots on target': 'Удары в створ ворот', },
        blockedScoringAttempt: { 'blocked shots': 'Заблокир. удары', },
        bigChanceMissed: { 'big chances missed': 'Упущенные голевые моменты', },
        goals: { 'goals': 'Голы', },
        totalContest: { 'total dribble': 'Попытки дриблинга', },
        wonContest: { 'successful dribble': 'Успешный дриблинг', },
        totalLongBalls: { 'total long balls': 'Длинные передачи', },
        accurateLongBalls: { 'accurate long balls': 'Успешные длинные передачи', },
        totalCross: { 'total crosses': 'Навесы в штрафную', },
        accurateCross: { 'accurate crosses': 'Успешные навесы в штрафную', },
        aerialWon: { 'aerial dules won': 'Выиграно воздушных единоборств', },
        aerialLost: { 'aerial dules lost': 'Проиграно воздушных единоборств', },
        duelWon: { 'ground dules won': 'Выиграно наземных единоборств', },
        duelLost: { 'ground dules lost': 'Проиграно наземных единоборств', },
        interceptionWon: { 'interceptions': 'Перехваты', },
        totalTackle: { tackles: 'Отборы', },
        totalClearance: { 'clearances': 'Выносы', },
        // possessionLostCtrl: { 'possession lost': 'Потерей мяча', },

        // totalOffside: { 'total offside': 'Офсайды', },
      },
      // на выходе должны получать:
      // statNameAndPlayersNameAndValue: [
      // touches: {'Кепа': 30, 'Рюди': 74},
      // ...
      // ]
      statNameAndPlayersNameAndValue: {},
      playersInfoStats: {},
      tableNumbers: {},
      overallStatByMatch: {},

      teamInfoFotmob: {},
      statNamesFotmob: {
        'Accurate passes': 'Успешные пасы',
        'Expected goals (xG)': 'Ожидаемые голы',
        'Expected assists (xA)': 'Ожидаемые ассисты',
        'Shot accuracy': 'Успешные удары',
        'Successful dribbles': 'Успешный дриблинг',
        'Accurate long balls': 'Успешные длинные передачи',
        Recoveries: 'Возвраты мяча',
        'Tackles won': 'Успешные отборы',
        'Aerial duels won': 'Выиграно воздушных единоборств',
        'Ground duels won': 'Выиграно наземных единоборств',
      },

      start11Stats: {},
      benchOnFieldStats: {},
    }
  },
  computed: {
    overallWidth() {
      const rtn = {}
      const statNamesArr = Object.keys(this.statNames)
      for (const statName of statNamesArr) {
        const statValues = Object.values(this.statNameAndPlayersNameAndValue[statName])
        // console.log(statValues)
        const minValue = 20
        const maxValue = Math.max(...statValues)
        const statValuesPersentage = statValues.map((value) => {
          if (value === 0 || value === '') {
            return 0
          }
          const percentage = Math.round((value / maxValue) * 100)
          return Math.max(percentage, minValue)
        })
        // console.log(statValuesPersentage)
        // [100, 100, 100, 100, 100, 11, 100, 57, 43, 89, 33]
        rtn[statName] = statValuesPersentage
      }
      return rtn
    },
    changeVisibilityStats() {
      return this.visibleStats
    }
  },
  mounted() {
    // console.log(this.$refs.statsTable.scrollWidth)
    this.computedScrollWidth = this.$refs.statsTable.scrollWidth
    if (localStorage.getItem('dataForTable')) {
      this.statNameAndPlayersNameAndValue = JSON.parse(localStorage.getItem('dataForTable')) ?? {}
      this.isLoaded = true
    }
  },


  methods: {
    sortByStat(statName, sortOrder) {
      console.log('this.statNameAndPlayersNameAndValue0')
      console.log(this.statNameAndPlayersNameAndValue.accuratePass)
      const values = this.statNameAndPlayersNameAndValue[statName]
      const sortedValues = Object.entries(values).sort((a, b) => {
        const valueA = a[1]
        const valueB = b[1]
        return sortOrder === 'asc' ? valueB - valueA : valueA - valueB
      })
      console.log(sortedValues)

      const sortedMap = new Map(sortedValues)
      const sortedObject = Object.fromEntries(sortedMap)
      console.log(sortedObject)
      // Sort other properties based on statName
      // const statNameObj = this.statNameAndPlayersNameAndValue[statName]
      for (const propName in this.statNameAndPlayersNameAndValue) {
        if (propName !== statName && Object.prototype.hasOwnProperty.call(this.statNameAndPlayersNameAndValue, propName)) {
          const propObj = this.statNameAndPlayersNameAndValue[propName]
          const sortedPropObj = {}
          Object.keys(sortedObject).forEach(playerName => {
            if (playerName in propObj) {
              sortedPropObj[playerName] = propObj[playerName]
            }
          })
          this.statNameAndPlayersNameAndValue[propName] = sortedPropObj
        }
      }

      this.statNameAndPlayersNameAndValue[statName] = sortedObject

      console.log('this.statNameAndPlayersNameAndValue2')
      console.log(this.statNameAndPlayersNameAndValue.accuratePass)
      // localStorage.setItem('dataForTable', JSON.stringify(this.statNameAndPlayersNameAndValue))
      this.sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'
      this.$forceUpdate()
    },
    async getPrevMatch() {
      try {
        const response = await this.$axios.get(
          `/api/v1/team/${this.teamId}/events/last/0`
        )
        console.log(response.data.events)
      } catch (e) {
        console.error(e.response)
      }
    },
    async getNextMatch() {
      try {
        const response = await this.$axios.get(
          `/api/v1/team/${this.teamId}/events/next/0`
        )
        console.log(response.data.events)
      } catch (e) {
        console.error(e.response)
      }
    },
    getSearchResult(data) {
      this.teamName = data.name
      this.teamId = +data.id
    },
    getChosenSeason(data) {
      console.log(data)
      this.seasonData = {...data}
    },
    getChosenMatch(data) {
      this.matchInfo = data.searchedTeamMatches
      console.log(this.matchInfo)
    },
    getSelectedStats(data) {
      this.visibleStats = []
      console.log(data.idxs)
      this.visibleStats.push(...data.idxs)
      console.log(this.visibleStats)
    },
    async fetchSofaPlayersName() {
      try {
        const response = await this.$axios.get(
          `/api/v1/team/${this.teamId}/unique-tournament/${this.tournamentId}/season/${this.seasonTeam}/top-players/overall`
        )
        const playersArr = response.data.topPlayers.rating
        playersArr.forEach(player => {
          const id = player.player.id
          const name = player.player.name
          this.playersDynamic[name] = id
        })

        await this.takeSofaDataPlayers()
        this.fetchPlayerStats()
        // await this.takeFotmobDataPlayers()
        console.log(this.start11Stats)
      } catch (e) {
        console.error(e.response)
      }
    },
    async takeSofaDataPlayers() {
      const wrapperPlayerInfo = {}
      for (const name in this.playersDynamic) {
        if (Object.hasOwnProperty.call(this.playersDynamic, name)) {
          const id = this.playersDynamic[name];
          try {
            const response = await this.$axios.get(
              `/api/v1/event/${this.matchInfo.matchId}/player/${id}/statistics`
            )
            const stats = response.data.statistics
            const position = response.data.player.position
            const wentToField = Object.keys(stats).length
            if (wentToField) {
              wrapperPlayerInfo[name] = stats
              wrapperPlayerInfo[name].position = position
            }
          } catch (e) {
            console.error(e.response)
          }
        }
      }
      this.playersInfoStats = wrapperPlayerInfo
    },
    fetchPlayerStats() {
      const statNamesArr = Object.keys(this.statNames)
        for (const statName of statNamesArr) {
          const objStat = {} // { 'Kepa': 30, 'Рюди': 74 }
          for (const name in this.playersInfoStats) {
            if (Object.hasOwnProperty.call(this.playersInfoStats, name)) {
              const stats = this.playersInfoStats[name];
              const wentToField = Object.keys(stats).length
              if (wentToField) {
                objStat[name] = stats[statName]
                if (!stats[statName]) objStat[name] = ''
              }
            }
          }

          this.statNameAndPlayersNameAndValue[statName] = objStat
          console.log(this.statNameAndPlayersNameAndValue)
          localStorage.setItem('dataForTable', JSON.stringify(this.statNameAndPlayersNameAndValue))
        }
      // console.log(this.isLoaded)
      this.isLoaded = true
      this.$forceUpdate()
    },
    // Fotmob
    async takeFotmobDataPlayers() {
      try {
        const response = await this.$axios.get(
          `/matchDetails?matchId=3780925`
        )
        const teamInfo = response.data.content.lineup.lineup.find(team => team.teamName === 'Chelsea')
        this.teamInfoFotmob = teamInfo
        this.setStart11Stats()

      } catch (e) {
        console.error(e.response)
      }
    },
    // просто собираем данные по игрокам из fotmob
    setStart11Stats() {
      const start11 = this.teamInfoFotmob.players
      start11.forEach(amplua => {
        console.log(amplua)
        amplua.forEach(player => {
          const needStats = {}
          const playerName = (player.name.firstName + ' ' + player.name.lastName).trim()
          console.log(playerName)

          for (const statName in this.statNamesFotmob) {
            console.log(player)
            const stataIsInStats = player.stats.find(statByFunction => statName in statByFunction.stats)
            if (!stataIsInStats) continue
            // console.log(stataIsInStats)
            needStats[statName] = stataIsInStats.stats[statName]
            // console.log('needStats')
            // console.log(needStats)
          }

          this.start11Stats[playerName] = needStats // array with 4 stats params
          // console.log('this.start11Stats')
          // console.log(this.start11Stats)
        })
      })
      this.setBenchOnFieldStats()
    },
    setBenchOnFieldStats() {
      const bench = this.teamInfoFotmob.bench
      bench.forEach(player => {
        if (player.rating.num) {
          const needStats = {}
          const playerName = (player.name.firstName + ' ' + player.name.lastName).trim()
          // console.log(playerName)

          for (const statName in this.statNamesFotmob) {
            console.log(player)
            const stataIsInStats = player.stats.find(statByFunction => statName in statByFunction.stats)
            if (!stataIsInStats) continue
            // console.log(stataIsInStats)
            needStats[statName] = stataIsInStats.stats[statName]
            // console.log('needStats')
            // console.log(needStats)
          }
          this.benchOnFieldStats[playerName] = needStats // array with 4 stats params
          // console.log('benchOnFieldStats')
          // console.log(this.benchOnFieldStats)
        }
      })
      this.combineFotmobSofaStats()
    },
    combineFotmobSofaStats() {
      this.statNameAndPlayersNameAndValue = Object.assign(
        this.statNameAndPlayersNameAndValue,
        this.start11Stats,
        this.benchOnFieldStats
      )
      console.log('this.statNameAndPlayersNameAndValue')
      console.log(this.statNameAndPlayersNameAndValue)
      this.combineStatNames()
    },
    combineStatNames() {
      console.log('this.statNames')

      this.statNames = Object.assign(
        this.statNames,
        this.statNamesFotmob
      )
      console.log(this.statNames)
    },
    toggleMenu() {
    this.menuOpen = !this.menuOpen;
  },

  },
}
</script>
<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Montserrat&family=Tenor+Sans&family=Open+Sans+Condensed:wght@300&display=swap');

$c1: #d8bfd8;
$c2: #ccccff;
$c3: #ffd1dc;
$c4: #e6e6fa;
$c5: #fadadd;
$c6: #bac8cc;
$c7: #ffefd5;
$c8: #ffd9cb;
$c9: #f3a683;
$c10: #ffece5;
$c11: #ffe5b4;
$c12: #ffc6b2;
$c13: #ffdead;
$c14: #f5deb3;
$c15: #c9a0dc;
$c16: #ffc0cb;
$c17: #c8a2c8;


$colors: $c1, $c2, $c3, $c4, $c5, $c6, $c7, $c8, $c9, $c10, $c11, $c12, $c13, $c14, $c15, $c16, $c17;
@mixin bg-color {
  @for $i from 1 through length($colors) {
    .stats-table:nth-child(#{$i}) .stat-value .range-width {
      background-color: nth($colors, $i)
    }
  }
}

.container-fluid {
  background-image: url('https://cdn.techhq.com/wp-content/uploads/2019/03/shutterstock_403455289.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  // background-size: 100%;
  // background-position: 47% 50%;
  font-family: 'Tenor Sans', sans-serif;

  &::before {
    content: '';
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 0;
    background: rgba($color: #222, $alpha: 0.8);
    // backdrop-filter: blur(1px);
    position: fixed;
  }
}
@include bg-color;

.hamburger {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 25px;
  width: 30px;
  &:focus {
    outline: none;
  }

  .line1, .line2, .line3 {
    background-color: #fff;
    height: 3px;
    width: 100%;
    transition: all 0.3s ease;
  }

  .line1.change {
    transform: translateY(14px) rotate(-45deg);
  }

  .line2.change {
    opacity: 0;
  }

  .line3.change {
    transform: translateY(-8px) rotate(45deg);
  }
}

.stats-table-wrapper {
  overflow-x: scroll;
  scroll-behavior: smooth;
  position: relative;
  z-index: 2;
}
.stats-table {
  width: 100%;
  padding: 2px 0;
  // border-bottom: 1px solid rgba($color: #ffffff, $alpha: 0.1);
  color: #ffffff;
  // color: #1f1d1d;
  position: relative;
  z-index: 1;
  // display: grid;
  // grid-auto-flow:column;
  // grid-template-columns: 130px 100px repeat(auto-fit, minmax(100px, 1fr));
  display: flex;
  flex-wrap: nowrap;

  .player {
    flex: 0 0 140px;
    background-color: rgba($color: rgb(29, 28, 28), $alpha: 0.7);
    position: sticky;
    left: -14px;
    padding-left: 8px;
    z-index: 50;
    backdrop-filter: blur(8px);
    border-radius: 8px;
    font-weight: 600;
    letter-spacing: 1px;
  }
  .cols-comparison {
    flex: 0 0 110px;
  }


  // скрываем матчи (хотя один раз нужно будет показать)
  // &:nth-child(2) .stat-value .range-width {
  //   background-color: #4e50d8c2;
  // }
  // &:nth-child(3) .stat-value .range-width {
  //   background-color: #6430bd9f;
  // }
  // &:nth-child(4) .stat-value .range-width {
  //   background-color: #4595e195;
  // }
  // &:nth-child(5) .stat-value .range-width {
  //   background-color: #8184e6c6;
  // }
  // &:nth-child(6) .stat-value .range-width {
  //   background-color: #4e50d8c2;
  // }
  .stat-legend {
    font-size: 13px;
    color: rgba($color: #fff, $alpha: 0.85);
    // color: rgba($color: #1f1d1d, $alpha: 0.85);
    display: flex;
    align-items: flex-end;
    line-height: 1;
  }

  .cols-comparison {
    font-weight: 500;
    color: #1f1d1d;

  }
  .stat-value {
    font-weight: 900;
    position: relative;
    flex-grow: 1;
    text-align: left;
    padding-left: 5px;
    font-size: 18px;
    font-family: 'Open Sans Condensed', sans-serif;

    .range {
      // background: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(246,246,246,1) 78%, rgba(28,2,199,0.04245448179271705) 100%);
      // border-radius: 8px;
      &-width {
        width: 0%;
        height: 80%;
        display: block;
        border-radius: 8px;
        position: absolute;
        z-index: -1;
        transform: translate(-5px, -83%);
      }
    }
  }
  .matches,
  .touches {
    // max-width: 62px;
  }
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all .3s ease;
}
.slide-fade-enter, .slide-fade-leave-to /* .slide-fade-leave-active in <2.1.8 */ {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
