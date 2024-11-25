<template>
    <div>
        <v-btn @click="downloadCsv">Download Exclusions</v-btn>
    </div>
</template>

<script>
export default {
    name: 'CsvDownloader',
    props: {
        content: {
            type: Array,
            required: true
        },
        headers: {
            type: Array,
            required: true
        },
        fileName: {
            type: String,
            default: 'content.csv'
        }
    },
    methods: {
        downloadCsv() {
            const csvContent = [
                this.headers.join(','), // Add headers as the first row
                ...this.content.map(item => 
                    this.headers.map(header => item[header]).join(',')
                )
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', this.fileName);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
}
</script>
