<template>
  <div class="text-h4 my-4">Advisors</div>

  <v-data-table :items="advisors" :headers="headers">
    <template v-slot:item.actions="{ item }">
      <v-btn color="primary" @click="editPreferences(item)" size="small"
        >Edit Preferences
      </v-btn>
    </template>
  </v-data-table>
</template>

<script setup>
import { ref } from 'vue';
import { inject } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const $axios = inject('$axios');

const headers = [
  {
    key: 'actions',
    sortable: false,
    width: 0,
    nowrap: true,
  },
  {
    title: 'Full Name',
    key: 'full_name',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Email',
    key: 'email',
    width: 0,
    nowrap: true,
  },
  {},
];

const advisors = ref([]);
const getAdvisors = async () => {
  try {
    const { data } = await $axios.get(`/api/advisors/`);

    advisors.value = data;
  } catch (error) {}
};

getAdvisors();

const editPreferences = (item) => {
  router.push(`/advisors/${item.id}/preferences`);
};
</script>
