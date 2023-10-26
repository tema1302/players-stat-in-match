<template lang="pug">
.relative
  input.bg-gray-700.text-white.rounded-lg.py-2.px-3(
    class="w-full focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent",
    type="text",
    placeholder="Выберите сезон",
    v-model="inputedSeason",
    @click="chooseSeason()"
  )
  .search-results.custom-scrollbar.my-5.bg-gray-700.rounded-lg.text-white(ref="searchResults", v-if="gotResult")
    ul#results-list
      li(v-for="season in searchedTeamSeasons" :key="season.id" class="bg-gray-700 hover:bg-gray-600 transition" @click="selectItem(season)")
        | {{ season.year }}
  </template>

<script>
export default {
  name: 'ChoseSeason',
  props: {
    teamId: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  data() {
    return {
      inputedSeason: '',
      searchedTeamSeasons: [],
      gotResult: false,
      selectedId: 0,
      selectedName: '',
      seasonId: {
        name: '',
        year: '',
        id: 0
      },
    }
  },
  watch: {

  },
  methods: {
    async chooseSeason() {
      if (this.teamId) {
        try {
          const response = await this.$axios.get(`/api/v1/team/${this.teamId}/standings/seasons`);
          if (response.data && response.data.tournamentSeasons && response.data.tournamentSeasons[0]) {
            this.searchedTeamSeasons = response.data.tournamentSeasons[0].seasons;
            }
        } catch (e) {
          console.error(e.response);
        }
      }

      this.gotResult = true;
      setTimeout(() => {
        this.searchModal('open');
      }, 100);
    },
    searchModal(action) {
      const list = this.$refs.searchResults
      action === 'open' ? list.classList.add('visible') : list.classList.remove('visible')
      console.log(action)
    },
    selectItem(season) {
      console.log(season)
      this.$emit('season-selected', season);
      this.inputedSeason = season.year
      this.searchModal('')
      // this.emitSelectedItem()
    },
    emitSelectedItem() {
      this.$emit('item-selected', {
        searchedTeamSeasons: this.selectedId,
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
