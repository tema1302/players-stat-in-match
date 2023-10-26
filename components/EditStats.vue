<template lang="pug">
.relative
  button.relative.button.inline-block.px-5.text-white.rounded-sm(class="bg-gray-500 hover:bg-gray-400"
  :class="" @click="opened = !opened") Редактировать стату
  .search-results.custom-scrollbar.my-5.bg-gray-700.rounded-sm.text-white(ref="statNamesModal", :class="{opened : 'visible'}" class="")
    #results-list
      .flex.items-center.pl-2(v-for="(name, idx) in statNames" :key="idx" class="bg-gray-700 hover:bg-gray-600 transition")
        input.checkbox(type="checkbox" :id="`statName${idx}`", :value="idx", v-model="checked" @click="selectItem")
        <svg class="check-icon" width="24px" height="24px" viewBox="0 0 24 24">
          <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
            <rect class="check-icon__box" x="1" y="1" width="22" height="22"/>
            <polyline class="check-icon__box-worm" points="23,1 1,1 1,23 23,23 23,4" stroke-dasharray="30 146" stroke-dashoffset="30"/>
            <polyline class="check-icon__check-worm" points="23,4 10,17 5,12 18,12" stroke-dasharray="17.38 149.68" stroke-dashoffset="103.38"/>
          </g>
        </svg>
        label.checkbox-text.px-1.py-2.cursor-pointer.w-full(:for="`statName${idx}`") {{ name }}
</template>

<script>
export default {
  name: 'FindId',
  data() {
    return {
      statNames: [
        'Минут',
        'Касания (действия с мячом)',
        'Пасы',
        'Успешные пасы',
        'Ключевые передачи',
        'Созданные голевые моменты',
        'Ассисты',
        'Удары мимо ворот',
        'Удары в створ ворот',
        'Заблокир. удары',
        'Упущенные голевые моменты',
        'Голы',
        'Попытки дриблинга',
        'Успешный дриблинг',
        'Длинные передачи',
        'Успешные длинные передачи',
        'Навесы в штрафную',
        'Успешные навесы в штрафную',
        'Выиграно воздушных единоборств',
        'Проиграно воздушных единоборств',
        'Выиграно наземных единоборств',
        'Проиграно наземных единоборств',
        'Перехваты',
        'Отборы',
        'Выносы',
      ],
      checked: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
      opened: false,
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
        setTimeout(() => {
          console.log(this.$refs.statNamesModal)
          this.searchModal('open')
        }, 100);

      }
    },
  },
  mounted() {
    if (this.checked.length > 0) this.selectItem()
  },
  methods: {
    searchModal(action) {
      const list = this.$refs.statNamesModal
      action === 'open' ? list.classList.add('visible') : list.classList.remove('visible')
      console.log(action)
    },
    selectItem() {
      this.$emit('selected-idxs', { idxs: this.checked })

    },
  },
}
</script>

<style lang="scss">
:root {
	--hue: 223;
	--bg: hsl(var(--hue),10%,90%);
	--fg1: hsl(var(--hue),10%,10%);
	--fg2: hsl(var(--hue),10%,30%);
	--fg3: hsl(var(--hue),10%,70%);
	--primary: #ffffff;
	--primary-t: #ffffff;
	--primary-t-hover: hsla(var(--hue),90%,55%,0.15);
	--trans-dur1: 0.3s;
	--trans-dur2: 0.6s;
}

.checkbox {
	position: absolute;
	clip: rect(1px,1px,1px,1px);
	width: 1px;
	height: 1px;
}
.checkbox-text {
	color: #ffffff;
	transition: color var(--trans-dur1);
}
.checkbox-text:after {
	background-color: var(--primary-t);
	border-radius: 0.375em;
	content: "";
	display: block;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: -1;
	transition: background-color 0.15s linear;
}

.check-icon {
	margin-right: 0.5em;
	width: 1.5em;
	height: 1.5em;
}
.check-icon__box {
	stroke: var(--fg3);
	transition: stroke var(--trans-dur1);
}
.check-icon__box-worm,
.check-icon__check-worm {
	stroke: var(--primary);
	transition:
		stroke var(--trans-dur1),
		stroke-dashoffset var(--trans-dur2) cubic-bezier(0.42,-0.2,0.58,1.2);
}

/* Focus and hover */
.checkbox:focus ~ .checkbox-text:after,
.checkbox:hover ~ .checkbox-text:after {
	background-color: var(--primary-t-hover);
}
.checkbox:checked + .check-icon .check-icon__box-worm,
.checkbox:indeterminate + .check-icon .check-icon__box-worm {
	stroke-dashoffset: -91;
}
.checkbox:checked + .check-icon .check-icon__check-worm {
	stroke-dashoffset: -6;
}
.checkbox:indeterminate + .check-icon .check-icon__box-worm {
	stroke-dashoffset: -111.38;
}
.checkbox:indeterminate + .check-icon .check-icon__check-worm {
	stroke-dashoffset: -26.38;
}

/* `:focus-visible` support */
@supports selector(:focus-visible) {
	.checkbox:focus ~ .checkbox-text:after {
		background-color: var(--primary-t);
	}
	.checkbox:focus-visible ~ .checkbox-text:after,
	.checkbox:hover ~ .checkbox-text:after {
		background-color: var(--primary-t-hover);
	}
}

</style>
