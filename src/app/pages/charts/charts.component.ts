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

  chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: 'white'
        }
      },
      title: {
        display: true,
        text: 'Sales Data',
        color: 'white',
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#000',
        bodyColor: '#000',
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        }
      },
      y: {
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        }
      }
    }
  };

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
        datasets: Object.entries(groupedByProduct).map(([productId, values]) => ({
          label: productsMap[productId] || `Product ${productId}`,
          data: dates.map(date => values[date] || 0),
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderColor: 'rgba(255, 255, 255, 1)',
          borderWidth: 1,
        }))
      };

      this.chartDataLine = {
        labels: dates,
        datasets: [
          {
            label: 'Total Sold',
            data: dates.map(date => groupedByDate[date] || 0),
            fill: false,
            borderColor: 'rgba(255, 255, 255, 0.8)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
