<template>
    <p class="typewriter-text">
      {{ visibleText }}
    </p>
  </template>
  
  <script setup>
  import { ref, watch, onMounted } from 'vue'
  
  const props = defineProps({
    fullText: {
      type: String,
      default: ''
    },
    typeSpeed: {
      type: Number,
      default: 20 // ms between characters
    }
  })
  
  const visibleText = ref('')
  
  // Re-type if the parent passes a new fullText
  watch(
    () => props.fullText,
    () => {
      startTyping()
    }
  )
  
  // Also run on mount (initial text)
  onMounted(() => {
    startTyping()
  })
  
  function startTyping() {
    visibleText.value = ''
    let index = 0
  
    const timer = setInterval(() => {
      if (index < props.fullText.length) {
        visibleText.value += props.fullText[index]
        index++
      } else {
        clearInterval(timer)
      }
    }, props.typeSpeed)
  }
  </script>
  
  <style scoped>
  .typewriter-text {
    white-space: pre-line; /* preserves line breaks from multiline text */
    font-family: 'Arial', sans-serif;
  }
  </style>
  
  