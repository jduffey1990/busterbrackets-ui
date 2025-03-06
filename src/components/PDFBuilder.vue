<template>
    <v-btn @click="generatePDF">Download PDF</v-btn>
  </template>
  
  <script>
  import { jsPDF } from 'jspdf'
  import html2canvas from 'html2canvas'
  import 'jspdf-autotable'
  
  export default {
    props: {
      pdfElementId: {
        type: String,
        required: true,
        default: 'pdf-generator'
      },
      canvasClass: {
        type: String,
        required: true,
        default: 'canvas-content'
      },
      tableClass: {
        type: String,
        required: false,
        default: 'table-content'
      },
      excludeColumns: {
        type: Array,
        required: false,
        default: () => []
      },
      tableHeaders: {
        type: Array,
        required: false,
        default: () => []
      }
    },
    methods: {
      async generatePDF() {
        const element = document.getElementById(this.pdfElementId)
        const canvasElements = element.getElementsByClassName(this.canvasClass)
  
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: 'letter',
          hotfixes: ['px_scaling'],
          putOnlyUsedFonts: true,
        })
      }
    }
  }
  </script>