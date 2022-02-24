<template lang="pug">
  .container-fluid.min-h-screen
    button.relative.button.inline-block.px-5.bg-blue-600.text-white.rounded-xl(@click="fetchPlayerStats") Get data
    .px-20
      .stats-table.text-left.text-sm.grid.grid-cols-8
        .pl-1.pr-5.flex.flex-column.items-end(v-for="(statName, requestName, idx) in statNames" :key="idx")
          span.text-xs(v-for="(statRus, statEng, i) in statName", :key="i") {{ statRus }} / {{ statEng }}
      .stats-table.text-left.text-sm.grid.grid-cols-8(v-for="(value, name, idx) in statNameAndPlayersNameAndValue.touches" :key="idx")
        .player
          .py-1.pr-4 {{ name }}
        .cols-comparison.flex.items-center(v-if="isLoaded", v-for="(statName, requestName, i) in statNames" :key="i")
          //- .stat-legend.mx-1.py-3 {{ russStatName }}
          .stat-value.mx-1.py-1.px-3
            span.range {{ statNameAndPlayersNameAndValue[requestName][name] }}
              //- span.range-width(v-if="Object.keys(overallWidth).length > 0", :style="{ width: overallWidth[statName][i] + '%' }")
</template>

<script>
export default {
  name: 'IndexPage',
  data() {
    return {
      isLoaded: false,
      matchId: 10012255,
      players: {
        // 'Кепа Аррисабалага': 232422,
        'Эдуар Менди': 845074,
        'Сесар Аспиликуэта': 21555,
        // 'Рис Джеймс': 885908,
        'Антонио Рюдигер': 142622,
        'Андреас Кристенсен': 186795,
        'Тиаго Силва': 33541,
        'Трево Чалоба': 826134,
        'Маланг Сарр': 826203,
        // 'Бен Чилуэлл': 802695,
        // 'Маркос Алонсо': 69408,
        // 'Жоржиньо': 132874,
        "Н'Голо Канте": 234148,
        'Матео Ковачич': 136710,
        'Рубен Лофтус-Чик': 284441,
        'Кристиан Пулишич': 817957,
        // 'Сауль Ньигес': 116955,
        // 'Росс Баркли': 98435,
        // 'Мэйсон Маунт': 836694,
        // 'Хаким Зиеш': 249437,
        // 'Кенеди': 801391,
        // 'Каллум Хадсон-Одои': 867442,
        // 'Кай Хавертц': 836705,
        // 'Тимо Вернер': 232306,
        // 'Ромелу Лукаку': 78893,
      },
      statNames: {
        minutesPlayed: { 'minutes played': 'Минут сыграно', },
        touches: { touches: 'Касания (действия с мячом)', },
        totalPass: { 'total passes': 'Пасы', },
        accuratePass: { 'accurate passes': 'Успешные пасы', },
        keyPass: { 'key passes': 'Ключевые передачи', },

        shotOffTarget: { 'shots off target': 'Удары мимо ворот', },
        onTargetScoringAttempt: { 'shots on target': 'Удары в створ ворот', },
        // blockedScoringAttempt: { 'blocked shots': 'Заблокированные удары', },

        // totalContest: { 'total dribble': 'Попытки дриблинга' },
        // wonContest: { 'successful dribble': 'Успешный дриблинг', },
        // goals: { 'goals': 'Голы', },

        // goalAssist: { 'assists': 'Ассисты', },
        // totalLongBalls: { 'total long balls': 'Длинные передачи', },
        // accurateLongBalls: { 'accurate long balls': 'Успешные длинные передачи', },
        // totalCross: { 'total crosses': 'Навесы в штрафную', },
        // accurateCross: { 'accurate crosses': 'Успешные навесы в штрафную', },

        // interceptionWon: { 'interceptions': 'Перехваты', },
        // totalTackle: { tackles: 'Отборы', },

        // aerialWon: { 'aerial dules won': 'Выиграно воздушных единоборств', },
        // aerialLost: { 'aerial dules lost': 'Проиграно воздушных единоборств', },

        // duelLost: { 'ground dules won': 'Выиграно наземных единоборств', },
        // duelWon: { 'ground dules lost': 'Проиграно наземных единоборств', },

        // totalClearance: { 'clearances': 'Выносы', },
        // possessionLostCtrl: { 'possession lost': 'Потерей мяча', },

        // totalOffside: { 'total offside': 'Офсайды', },
      },
      // на выходе должны получать:
      // statNameAndPlayersNameAndValue: [
      // touches: {'Кепа': 30, 'Рюди': 74},
      // ...
      // ]
      statNameAndPlayersNameAndValue: {},
      tableNumbers: {},
      overallStatByMatch: {},
    }
  },
  computed: {
    overallWidth() {
      const rtn = {}
      const statNamesArr = Object.keys(this.statNames)
      for (const statName of statNamesArr) {
        const statValues = Object.values(this.statNameAndPlayersNameAndValue[statName])
        console.log(statValues)
        const maxValue = Math.max(...statValues)
        const statValuesPersentage = statValues.map((value) => {
          return Math.round((value / maxValue) * 100)
        })
        console.log(statValuesPersentage)
        // rtn[statName] = statValuesPersentage
      }
      return rtn
    },
  },
  methods: {
    async fetchPlayerStats() {
      const statNamesArr = Object.keys(this.statNames)

        for (const statName of statNamesArr) {
          const objStat = {} // { 'Kepa': 30, 'Рюди': 74 }
          for (const name in this.players) {
            const id = this.players[name]
            try {
              const response = await this.$axios.get(
                `https://api.sofascore.com/api/v1/event/${this.matchId}/player/${id}/statistics`
              )
              const stats = response.data.statistics
              const wentToField = Object.keys(stats).length
              if (wentToField) {
                objStat[name] = stats[statName]
                // на выходе должны получать:
                // statNameAndPlayersNameAndValue: {
                // touches: {'Кепа': 30, 'Рюди': 74},
                // ...
                // }
              }
            } catch (e) {
              console.error(e.response)
            }
          }
          this.statNameAndPlayersNameAndValue[statName] = objStat
          console.log(this.statNameAndPlayersNameAndValue)
        }
      console.log(this.isLoaded)
      this.isLoaded = true
      this.$forceUpdate()
    },
    getOverallStatByMatch() {
      const rtn = {}
      for (const statName in this.tableNumbers) {
        if (Object.hasOwnProperty.call(this.tableNumbers, statName)) {
          const arrStatValue = this.tableNumbers[statName]
          if (
            statName === 'matchesStarted' ||
            statName === 'appearances' ||
            statName === 'cleanSheet' ||
            statName === 'assists' ||
            statName === 'bigChancesCreated' ||
            statName === 'penaltyGoals' ||
            statName === 'goals' ||
            statName === 'bigChancesMissed' ||
            statName === 'goalsAssistsSum'
          ) {
            rtn[statName] = arrStatValue
          } else {
            const arrStatValueByMatch = arrStatValue.map((statValue, idx) => {
              if (statName.includes('Percentage')) {
                return +statValue.toFixed(1)
              } else {
                return +(
                  statValue / this.tableNumbers.appearances[idx]
                ).toFixed(2)
              }
            })
            // console.log(statName)
            // console.log(arrStatValueByMatch)
            rtn[statName] = arrStatValueByMatch
          }
        }
      }
      this.overallStatByMatch = rtn
    },
  },
}
</script>
<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Montserrat&family=Tenor+Sans&family=Open+Sans+Condensed:wght@300&display=swap');

