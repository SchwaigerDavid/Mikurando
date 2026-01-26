import { Component, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #myChart></canvas>`,
  styles: [`canvas { max-height: 400px; width: 100%; display: block; }`]
})
export class GraphComponent implements AfterViewInit {
  @ViewChild('myChart') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | undefined;
  private _salesData: number[] = [];
  private _labelData: string[] = [];

  @Input() set salesData(value: number[]) {
    this._salesData = value || [];
    this.updateChart();
  }

  @Input() set labelData(value: string[]) {
    this._labelData = value || [];
    this.updateChart();
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initChart();
    }
  }

  private initChart() {
    if (this.chart || !this.chartCanvas) return;

    const color = getComputedStyle(document.body).getPropertyValue('--mat-sys-primary').trim() || '#4db6ac';

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this._labelData,
        datasets: [{
          label: 'Sales/Orders',
          data: this._salesData,
          borderColor: color,
          backgroundColor: color + '33', // Leicht transparent
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
    this.cdr.detectChanges();
  }

  updateChart() {
    if (this.chart) {
      this.chart.data.labels = this._labelData;
      this.chart.data.datasets[0].data = this._salesData;
      this.chart.update();
    } else if (isPlatformBrowser(this.platformId) && this.chartCanvas) {
      this.initChart();
    }
  }
}
