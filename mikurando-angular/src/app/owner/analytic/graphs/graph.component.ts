import { Component, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-graph',
  standalone: true,
  template: `<canvas #myChart></canvas>`,
  styles: [`canvas { max-height: 400px; }`]
})
export class GraphComponent implements AfterViewInit {
  @ViewChild('myChart') chartCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    // WICHTIG: Nur im Browser ausführen (löst deinen SSR-Fehler)
    if (isPlatformBrowser(this.platformId)) {
      new Chart(this.chartCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
          datasets: [{
            label: 'Sales',
            data: [12, 19, 3, 5, 2],
            borderColor: '#4db6ac',
            tension: 0.4
          }]
        }
      });
    }
  }
}
