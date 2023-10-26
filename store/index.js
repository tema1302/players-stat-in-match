export const state = () => ({
  teamId: 38,
  tournamentId: '',
  feedbackModal: false,
})

export const mutations = {
  setTeamId(state, data) {
    state.teamId = data
  },
  setFeedbackModal(state, data) {
    state.feedbackModal = data
  },
}