$c1: #4e50d8c2;
$c2: #5b2cac9f;
$c3: #6430bd9f;
$c4: #4595e195;
$c5: #8184e6c6;
$c6: #475ddac2;
$c7: #203ba78e;

$colors: $c1, $c2, $c3, $c4, $c5, $c6, $c7;
@mixin bg-color {
  @for $i from 1 through length($colors) {
    .cols-comparison:nth-child(#{$i}) .stat-value .range-width {
      background-color: nth($colors, $i)
    }
  }
}

.container-fluid {
  background-image: url('./static/123.jpg');
  background-repeat: no-repeat;
  background-size: 100%;
  background-position: 47% 50%;
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

.stats-table {
  width: 100%;
  padding: 10px;
  border-bottom: 1px solid rgba($color: #ffffff, $alpha: 0.1);
  margin: 0;
  color: white;
  position: relative;
  z-index: 1;
  // скрываем матчи (хотя один раз нужно будет показать)
  .cols-comparison:nth-child(2) .stat-value .range-width {
    background-color: #4e50d8c2;
  }
  .cols-comparison:nth-child(3) .stat-value .range-width {
    background-color: #6430bd9f;
  }
  .cols-comparison:nth-child(4) .stat-value .range-width {
    background-color: #4595e195;
  }
  .cols-comparison:nth-child(5) .stat-value .range-width {
    background-color: #8184e6c6;
  }
  .cols-comparison:nth-child(6) .stat-value .range-width {
    background-color: #4e50d8c2;
  }
  .stat-legend {
    font-size: 13px;
    color: rgba($color: #fff, $alpha: 0.85);
    display: flex;
    align-items: flex-end;
    line-height: 1;
  }
  .stat-value {
    position: relative;
    flex-grow: 1;
    text-align: left;
    padding-left: 5px;
    font-size: 16px;
    font-family: 'Open Sans Condensed', sans-serif;
    .range {
      &-width {
        width: 100%;
        height: 75%;
        display: block;
        border-radius: 8px;
        position: absolute;
        z-index: -1;
        transform: translate(-5px, -93%);
      }
    }
  }
  .matches,
  .touches {
    // max-width: 62px;
  }
}
</style>
