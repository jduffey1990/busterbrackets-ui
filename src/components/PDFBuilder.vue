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
      required: true,
      default: 'table-content'
    },
    excludeColumns: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  methods: {
    async generatePDF() {
      // Hide all v-btn elements
      const buttons = document.querySelectorAll('button')
      buttons.forEach(button => {
        button.style.display = 'none'
      })

      const element = document.getElementById(this.pdfElementId)
      const canvasElements = element.getElementsByClassName(this.canvasClass)

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'letter',
        hotfixes: ['px_scaling'],
        putOnlyUsedFonts: true,
      })

      const pageHeight = pdf.internal.pageSize.getHeight()
      const pageWidth = pdf.internal.pageSize.getWidth()

      let currentY = 0

      for (let i = 0; i < canvasElements.length; i++) {
        const canvasElement = canvasElements[i]
        const canvas = await html2canvas(canvasElement, {
          scale: 1.5 // Increase scale to improve image quality below 1.5 looks fuzzy going above increases file size
        })

        const imgData = canvas.toDataURL('image/jpeg', 1.0) // Use JPEG for better compression
        const imgWidth = canvas.width
        const imgHeight = canvas.height
        const ratio = pageWidth / imgWidth
        const scaledWidth = imgWidth * ratio
        const scaledHeight = imgHeight * ratio

        if (currentY + scaledHeight > pageHeight) {
          pdf.addPage()
          currentY = 0
        }

        pdf.addImage(imgData, 'JPEG', 0, currentY, scaledWidth, scaledHeight, undefined, 'SLOW')
        currentY += scaledHeight
      }

      // Add table content as tables
      const tableElements = element.getElementsByClassName(this.tableClass)
      Array.from(tableElements).forEach(tableElement => {
        const tableData = []
        const rows = tableElement.querySelectorAll('tr')
        let headers = []

        rows.forEach((row, rowIndex) => {
          const rowData = []
          const cells = row.querySelectorAll('td, th')
          cells.forEach((cell, cellIndex) => {
            const cellText = cell.innerText || cell.textContent
            if (rowIndex === 0) {
              headers.push(cellText)
            }
            if (!this.excludeColumns.includes(headers[cellIndex])) {
              rowData.push(cellText)
            }
          })
          tableData.push(rowData)
        })

        if (currentY + 20 > pageHeight) {
          pdf.addPage()
          currentY = 0
        }

        pdf.autoTable({
          startY: currentY + 10,
          head: [tableData[0]],
          body: tableData.slice(1),
          theme: 'grid',
          headStyles: {
            fillColor: '#E1EFFF',
            textColor: '#000000'
          }
        })

        currentY = pdf.lastAutoTable.finalY + 10
      })

      // Show all v-btn elements
      buttons.forEach(button => {
        button.style.display = 'block'
      })

      pdf.save(`${this.pdfElementId}.pdf`)
    }
  }
}
</script>