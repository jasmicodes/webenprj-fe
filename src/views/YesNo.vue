<template>
  <div id="watch-example">
    <p>
      Ask a yes/no question:
      <input v-model="question" />
    </p>
    <p>{{ answer }}</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import _ from 'lodash'

// state
const question = ref('')
const answer = ref('I cannot give you an answer until you ask a question!')

// method
const getAnswer = async () => {
  if (!question.value.includes('?')) {
    answer.value = 'Questions usually contain a question mark. ;-)'
    return
  }

  answer.value = 'Thinking...'

  try {
    const response = await axios.get('https://yesno.wtf/api')
    answer.value = _.capitalize(response.data.answer)
  } catch (error) {
    answer.value = 'Error! Could not reach the API. ' + error
  }
}

// debounce version of getAnswer
const debouncedGetAnswer = _.debounce(getAnswer, 500)

// watcher
watch(question, () => {
  answer.value = 'Waiting for you to stop typing...'
  debouncedGetAnswer()
})
</script>
