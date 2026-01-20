import { Component, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID, Input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
@Component({
  selector: 'app-graph',
  standalone: true,
  template: `<canvas #myChart></canvas>`,
  styles: [`canvas { max-height: 400px; width: 100%; }`] //
})
export class GraphComponent implements AfterViewInit {
  @ViewChild('myChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | undefined;

  // Diese Property nimmt die Daten von außen entgegen
  private _salesData: number[] = [];

  @Input() set salesData(value: number[]) {
    this._salesData = value;
    if (this.chart) {
      this.updateChart(); // Aktualisiere den Graph, wenn Daten sich ändern
    }
  }
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {} //

  ngAfterViewInit() {
    // Führe Browser-APIs NUR hier aus!
    if (isPlatformBrowser(this.platformId)) { //
      const primaryColor = this.getPrimaryColor();
      this.initChart(primaryColor);
    }
  }

  private getPrimaryColor(): string {
    // Hier ist getComputedStyle jetzt sicher, da wir im Browser sind
    return getComputedStyle(document.body).getPropertyValue('--mat-sys-primary').trim() || '#4db6ac';
  }

  private initChart(color: string) {
    // Deine Chart-Initialisierung mit der Farbe
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
        datasets: [{
          label: 'Sales',
          data: this._salesData,
          borderColor: color, // Die dynamisch ausgelesene Farbe
          tension: 0.4
        }]
      }
    });
  }
  updateChart() {
    if (this.chart) {
      this.chart.data.datasets[0].data = this._salesData;
      this.chart.update(); // Chart.js Methode zum Neuzeichnen
    }
  }
}
