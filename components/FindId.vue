<template lang="pug">
  .relative
    input.bg-gray-700.text-white.rounded-lg.py-2.px-3(class="w-full focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent", type="text", placeholder="Название клуба или имя", v-model="inputedName")
    .search-results.custom-scrollbar.my-5.bg-gray-700.rounded-lg.text-white(ref="searchResults", v-if="gotResult", class="")
      ul#results-list
        li(v-for="(result, idx) in results" :key="result.id" class="bg-gray-700 hover:bg-gray-600 transition" @click="selectItem(idx)") {{ result.name }}
</template>

<script>
export default {
  name: 'FindId',
  data() {
    return {
      inputedName: '',
      results: [],
      gotResult: false,
      selectedId: 0,
      selectedName: '',
    }
  },
  watch: {
    async inputedName() {
      if (this.inputedName.length > 2) {
        setTimeout(() => {}, 3000);
        const response = await this.$axios.get(
          `/api/v1/search/${this.inputedName}/0`
        )
        const results = response.data.results.filter(result => result.type === 'team' && result.entity.sport.name === 'Football')
        .map(team => ({ name: team.entity.name, id: team.entity.id }))
        this.results = [...results] // [{"name":"Chelsea","id":38},{"name":"Manchester City","id":17}...]
        this.gotResult = true
        setTimeout(() => {
          console.log(this.$refs.searchResults)
          this.searchModal('open')
        }, 100);

      }
    },
  },
  methods: {
    searchModal(action) {
      const list = this.$refs.searchResults
      action === 'open' ? list.classList.add('visible') : list.classList.add('hidden')
      console.log(action)
    },
    selectItem(index) {
      this.selectedId = this.results[index].id
      this.selectedName = this.results[index].name
      this.searchModal('')
      this.$emit('item-selected', {
        id: this.selectedId,
        name: this.selectedName
      })
    },
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
    border: 1px solid #f6f7ed2c;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(100,116,139,.36);
  }
}
</style>
