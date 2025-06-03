import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {ChartData} from 'chart.js';
import {HttpClient, HttpParams} from '@angular/common/http';
import {BaseChartDirective} from 'ng2-charts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {ProductService} from '../../services/product.service';
import {environment} from '../../enviroments/enviroment';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

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
  colorPalette = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#7CFC00',
    '#FF4500',
    '#1E90FF',
    '#00FFFF',
    '#FF1493',
    '#32CD32',
    '#BA55D3',
    '#FF8C00',
    '#00FA9A'
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private productService: ProductService,
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
    const {start, end, email} = this.form.value;
    const params = new HttpParams()
      .set('start', start)
      .set('end', end)
      .set('email', email || '');

    this.loading = true;

    this.http.get<any[]>(`${environment.apiUrl}/logs/stats`, {params}).subscribe(async data => {
      const groupedByProduct: { [key: string]: { [date: string]: number } } = {};
      const groupedByDate: { [date: string]: number } = {};

      const productIdsSet = new Set<string>();
      for (const record of data) {
        const {productId, date, totalSold} = record;
        if (productId) productIdsSet.add(productId);

        if (!groupedByProduct[productId]) {
          groupedByProduct[productId] = {};
        }
        groupedByProduct[productId][date] = (groupedByProduct[productId][date] || 0) + totalSold;

        groupedByDate[date] = (groupedByDate[date] || 0) + totalSold;
      }

      const dates = Array.from(new Set(data.map(r => r.date))).sort();

      const productIds = Array.from(productIdsSet);
      const productsMap: Record<string, string> = {};

      await Promise.all(
        productIds.map(async (id) => {
          try {
            const product = await this.productService.getOne(+id).toPromise();
            productsMap[id] = product?.name || `Product ${id}`;
          } catch {
            productsMap[id] = `Product ${id}`;
          }
        })
      );

      this.chartDataBar = {
        labels: dates,
        datasets: Object.entries(groupedByProduct).map(([productId, values], index) => {
          const colorIndex = index % this.colorPalette.length;
          const color = this.colorPalette[colorIndex];

          return {
            label: productsMap[productId] || `Product ${productId}`,
            data: dates.map(date => values[date] || 0),
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1,
          };
        })
      };


      this.chartDataLine = {
        labels: dates,
        datasets: [
          {
            label: 'Total Sold',
            data: dates.map(date => groupedByDate[date] || 0),
            fill: false,
            borderColor: '#ff0037',
            backgroundColor: '#ff0037',
            tension: 0.1,
            pointRadius: 4,
            pointHoverRadius: 6,
          }
        ]
      };

      this.loading = false;
    });
  }
}
