<template>
  <div id="country-search">
    <p>
      Type a full country name:
      <input v-model="query" />
    </p>

    <!-- Dropdown -->
    <select v-if="results.length > 0" v-model="selectedCountry">
      <option disabled value="">Select a country…</option>
      <option v-for="country in results" :key="country.cca3" :value="country.name.common">
        {{ country.name.common }}
      </option>
    </select>

    <p v-if="selectedCountry">You selected: {{ selectedCountry }}</p>
    <p v-else>{{ message }}</p>
  </div>
</template>

<script setup >
import { ref, watch } from 'vue'
import axios from 'axios'
import _ from 'lodash'

// state
const query = ref('')
const message = ref('Start typing a country name…')
const results = ref([])
const selectedCountry = ref('')

// helper: detect "whole phrase"
// Here: phrase = at least 2 characters + no trailing space
const isWholePhrase = (text) => {
  return text.trim().length > 1 && !text.endsWith(' ')
}

// main method
const searchCountries = async () => {
  results.value = []
  message.value = 'Searching…'

  try {
    const response = await axios.get(`https://restcountries.com/v3.1/name/${query.value}`)
    results.value = response.data
    message.value = results.value.length > 0 ? 'Select a result:' : 'No results found.'
  } catch (error) {
    message.value = 'Error! Could not reach API.'
  }
}

// debounced version
const debouncedSearch = _.debounce(searchCountries, 500)

// watcher
watch(query, (newValue) => {
  selectedCountry.value = ''  // reset selection
  results.value = []

  if (!isWholePhrase(newValue)) {
    message.value = 'Type a full country name…'
    return
  }

  debouncedSearch()
})
</script>

<style>
select {
  margin-top: 10px;
}
</style>
