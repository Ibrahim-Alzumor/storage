import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {ChartData} from 'chart.js';
import {HttpClient, HttpParams} from '@angular/common/http';
import {BaseChartDirective} from 'ng2-charts';

@Component({
  selector: 'app-charts',
  imports: [
    ReactiveFormsModule,
    BaseChartDirective
  ],
  templateUrl: './charts.component.html',
  styleUrl: './charts.component.css'
})
export class ChartsComponent implements OnInit {
  form: FormGroup;
  chartDataBar: ChartData<'bar'> = {labels: [], datasets: []};
  chartDataLine: ChartData<'line'> = {labels: [], datasets: []};
  loading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      start: [''],
      end: [''],
      email: [''],
    });
  }

  ngOnInit(): void {
  }

  loadData(): void {
    const {start, end, email} = this.form.value();
    const params = new HttpParams()
      .set('start', start)
      .set('end', end)
      .set('email', email || '');

    this.loading = true;

    this.http.get<any>('http://localhost:3000/logs/stats', {params}).subscribe(data => {
      const groupedByProduct: { [key: string]: { [date: string]: number } } = {};
      const groupedByDate: { [date: string]: number } = {};

      for (const record of data) {
        const {productId, date, totalSold} = record;
        if (!groupedByProduct[productId]) {
          groupedByProduct[productId] = {};
        }
        if (!groupedByProduct[productId][date]) {
          groupedByProduct[productId][date] = 0;
          groupedByProduct[productId][date] += totalSold;
        }
        if (!groupedByDate[date]) {
          groupedByDate[date] += 0;
          groupedByDate[date] += totalSold;
        }
      }
      const dates = Array.from(new Set(data.map((record: { date: any; }) => record.date))).sort();

      this.chartDataBar = {
        labels: dates,
        datasets: Object.entries(groupedByProduct).map(([productId, values]) => ({
          label: `Product ${productId}`,
          data: dates.map(date => values[date as string] || 0),
        }))
      };

      this.chartDataLine = {
        labels: dates,
        datasets: [
          {
            label: 'Total Sold',
            data: dates.map(date => groupedByDate[date as string] || 0),
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          }
        ]
      };
      this.loading = false;
    });
  }
}
