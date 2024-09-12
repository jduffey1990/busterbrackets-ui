<template>
    <img :src="''" :alt="''" @load="handleLoad" ref="imageElement" />
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  
  const props = defineProps({
    src: String,
    alt: String,
  });
  
  const imageElement = ref(null);
  let observer = null;
  
  onMounted(() => {
    if (!("IntersectionObserver" in window)) return;
  
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target;
          if (entry.isIntersecting && target === imageElement.value) {
            if (observer) {
              observer.unobserve(target);
            }
            target.src = props.src;
          }
        });
      },
      { threshold: 0.1 }
    );
  
    if (imageElement.value) {
      observer.observe(imageElement.value);
    }
  });
  
  const handleLoad = () => {
    if (observer) {
      observer.disconnect();
    }
  };
  </script>
  
  <style scoped>
  img {
    max-width: 40px;
    max-height: 20px;
  }
  </style>
  