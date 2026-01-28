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
  private _salesData: number[] = [12,25,23,40,24,20];
  private _labelData: string[] = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

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
    // Debug-Logs sind gut, Lieutenant, aber wir brauchen die Canvas-Referenz
    if (!this.chartCanvas || !isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.chart) {
      this.chart.data.labels = this._labelData;
      this.chart.data.datasets[0].data = this._salesData;
      this.chart.update();
    } else {
      // Falls das Canvas jetzt da ist, aber der Chart noch nicht existiert
      this.initChart();
    }
  }
}
